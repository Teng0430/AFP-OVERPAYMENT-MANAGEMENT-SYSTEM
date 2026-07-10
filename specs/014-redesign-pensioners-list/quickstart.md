# Quickstart: Redesign Pensioners List Validation Guide

**Date**: 2026-07-10 | **Plan**: plan.md | **Spec**: spec.md

## Prerequisites

- Backend running (`cd apps/backend && php artisan serve`)
- Frontend dev server running (`cd apps/frontend && npm run dev`)
- Database migrated and seeded with test data

## Validation Scenarios

### 1. Verify Date Format

1. Navigate to Pensioners List (`/pensioners`)
2. Check the "Last Payment" column
3. **Expected**: Dates displayed in application's standard format (e.g., "March 31, 2026"), never raw timestamps
4. **Pass criterion**: No raw ISO 8601 timestamps visible anywhere on the page

### 2. Verify Overpayment Value

1. Navigate to Pensioners List
2. Note the "Overpayment" value for any pensioner
3. Navigate to View modal for the same pensioner
4. Compare "Overpayment Total" with the list value
5. **Expected**: Both values are identical
6. **Pass criterion**: Overpayment value in list equals the value in the detailed view

### 3. Verify Balance Value

1. Navigate to Pensioners List
2. Note the "Balance" value for any pensioner
3. **Expected**: Balance = Overpayment − Collected
4. Confirm by checking the formula with the same pensioner's data
5. **Pass criterion**: Balance is correctly computed as overpayment minus collected, displayed directly from backend

### 4. Verify Agency Display

1. Navigate to Pensioners List
2. Check the "Agencies" column
3. **Expected**: Comma-separated list of agency names (e.g., "LPB, ALIP, AFPSLAI")
4. **Pass criterion**: No "N agency(ies)" format visible anywhere

### 5. Verify Actions

1. Click View icon → Verify PensionerViewModal opens with all sections
2. Click Edit icon → Verify EditPensionerPage loads with prepopulated data
3. Click Print icon → Verify PensionerPrintView opens with printable summary
4. Click Delete icon → Verify confirmation dialog appears
5. Confirm delete → Verify pensioner is removed and table refreshes

### 6. Verify Responsive Table

1. Resize browser to 1920px width → All columns visible without overflow
2. Resize to 1366px → Horizontal scroll appears if needed
3. Resize to 768px → Horizontal scroll active, no overlapping content
4. Resize to 375px → Table usable via scroll, no clipped buttons

### 7. Verify Search, Sort, Pagination

1. Type in search box → Results filter correctly
2. Click column headers → Records sort ascending/descending
3. Navigate pages → Correct subset of records displayed

## Test Commands

```bash
# Backend tests
cd apps/backend && php artisan test

# Frontend tests
cd apps/frontend && npm test

# Type check
cd apps/frontend && npx tsc --noEmit

# Lint
cd apps/frontend && npm run lint
```

See [data-model.md](./data-model.md) for entity details and [spec.md](../spec.md) for full requirements.
