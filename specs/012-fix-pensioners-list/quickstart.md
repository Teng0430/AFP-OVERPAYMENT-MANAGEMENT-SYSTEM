# Quickstart: Fix Pensioners List Validation Guide

**Date**: 2026-07-10 | **Plan**: plan.md | **Spec**: spec.md

## Prerequisites

- Backend: PHP 8.2+, Composer 2.x, Laravel 11 configured
- Frontend: Node.js 22.x, npm 11.x
- Database: MySQL 8.4 or SQLite (for tests)

## Setup

```bash
# Backend
cd apps/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Frontend
cd apps/frontend
npm install
```

## Validation Scenarios

### Scenario 1: Last Payment Date Format

1. Create a pensioner with a `last_payment` date via the Add Pensioner form
2. Navigate to the Pensioners List page
3. **Expected**: The Last Payment column shows a formatted date (e.g., "March 31, 2026" or "03/31/2026")
4. **Expected**: No raw ISO timestamps (e.g., "2026-03-31T00:00:00.000000Z") appear

### Scenario 2: Overpayment Value Accuracy

1. Create a pensioner with known values:
   - Monthly Pension: 10,000
   - Date of Death: 2026-01-15
   - Last Payment: 2026-03-31
2. **Expected**: Overpayment = `(2 months × 10,000) + (15 fractional days × 10,000/31)` = 20,000 + 4,838.71 = 24,838.71
3. Verify the Overpayment column in the list matches this value exactly

### Scenario 3: Balance Accuracy

1. Create a pensioner with Amount Collected: 5,000
2. **Expected**: Balance = Overpayment - 5,000
3. Verify the Balance column matches this value

### Scenario 4: Agency Display

1. Create a pensioner with multiple agency deductions (e.g., LPB, ALIP, AFPSLAI)
2. **Expected**: The Agencies column shows the agency names (not just a count)
3. Verify all agencies are visible without needing to click into the record

### Scenario 5: View Action

1. Click the View (eye icon) button on a pensioner row
2. **Expected**: A modal opens displaying all pensioner information
3. Verify sections: Personal Information, Agency Information, Overpayment Details, Collections
4. Verify loading state appears while data is fetched
5. Verify modal can be closed

### Scenario 6: Edit Action

1. Click the Edit (pencil icon) button on a pensioner row
2. **Expected**: Navigated to an edit form (same layout as Add Pensioner form)
3. Verify all fields are prepopulated with existing data
4. Modify a field and save
5. Verify the list refreshes with updated data

### Scenario 7: Print Action

1. Click the Print (printer icon) button on a pensioner row
2. **Expected**: A new browser window/tab opens with the printable summary
3. Verify content includes: Header, AFP Pension Overpayment Monitoring System, Pensioner Details, Agency Summary, Financial Summary, Generated Date
4. Verify browser print dialog appears (or Ctrl+P works)

### Scenario 8: Delete Action

1. Click the Delete (trash icon) button on a pensioner row
2. **Expected**: A confirmation dialog appears: "Are you sure you want to delete this pensioner?"
3. Cancel: Dialog closes, nothing deleted
4. Confirm: Record is deleted, table refreshes, record no longer appears

### Scenario 9: Frozen Columns

1. Scroll the table horizontally
2. **Expected**: Selection checkbox, Name, Serial Number, and Actions columns remain visible (frozen/sticky)
3. Verify no visual glitches at frozen column boundaries

### Scenario 10: Responsive Behavior

Test at different viewport widths:
- **Desktop (1920px)**: All columns visible with no horizontal scroll
- **Laptop (1366px)**: All columns visible or scrollable
- **Tablet (768px)**: Horizontal scrollbar appears, table is usable
- **Mobile (375px)**: Horizontal scrollbar appears, no overlapping or clipped content

### Scenario 11: Search and Filters

1. Type a search term in the search box and press Enter
2. **Expected**: Table filters to matching records
3. Select a rank/status/agency filter and click Apply
4. **Expected**: Table narrows to matching records
5. Clear filters
6. **Expected**: Full list restores

### Scenario 12: Sorting

1. Click the Rank column header
2. **Expected**: Records sort by rank ascending
3. Click again
4. **Expected**: Records sort by rank descending
5. Test with Name, Agency, Balance, Status, Last Payment columns

### Scenario 13: Pagination

1. Create 25+ pensioner records
2. **Expected**: Pagination controls show page numbers
3. Click page 2
4. **Expected**: Records 11-20 shown (or configurable per page)

## Regression Testing

```bash
# Backend
cd apps/backend && php artisan test

# Frontend
cd apps/frontend && npm test

# TypeScript check
cd apps/frontend && npx tsc --noEmit

# Lint
cd apps/frontend && npm run lint

# Static analysis
cd apps/backend && vendor/bin/phpstan analyse --level=6

# Style
cd apps/backend && ./vendor/bin/pint
```

## Expected Test Results

- Backend tests: All passing (existing + new)
- Frontend tests: All passing (existing + new)
- TypeScript: Strict mode compiles with no errors
- ESLint: No violations
- PHPStan Level 6: Zero errors
- Pint: PSR-12 compliant
