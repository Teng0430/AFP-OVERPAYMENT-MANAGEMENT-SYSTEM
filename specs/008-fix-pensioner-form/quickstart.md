# Quickstart: Fix Add Pensioner & Multi-Component Overpayment

## Prerequisites

- Backend running: `cd apps/backend && php artisan serve`
- Frontend dev server: `cd apps/frontend && npm run dev`
- Database migrated: `cd apps/backend && php artisan migrate`

## Validation Scenarios

### Scenario 1: Add Pensioner Form Submits Successfully

1. Open the Add Pensioner form at `/pensioners/create`
2. Fill all required fields: Rank, Name, Serial Number, Date of Death/ Due Date, Last Payment, Cause of Stoppage, Agency Name, Gross Monthly Pension, Amount Collected, Status
3. Add at least one agency deduction in the dynamic repeater
4. Verify the first deduction row is marked as "Crediting Agency"
5. Submit the form
6. **Expected**: Success confirmation. Record is saved and retrievable from the pensioners list.

### Scenario 2: Form Shows Validation Errors

1. Open the Add Pensioner form
2. Set Last Payment to a date before Date of Death
3. Submit
4. **Expected**: Field-level error shown for Last Payment — not a generic "Unable to connect" message.

### Scenario 3: Multi-Component Computation Display

1. Create a pensioner with:
   - Gross Pension: 100,000
   - Date of Death: 15-Jan-2026
   - Last Payment: 31-Mar-2026
   - Agencies: LBP (crediting, 2,000), ALIP (10,000), PVB (5,000)
2. **Expected**: The computation breakdown shows:
   - Net Monthly Pension: 83,000.00
   - LBP Overpayment: computed on 2,000
   - ALIP Overpayment: computed on 10,000
   - PVB Overpayment: computed on 5,000
   - Grand Total Overpayment: displayed

### Scenario 4: Real-Time Computation Update

1. Enter Date of Death and Last Payment
2. Enter Gross Monthly Pension
3. Add a few agency deductions with amounts
4. Change any value
5. **Expected**: All computed values update within 500ms

### Scenario 5: Agency Reordering

1. Add 3 agency deduction rows
2. Note which one is marked as crediting agency (first row)
3. Reorder rows using up/down buttons
4. **Expected**: The crediting agency flag stays on the original first entry regardless of its new position.

### Scenario 6: Validation — Deductions Exceed Gross

1. Set Gross Monthly Pension to 50,000
2. Add agency deductions totaling 60,000
3. **Expected**: Validation error shown — net pension cannot be negative.

### Scenario 7: Leap Year Handling

1. Create a pensioner with:
   - Date of Death: 01-Feb-2024
   - Last Payment: 31-Mar-2024
2. **Expected**: Daily rate uses 29 days for February (leap year).

## Running Tests

```bash
# Backend tests
cd apps/backend && php artisan test --filter="Pensioner"

# Frontend tests
cd apps/frontend && npm test -- --run

# Type check
cd apps/frontend && npx tsc --noEmit

# Lint
cd apps/frontend && npm run lint

# Backend static analysis
cd apps/backend && vendor/bin/phpstan analyse --level=6

# Backend style
cd apps/backend && vendor/bin/pint --test
```

## API Contracts

See [contracts/README.md](contracts/README.md) for request/response payload structure.
