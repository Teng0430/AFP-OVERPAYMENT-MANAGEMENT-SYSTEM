# Research Report: Pensioners List UI & Actions

**Phase**: 0 — Research & Analysis | **Date**: 2026-07-10

## Root Cause Analysis — Issue 1: Page Width Exceeds Viewport

### Investigation Findings

The Pensioners List page (`apps/frontend/src/pages/PensionersPage.tsx`) uses a Card-based layout wrapping the filter section and the table. The root causes of the page-level horizontal scrolling are:

1. **Absence of viewport-constrained wrapper**: The Card containers have no `w-full max-w-full` or `overflow-hidden` constraints, so when contents exceed the available width, the page-level `<div>` does not clip them.

2. **Fixed-width filter inputs**: Five filter controls (Search `min-w-[200px]`, Rank `w-[140px]`, Status `w-[160px]`, Agency `w-[180px]`, Cause `w-[180px]`) plus the Apply button sum to ~860px minimum width. The `flex flex-wrap` container does wrap on small viewports, but the `min-w` values prevent proper shrinking when the container is constrained.

3. **Table content overflow**: The table's `overflow-x-auto` div wraps the `<Table>` component, but excess column widths combine to exceed typical viewport widths. With 14 columns (including select checkbox, rank, name, serial_number, cause, agency, last_payment, agencies, monthly_pension, overpayment, collected, balance, status, actions), the total minimum table width exceeds standard desktop viewports.

4. **No responsive column strategy**: All financial columns use `whitespace-nowrap`, preventing text wrapping. The Rank column at `w-[140px]` and Actions column with four icon buttons at ~200px consume more space than necessary.

### Resolution

- Add `w-full max-w-full overflow-hidden` to the page container `<div>`
- Place the table scroll container with `overflow-x-auto` inside a `w-full` wrapper
- Switch filter layout from `flex flex-wrap` to a responsive CSS grid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3`
- Remove fixed pixel widths on filter Select components, use `w-full` with responsive grid
- Implement the Actions dropdown menu to replace four icon buttons with a single `MoreHorizontal` icon

---

## Root Cause Analysis — Issue 2: Table Layout

### Current State

The table is implemented using `@tanstack/react-table` v8 with manual pagination (`manualPagination: true`). Sticky columns are already implemented with Tailwind classes (`sticky left-0 bg-background z-10` / `sticky right-0 bg-background z-10`) on the select, name, serial_number, and actions columns.

**Sticky column issues**:
- The sticky header row has no `z-20` override, so it can appear beneath sticky columns during vertical scroll
- No box-shadow on sticky columns, causing visual confusion about what is fixed vs scrolling
- Sticky cells do not have background on the table header row, meaning content can show through on horizontal scroll

**Column width issues**:
- Name: `max-w-[180px]` with truncation — adequate
- Cause: `max-w-[150px]` — too narrow for longer cause values
- Agency: `max-w-[120px]` — too narrow for "AFP-RSBS" etc.
- Agencies: `max-w-[200px]` — adequate
- Actions: 4 icon buttons at ~48px each = ~192px — replaced by single dropdown trigger (~40px)

### Resolution

- Add `z-20` to sticky header when cells are also sticky
- Add subtle box-shadow: `shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]` on left-sticky columns, `shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]` on right-sticky
- Ensure `bg-background` is always applied on sticky cells
- Adjust Cause and Agency max-widths to 180px
- Replace 4 action buttons with `PensionerActionsMenu` (DropdownMenu with MoreHorizontal trigger)

---

## Root Cause Analysis — Issue 3: Column Display

**Date format**: `formatDisplayDate` in `financial-calculations.ts` outputs long month format ("March 31, 2026"). The user-spec requests short format ("Mar 31, 2026"). Fix: change `month: 'long'` to `month: 'short'`.

**Truncation**: Name, Cause, Agency, and Agencies columns already use `truncate` with `title` attribute for tooltips. This approach is sound — just needs width adjustments.

**Whitespace**: Multiple columns use `whitespace-nowrap`. While preventing ugly wrapping, this forces the table wider. Text columns with short values (Rank, Serial #, Status) should keep `whitespace-nowrap`. Longer text columns (Cause, Agency) should use `truncate` with a reasonable max-width.

---

## Root Cause Analysis — Issue 5: Filter Responsiveness

**Current**: `flex flex-wrap items-end gap-3` with individual fixed-width children.

**Problem**: On viewports narrower than 768px, the "Agency" and "Cause" selects (both `w-[180px]`) plus "Apply" button cannot fit in one row, causing the flex container to wrap. However, the fixed widths mean that on some viewports, items partially wrap, creating an uneven layout. The search `min-w-[200px]` prevents proper shrinking.

**Resolution**: Switch to responsive CSS grid:
- Mobile (1 col): All filters stack vertically, full width
- Tablet (2 col): 2-column grid
- Desktop small (3 col): 3-column grid  
- Desktop large (5 col): 5-column grid
- All filter inputs use `w-full` (fill grid cell)

---

## Root Cause Analysis — Issue 6: Missing Actions

### View
`PensionerViewModal` (142 lines) exists at `apps/frontend/src/components/pensioner/PensionerViewModal.tsx`. It correctly fetches data via `get(id)` and displays Personal Information, Agency Information, Overpayment Details, Collection History, and Recovery Status. **Missing sections**: Recovery Timeline, Supporting Documents, Audit Information.

### Edit
`EditPensionerPage` (453 lines) exists at `apps/frontend/src/pages/EditPensionerPage.tsx`. Route `/pensioners/:id/edit` is configured in App.tsx. The component pre-populates via `get(id)` API call and updates via `update(id, payload)`.

### Print
`PensionerPrintView` (123 lines) exists at `apps/frontend/src/components/pensioner/PensionerPrintView.tsx`. It has all required sections: AFP header, Pensioner Details, Agency Summary, Financial Summary (Monthly Pension, Overpayment, Amount Collected, Remaining Balance, Status), and Generated Date. **Missing route**: No `/pensioners/:id/print` route in App.tsx.

The component accepts `pensionerId` as a prop, but for the route to work, it needs to accept route params (`useParams`) or be wrapped in a page component that extracts the ID from the URL.

### Delete
Delete uses `AlertDialog` inside `PensionersPage.tsx`. `confirmDelete` calls `remove(id)` from the pensioners service, then refreshes. Error handling sets the `error` state inline. The confirmation dialog text includes "This action cannot be undone" which is not in the spec — should match "Are you sure you want to delete this pensioner?" exactly as specified in FR-014.

---

## Root Cause Analysis — Issue 7: Actions Menu

**Current state**: Four icon buttons (`Eye`, `Pencil`, `Printer`, `Trash2`) per row, consuming ~192px in the actions column. The `DropdownMenu` component from shadcn/ui (Radix-based) already exists in the codebase at `apps/frontend/src/components/ui/dropdown-menu.tsx` but is not used in PensionersPage.

**Resolution**: Create a new `PensionerActionsMenu` component that uses `DropdownMenu` with a `MoreHorizontal` icon trigger. Four items: View (Eye), Edit (Pencil), Print (Printer), Delete (Trash2). The dropdown content should have proper keyboard navigation (Arrow keys, Enter, Escape) built in via Radix.

---

## Root Cause Analysis — Issue 8: UX Improvements

**Notifications**: A `use-toast` hook exists at `apps/frontend/src/hooks/use-toast.ts` with `TOAST_LIMIT = 1` and `TOAST_REMOVE_DELAY = 1000000` (extremely long). The toast system needs:
- A `Toaster` component to render toasts on screen
- Reasonable auto-dismiss delay (e.g., 5000ms)
- Wiring to the PensionersPage for success/error notifications

**Error display**: Currently uses inline `<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">`. This should be replaced by the toast system for non-blocking feedback.

**Loading state**: Already implemented with `<Skeleton>` placeholders. Adequate.

**Empty state**: Already shows "No pensioners found." in the table body when no rows match. Adequate.

**Hover effects**: Table rows have no `hover:` styling. Should add `hover:bg-muted/50 transition-colors`.

---

## Root Cause Analysis — Issue 9: Performance

Current implementation uses:
- `useMemo` for columns (already correct — prevents re-creation on every render)
- `useCallback` for `confirmDelete` (already correct)
- Manual pagination with `page` state — only fetches needed records (efficient)
- `useEffect` re-fetches when `page` or `sorting` changes (correct pattern)

No performance bottlenecks identified for typical dataset sizes. The 014 spec already handled backend N+1 queries. For datasets > 10,000 records, virtual scrolling could be considered, but the current pagination approach is adequate for the expected scale.

---

## Summary of Findings

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Page width > viewport | No container constraints, fixed-width filters, excessive column widths | Viewport-constrained wrapper, responsive grid filters, dropdown actions menu |
| Table layout | Sticky columns missing shadows and z-index layering | Add box-shadow, fix z-index layering on sticky header |
| Column display | Long month format, narrow max-widths on cause/agency | Short month format, adjust max-widths |
| Filter responsiveness | Fixed pixel widths, flex-wrap not grid | Responsive CSS grid for filter controls |
| Actions missing Print route | Route not registered in App.tsx | Add `/pensioners/:id/print` route |
| No toast notifications | Toaster component missing, hook not wired | Create Toaster, wire up to PensionersPage |
| Actions menu | Four icon buttons consume 192px/row | Replace with DropdownMenu (one icon) |
| No mobile card layout | Table always renders as table | Add responsive card layout below 768px |
