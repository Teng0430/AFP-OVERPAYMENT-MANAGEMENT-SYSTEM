# Research: Redesign Pensioners List - Root Cause Analysis

**Date**: 2026-07-10 | **Plan**: plan.md

---

## Issue 1 — Last Payment Date Format

### Root Cause

The `Last Payment` column in `PensionersPage.tsx:201-203` uses `formatDisplayDate(row.original.last_payment)`. The API at `PensionerResource.php:26` returns the raw date string (`"2026-03-31T00:00:00.000000Z"` via Carbon serialization). The `formatDisplayDate` helper in `financial-calculations.ts:216-223` correctly converts this to DD-MM-YYYY format. If the format is not the application's chosen standard, the helper needs updating.

**Stack trace**:
- DB: `pensioners.last_payment` (DATE column) → `2026-03-31`
- API: `PensionerResource.php:26` → `'last_payment' => $this->last_payment` (Carbon ISO 8601)
- Frontend: `formatDisplayDate()` → `DD-MM-YYYY` format

### Decision

The `formatDisplayDate` utility already exists and works correctly. If the spec requires "Month DD, YYYY" (e.g., "March 31, 2026"), update `formatDisplayDate` to use `toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` or equivalent. Alternatively, the API now provides `last_payment_formatted` in `PensionerResource.php:27-29` which uses `Carbon::format('F d, Y')` producing "March 31, 2026". Use a shared formatter consistently: adopt `last_payment_formatted` from API (backend-sourced formatted date) to ensure all date displays match.

---

## Issue 2 — Incorrect Overpayment Computation

### Root Cause (Critical Bug)

The `overpayment_total` attribute in `Pensioner.php:175-179` uses **name-based grouping**:

```php
public function getOverpaymentTotalAttribute(): float
{
    return (float) static::where('name', $this->name)
        ->get()
        ->sum(fn (self $p) => $p->overpayment_subtotal);
}
```

This queries ALL pensioners with the same name and sums their `overpayment_subtotal` values. When multiple pensioners share the same name (common in military/pension systems), this produces an **incorrect** overpayment value. The correct formula per the spec is:

```
Overpayment = Monthly Pension × Number of Months Overpaid
```

Which equals `overpayment_subtotal` for the individual record. The name-based aggregation introduces duplicate counting and cross-record contamination.

**Additional findings**:
- The `OverpaymentCalculationService::overpaymentTotal()` is never directly called from the model's computed attribute — the model bypasses it with its own `static::where('name', ...)` query.
- The multi-component model (`grand_total_overpayment`) computes correctly as `netPensionOverpayment + SUM(agencyOverpayments)`, which mathematically equals the gross `overpaymentAmount(grossMonthlyPension)`.

### Decision

**Fix**: Change `getOverpaymentTotalAttribute()` to return the individual pensioner's `overpayment_subtotal` or the multi-component `grand_total_overpayment`. Choose `grand_total_overpayment` since it includes the agency-level breakdown and matches the multi-component computation model used elsewhere. Ensure `overpayment_total === grand_total_overpayment` (they should be mathematically identical).

---

## Issue 3 — Incorrect Balance

### Root Cause

The `balance` attribute in `Pensioner.php:182-184` uses the buggy `overpayment_total`:

```php
public function getBalanceAttribute(): float
{
    return $this->overpayment_total - $this->amount_collected;
}
```

Since `overpayment_total` is inflated by name-based grouping, `balance` is also incorrect. The formula itself is correct:

```
Balance = Overpayment − Amount Collected
```

### Decision

Fix the root cause (Issue 2). Once `overpayment_total` is correct, `balance` will automatically be correct. No separate change needed for the balance formula. Add a test verifying balance is computed as `overpayment_total - amount_collected`.

---

## Issue 4 — Synchronize with Add Pensioner Form

### Root Cause

Verified every field mapping:

| Field | API Field | Frontend Column | Status |
|-------|-----------|-----------------|--------|
| Rank | `rank` | `accessorKey: 'rank'` | ✅ |
| Name | `name` | `accessorKey: 'name'` | ✅ |
| Serial Number | `serial_number` | `accessorKey: 'serial_number'` | ✅ |
| Agency | `agency_name` | `accessorKey: 'agency_name'` | ✅ |
| Last Payment | `last_payment` | `cell: formatDisplayDate(...)` | ✅ (with formatting) |
| Monthly Pension | `monthly_pension` | `cell: formatCurrency(...)` | ✅ |
| Cause | `cause_of_stoppage` | `accessorKey: 'cause_of_stoppage'` | ✅ |
| Agencies | `agency_deductions` | Custom cell (names + tooltip) | ✅ (Issue 5 fix) |
| Overpayment | `overpayment_total` | `cell: formatCurrency(...)` | ⚠️ Bug in backend (Issue 2) |
| Collected | `amount_collected` | `cell: formatCurrency(...)` | ✅ |
| Balance | `balance` | `cell: formatCurrency(...)` | ⚠️ Cascaded from Issue 2 |
| Status | `status` | Custom cell (Badge) | ✅ |

Only Issues 2/3 affect field synchronization. All other fields display correctly.

### Decision

Fix Issues 2 and 3 in backend, then verify all fields match the Add Pensioner form data.

---

## Issue 5 — Display All Agencies

### Root Cause

Current code in `PensionersPage.tsx:204-211` already shows comma-separated agency names with tooltip details. This was fixed in a previous iteration (012). No further changes needed for basic agency display.

### Decision

Existing implementation is correct. If the spec requires more detailed agency info (crediting vs non-crediting, summary counts), add an agency summary section.

---

## Issue 6 — Data Does Not Fit on Screen

### Root Cause

The `<Table>` component in `PensionersPage.tsx:445` is not wrapped in a horizontal scroll container. With 14+ columns, the table exceeds viewport width at standard sizes. There is no `overflow-x-auto` wrapper.

**Current layout**:
```
<Card>
  <CardContent className="p-0">
    <Table>    ← No scroll wrapper
    ...
    </Table>
  </CardContent>
</Card>
```

### Decision

Wrap `<Table>` in `<div className="overflow-x-auto">`. Set `min-width` on key columns, use `whitespace-nowrap` and `text-ellipsis` on long content cells. Add tooltips for truncated content.

---

## Issue 7 — Add Viewing Options

### Root Cause

The Actions column in `PensionersPage.tsx:243-298` already includes all four actions (View, Edit, Print, Delete) with proper icons and routing:

- **View**: Opens `PensionerViewModal` via `setViewModalId(row.original.id)` 
- **Edit**: Navigates to `/pensioners/${id}/edit` where `EditPensionerPage` exists
- **Print**: Opens `PensionerPrintView` in new window via `handlePrint(id)`
- **Delete**: Uses `AlertDialog` pattern with confirmation

All four components and routes already exist from the 012 implementation.

### Issues Found

1. **Delete AlertDialog pattern**: The AlertDialog trigger `onClick` in each row sets `deleteConfirmId`, but the AlertDialog manages its own open state. The `onClick={() => setDeleteConfirmId(row.original.id)}` on the AlertDialogTrigger is redundant and can cause race conditions. A better pattern: remove the `onClick` from the trigger, use a single AlertDialog controlled by state, or use the built-in `onOpenChange` handler.

2. **PensionerViewModal**: Already exists and works correctly at `components/pensioner/PensionerViewModal.tsx`. Shows all required sections: Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status. Add "Supporting Documents", "Timeline", and "Audit History" sections if those features exist in the codebase.

3. **EditPensionerPage**: Already exists and works correctly at `pages/EditPensionerPage.tsx`. Reuses AddPensioner layout with prepopulated data.

4. **PensionerPrintView**: Already exists and works correctly at `components/pensioner/PensionerPrintView.tsx`. Includes all required sections.

### Decision

Fix the AlertDialog pattern for single-record deletion. Enhance PensionerViewModal with additional sections if available. All other actions are functional.

---

## Issue 8 — Table Improvements

### Root Cause

Current table in `PensionersPage.tsx`:
- Uses `@tanstack/react-table` with sorting via `getSortedRowModel()`
- Uses manual pagination via `getPaginationRowModel()` with `manualPagination: true`
- Has search (Name, Serial #, Account #) with server-side filtering
- Has rank, status, agency, and cause filter dropdowns
- **Missing**: Frozen/sticky columns, column visibility selector, page number navigation

### Decision

- Add sticky positioning to Selection, Name, Serial Number, and Actions columns using CSS `position: sticky` with appropriate z-index and background
- Improve pagination with page number buttons (not just Previous/Next)
- Add column visibility toggle as an enhancement

---

## Issue 9 — Responsive Design

### Root Cause

No responsive table wrapper. The filter card uses `flex-wrap` but at mobile sizes the table still overflows with no scrollbar.

### Decision

- Add `overflow-x-auto` wrapper to table
- Make filter card controls fully responsive with `flex-wrap` and width adjustments
- Test at 1920px, 1366px, 768px, and 375px breakpoints

---

## Issue 10 — Data Integrity

### Root Cause

Two verified data integrity issues:

1. **Backend**: `getOverpaymentTotalAttribute()` (Issue 2) uses name-based grouping producing incorrect values
2. **Frontend**: No frontend recalculations exist — all financial values come from the API

No other data integrity issues found.

### Decision

Fix Issue 2 in backend. Frontend already correctly reads all values from API without recalculation.

---

## Summary of Changes Required

| Issue | Type | Backend | Frontend | Tests |
|-------|------|---------|----------|-------|
| 1. Date format | Frontend | None | Update `formatDisplayDate` or use `last_payment_formatted` | Update snapshots |
| 2. Overpayment bug | **Backend** | **`Pensioner.php` → `getOverpaymentTotalAttribute()`** | None | **New computation tests** |
| 3. Balance bug | Backend | Cascaded fix from Issue 2 | None | Verification tests |
| 4. Field sync | Verification | None | None | Integration tests |
| 5. Agency display | Frontend | None | Already fixed (012) | Update snapshots |
| 6. Table overflow | Frontend | None | Add `overflow-x-auto` wrapper | Responsive tests |
| 7. Actions | Frontend | None | Fix AlertDialog pattern; enhance View modal | Component tests |
| 8. Frozen columns | Frontend | None | Add sticky CSS + page numbers | Visual tests |
| 9. Responsive | Frontend | None | Add scroll wrapper + responsive filters | Visual tests |
| 10. Data integrity | Backend | Fix Issue 2 root cause | Verification | Integration tests |
