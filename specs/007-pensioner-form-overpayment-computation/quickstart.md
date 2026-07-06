# Quickstart Validation Guide

## Prerequisites

- Backend dev server running (`apps/backend: php artisan serve`)
- Frontend dev server running (`apps/frontend: npm run dev`)
- Database migrated and seeded

## Setup

```bash
cd apps/backend
php artisan migrate
```

## Validation Scenarios

### Scenario 1: Standard Overpayment Computation

1. Navigate to **Add Pensioner** (`/pensioners/add`)
2. Fill in:
   - Rank: `LCDR`
   - Name: `Test Pensioner`
   - Serial Number: `TEST-001`
   - Date of Death: `2026-01-15`
   - Cause of Stoppage: `Late Death Reporting`
   - Agency Name: `LBP`
   - Monthly Pension: `30000`
   - Last Payment: `2026-03-31`
   - Agency Deductions: Add 2 entries
3. **Expected**: Computation display shows:
   - Start Date: `2026-01-16`
   - End Date: `2026-03-31`
   - Whole Months: `2`
   - Fractional Days in Month: `16`
   - Total Overpayment Days: `75`
   - Daily Pension Rate: `₱967.74`
4. Submit the form
5. Verify the pensioner appears in the list with correct computed values

### Scenario 2: Agency Deduction Repeater

1. Open Add Pensioner form
2. Verify one deduction row is displayed by default
3. Click **Add Agency** 9 times
4. **Expected**: 10 rows max — Add Agency button is disabled
5. Remove rows until only one remains
6. **Expected**: Remove button is disabled on the last row

### Scenario 3: Form Validation

1. Set Last Payment to a date before Date of Death
2. **Expected**: Validation error shown
3. Set Monthly Pension to `0`
4. **Expected**: Validation error shown
5. Enter a negative deduction amount
6. **Expected**: Validation error shown

### Scenario 4: Label Rename

1. Open Add Pensioner form
2. **Expected**: "Fractional Days in Month" label appears in the computation breakdown
3. Open the pensioner list page
4. Check column headers for any reference to this field
5. Generate a report
6. **Expected**: "Fractional Days in Month" label used everywhere

### Scenario 5: Leap Year Handling

1. Enter Date of Death: `2024-02-01`
2. Enter Last Payment: `2024-02-29`
3. Monthly Pension: `30000`
4. **Expected**: Daily Rate = `30000 / 29 = ₱1,034.48` (February 2024 has 29 days)
5. Whole Months: `0`, Fractional Days: `28`, Total Days: `29`

### Scenario 6: Same-Month Computation

1. Date of Death: `2026-03-15`
2. Last Payment: `2026-03-31`
3. **Expected**: Whole Months: `0`, Fractional Days: `16`, Total Days: `17`

### Scenario 7: End-of-Month Boundary

1. Date of Death: `2026-01-31`
2. Last Payment: `2026-03-31`
3. Start Date: `2026-02-01`
4. Whole Months: `1` (Feb 1 → Mar 1, then 30 fractional days = Mar 2 → Mar 31)
5. Total Days: `59`

## Running Tests

```bash
# Backend
cd apps/backend && php artisan test --filter="Overpayment"

# Frontend
cd apps/frontend && npx vitest run --reporter=verbose
```
