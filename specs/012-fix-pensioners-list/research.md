# Research: Fix Pensioners List - Root Cause Analysis

**Date**: 2026-07-10 | **Plan**: plan.md

---

## Issue 1 — Last Payment Date Format

### Root Cause
The `Last Payment` column in `PensionersPage.tsx:176` uses `accessorKey: 'last_payment'` with no cell formatter. The API returns the raw date string from the DB column, which is a `date` type but formatted as `YYYY-MM-DD` by PHP. On the frontend, React renders this raw string directly without any formatting.

**Stack trace**:
- DB: `pensioners.last_payment` (DATE column) → `2026-03-31`
- API: `PensionerResource.php:26` → `'last_payment' => $this->last_payment` (returns `"2026-03-31T00:00:00.000000Z"` because Carbon serializes dates to ISO 8601 by default in Laravel JSON responses)
- Frontend: `PensionersPage.tsx:176` → `{ accessorKey: 'last_payment', header: 'Last Payment' }` (no formatter, renders raw string)

### Decision
Add a `formatDisplayDate` utility function in `financial-calculations.ts` and apply it in the `last_payment` column cell formatter.

### Alternatives Considered
- Backend-only formatting via accessor in `PensionerResource.php` — would work but dates may need formatting in multiple places
- Use `toLocaleDateString()` directly — inconsistent locale handling

---

## Issue 2 — Incorrect Overpayment Computation

### Root Cause
The `overpayment_total` column in `PensionersPage.tsx:190-192` reads `row.original.overpayment_total` from the API response. This value comes from the `Pensioner` model's `overpayment_total` computed attribute, which calls `OverpaymentCalculationService::overpaymentTotal()`. The computation logic has been refined across specs 007→010 and is now correct.

**Potential root causes investigated**:
- **Duplicate months counted**: ✅ No — `wholeMonths` and `fractionalDays` are computed once from `date_of_death` and `last_payment`
- **Agencies counted multiple times**: ✅ No — agency overpayments are computed separately from the gross pension overpayment; the grand total is mathematically identical to `componentOverpayment(gross)`
- **Old values cached**: ✅ No — computed attributes run fresh on every request
- **Frontend recalculates incorrectly**: ✅ No — the list page does NOT call any frontend computation; it displays the API value directly

### Decision
No code change needed for the backend computation itself. Add verification tests in `PensionerListTest.php` to confirm `overpayment_total` matches the expected formula.

### Alternatives Considered
- Recomputing on frontend: Rejected per FR-004 (must use authoritative backend source)
- Adding debug endpoint for validation: Unnecessary — existing computations are verified

---

## Issue 3 — Incorrect Balance

### Root Cause
The `balance` column in `PensionersPage.tsx:200-202` reads `row.original.balance` from the API response. This value comes from `PensionerResource.php:64` → `$this->balance` → `Pensioner` model's `balance` computed attribute → `OverpaymentCalculationService::balance($overpaymentTotal, $amountCollected)`.

Formula verified: `balance = overpayment_total - amount_collected`. Both values are from the database and computed server-side.

**No frontend recalculation exists** for balance in `PensionersPage.tsx`.

### Decision
No code change needed for the backend. Add verification tests.

---

## Issue 4 — Synchronize with Add Pensioner Form

### Root Cause All fields are verified to match the Add Pensioner form fields:

| Field | Source | Verified |
|-------|--------|----------|
| Rank | `PensionerResource.rank` | ✅ |
| Name | `PensionerResource.name` | ✅ |
| Serial Number | `PensionerResource.serial_number` | ✅ |
| Agency | `PensionerResource.agency_name` | ✅ |
| Last Payment | `PensionerResource.last_payment` (needs formatting) | ⚠️ Issue 1 |
| Monthly Pension | `PensionerResource.monthly_pension` (cast to float) | ✅ |
| Cause | `PensionerResource.cause_of_stoppage` | ✅ |
| Agencies | `PensionerResource.agency_deductions` (shows count only) | ⚠️ Issue 5 |
| Overpayment | `PensionerResource.overpayment_total` | ✅ Issue 2 |
| Collected | `PensionerResource.amount_collected` (cast to float) | ✅ |
| Balance | `PensionerResource.balance` | ✅ Issue 3 |
| Status | `PensionerResource.status` | ✅ |

### Decision
Fix issues 1 and 5 only. All other fields are already correct.

---

## Issue 5 — Display All Agencies

### Root Cause
`PensionersPage.tsx:177-183` shows `${deps.length} agency(ies)` instead of the actual agency names. The data IS available in `row.original.agency_deductions` (array of `{agency_name, amount, crediting_agency}` objects).

### Decision
Change the cell renderer to display agency names separated by line breaks or commas, with a tooltip for the full breakdown. Show a badge/list of agency name pills.

### Alternatives Considered
- Separate column per agency: Not scalable (max 10 agencies)
- Dropdown or expandable row: Adds complexity
- Comma-separated names in cell with tooltip: Best balance of information density and table readability

---

## Issue 6 — Data Does Not Fit on Screen

### Root Cause
`PensionersPage.tsx:380-411` uses the shadcn/ui `Table` component directly without a scroll container. With 12+ columns (including checkbox, actions), the table naturally exceeds the viewport width at standard screen sizes. No `overflow-x-auto` wrapper exists.

### Decision
Wrap the `<Table>` component in a `<div className="overflow-x-auto">` container. Set `min-width` on columns to prevent collapse. Use `white-space: nowrap` and `text-ellipsis` with tooltips for long content.

### Alternatives Considered
- Responsive cards: Too much change from current table UX
- Column visibility selector: Add as enhancement (optional)
- Compact mode: Add as optional toggle

---

## Issue 7 — Add Viewing Options

### Root Cause
Current actions column (`PensionersPage.tsx:213-233`) only shows Edit (pencil) and Delete (trash) buttons. View and Print are missing. Edit navigates to `/pensioners/{id}/edit` which is not defined in `App.tsx`.

### Missing components:
1. **View**: No modal or page exists for viewing full pensioner details
2. **Edit**: Route exists (in nav) but no component — need to create `EditPensionerPage.tsx`
3. **Print**: No printable summary component exists
4. **Delete**: Uses `window.confirm` instead of a proper dialog component

### Decision
- Add View button → opens `PensionerViewModal` (new component)
- Fix Edit button → navigates to `/pensioners/:id/edit` → `EditPensionerPage` (new page)
- Add Print button → opens `PensionerPrintView` (new component) in new window
- Replace `window.confirm` with shadcn/ui `AlertDialog` or custom confirmation dialog

---

## Issue 8 — Table Improvements

### Root Cause
No frozen/sticky columns. Current table uses `@tanstack/react-table` but has no `sticky` CSS. Sorting works but pagination is basic (Previous/Next only).

### Decision
- Add `sticky left-0` CSS to selection, name, serial number, and actions columns with `z-10` and background color
- Improve pagination with page number buttons and page size selector
- Keep existing search and filter functionality (already works)

---

## Issue 9 — Responsive Design

### Root Cause
No responsive considerations in the current table. At viewports below 1024px, the table overflows the card container with no scrollbar. At mobile sizes (<768px), the filter card also becomes cramped.

### Decision
- Add `overflow-x-auto` at the table level
- Make filter card responsive with `flex-wrap` and responsive widths
- Test at 1920px, 1366px, 768px, and 375px breakpoints

---

## Issue 10 — Data Integrity

### Root Cause
No data integrity issues found in the list page. The frontend correctly reads all values from the API response without performing independent calculations. The `financial-calculations.ts` module is only imported and used in `AddPensionerPage.tsx` for live preview during data entry, not in the list page.

### Decision
No code change needed. Document this finding in tests.

---

## Summary of Changes Required

| Issue | Type | Backend | Frontend | Tests |
|-------|------|---------|----------|-------|
| 1. Date format | Frontend | None | `PensionersPage.tsx` + `financial-calculations.ts` | Update snapshot |
| 2. Overpayment | Verification | None | None | `PensionerListTest.php` |
| 3. Balance | Verification | None | None | `PensionerListTest.php` |
| 4. Field sync | Verification | Possibly `PensionerResource.php` | None | Visual |
| 5. Agency display | Frontend | None | `PensionersPage.tsx` | Update snapshot |
| 6. Table overflow | Frontend | None | `PensionersPage.tsx` | Visual |
| 7. View/Edit/Print/Delete | Frontend | None | `PensionersPage.tsx`, `App.tsx`, NEW: `EditPensionerPage`, `PensionerViewModal`, `PensionerPrintView` | New component tests |
| 8. Frozen columns | Frontend | None | `PensionersPage.tsx` | Visual |
| 9. Responsive | Frontend | None | `PensionersPage.tsx` | Visual |
| 10. Data integrity | Verification | None | None | Audit test |

**Total files to modify**: ~8 existing + 3 new = 11 files
