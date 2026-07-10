# Validation Guide: Pensioners List UI & Actions

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-10

## Prerequisites

- Backend server running: `cd apps/backend && php artisan serve`
- Frontend dev server running: `cd apps/frontend && npm run dev`
- Test data: At least 20 pensioner records with varied statuses, agencies, and causes
- Auth: Logged in as a user with access to the Pensioners page

## Setup Commands

```bash
# Start backend
cd apps/backend
php artisan serve &
```

```bash
# Start frontend
cd apps/frontend
npm run dev
```

Open `http://localhost:5173/pensioners` in the browser.

---

## Validation Scenarios

### Scenario 1: Page Fits Viewport (SC-001)

1. Open Chrome DevTools (F12)
2. Set viewport to 1366×768 (responsive mode)
3. Navigate to Pensioners page
4. **Expected**: No horizontal scrollbar appears at the browser window level. All columns visible. Content fills available width.
5. Repeat at 1440×900, 1600×900, 1920×1080

### Scenario 2: Sticky Columns Work (SC-004)

1. Scroll the table horizontally
2. **Expected**: Selection checkbox, Name, and Serial Number columns remain fixed on the left. Actions menu remains fixed on the right.
3. Scroll the table vertically
4. **Expected**: Table header row remains fixed at the top.

### Scenario 3: Actions Menu (SC-002, SC-003)

1. Click the three-dot (⋮) icon on any row
2. **Expected**: Dropdown menu opens with four items: View, Edit, Print, Delete
3. Click "View" — **Expected**: Read-only modal opens with Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status, Recovery Timeline, Supporting Documents (if available), and Audit Information
4. Close the modal
5. Click the three-dot icon again, select "Edit" — **Expected**: Edit form opens pre-filled with the pensioner's data
6. Modify a field, save — **Expected**: Changes saved, redirected to Pensioners list, table refreshed with updated data
7. Click the three-dot icon on another row, select "Print" — **Expected**: New tab/window opens with printable Pensioner Summary (AFP header, Pensioner Details, Agency Summary, Financial Summary, Generated Date). Print dialog appears.
8. Click the three-dot icon, select "Delete" — **Expected**: Confirmation dialog displays "Are you sure you want to delete this pensioner?"
9. Click "Cancel" — **Expected**: Dialog closes, no deletion
10. Repeat, click "Delete" — **Expected**: Record deleted, table refreshes, row gone

### Scenario 4: Responsive Filters (SC-005)

1. Resize browser to 375px width (mobile)
2. **Expected**: Filters stack vertically, each takes full width, Apply button is full width
3. Resize to 768px (tablet)
4. **Expected**: Filters in 2-column grid
5. Resize to 1280px (desktop)
6. **Expected**: Filters in 5-column grid

### Scenario 5: Delete Blocked by Related Records (FR-015)

1. Find a pensioner with related records that prevent deletion
2. Click three-dot → Delete → Confirm
3. **Expected**: Error toast notification appears: "Cannot delete this pensioner. [reason]"

### Scenario 6: Date Format (SC-006)

1. Look at the "Last Payment" column
2. **Expected**: All dates display in short month format (e.g., "Mar 31, 2026") — never raw timestamps

### Scenario 7: Truncation with Tooltips (SC-007)

1. Find a row with a long name, cause, or agency name
2. **Expected**: The text is truncated with ellipsis (...)
3. Hover over the truncated text
4. **Expected**: Tooltip shows the full value

### Scenario 8: Toast Notifications

1. Delete a pensioner (three-dot → Delete → Confirm)
2. **Expected**: Success toast appears: "Pensioner deleted successfully"
3. Trigger an error (e.g., try to delete a pensioner with related records)
4. **Expected**: Error (destructive) toast appears with the error message

### Scenario 9: Empty State (FR-020)

1. Apply a filter that matches no records
2. **Expected**: Table shows "No pensioners match the current filters" empty state

### Scenario 10: Mobile Card Layout (SC-009)

1. Resize browser to < 768px width
2. **Expected**: Table is replaced by card-style rows showing Name, Serial #, Status, Balance, and Actions menu

### Scenario 11: Keyboard Accessibility (FR-022)

1. Tab to the three-dot icon on a row
2. Press Enter/Space to open the menu
3. **Expected**: Menu opens, focus moves to first item (View)
4. Press Arrow Down — **Expected**: Focus moves to Edit, then Print, then Delete
5. Press Arrow Up — **Expected**: Focus moves back up
6. Press Enter on any item — **Expected**: Action executes
7. Press Escape — **Expected**: Menu closes, focus returns to trigger

### Scenario 12: Hover Effects (FR-018)

1. Hover over any table row
2. **Expected**: Row background changes subtly (e.g., `bg-muted/50`)

### Scenario 13: Loading State (FR-019)

1. Open browser DevTools → Network tab → throttle to Slow 3G
2. Refresh the Pensioners page
3. **Expected**: Skeleton loading placeholders appear while data is loading

### Scenario 14: Regression — Search, Sort, Pagination (SC-010)

1. Type in the search box, press Enter or click Apply
2. **Expected**: Table filters to matching records
3. Click a column header (Rank, Name, etc.)
4. **Expected**: Table sorts by that column, toggle ascending/descending
5. Use pagination controls
6. **Expected**: Pages navigate correctly, showing correct record ranges

### Scenario 15: Bulk Actions (SC-010)

1. Select multiple rows via checkboxes
2. **Expected**: Bulk action bar appears showing count, Bulk Delete, and Set Status controls
3. Click "Bulk Delete" — confirm
4. **Expected**: Selected records deleted, table refreshes
5. Select rows, use "Set status"
6. **Expected**: Status updated for selected records

## Verification Commands

```bash
# Frontend tests
cd apps/frontend && npm test

# TypeScript check
cd apps/frontend && npx tsc --noEmit

# Lint
cd apps/frontend && npm run lint

# Build
cd apps/frontend && npm run build
```

## Expected Test Results

- `npm test`: All tests passing (existing + any new component tests)
- `npx tsc --noEmit`: Zero TypeScript errors
- `npm run lint`: Zero lint violations
- `npm run build`: Production build succeeds, bundle size within budget
