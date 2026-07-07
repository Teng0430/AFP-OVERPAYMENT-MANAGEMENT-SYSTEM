# Quickstart: Update Computation Logic for Breakdown and Summary

## Prerequisites

- Backend running: `cd apps/backend && php artisan serve`
- Frontend running: `cd apps/frontend && npm run dev`
- Database migrated: `cd apps/backend && php artisan migrate`

## Validation Scenarios

### Scenario 1: Total Agency excludes Crediting Agency

1. Create a pensioner with multiple agency deductions:
   - Monthly pension: 30,000
   - Agency deductions: LBP (5,000, crediting), AFPSLAI (3,000), PVB (2,000)
2. Verify in the Pension Summary section:
   - **Total Agency** = 5,000 (only non-crediting deductions: 3,000 + 2,000)
   - **Net Monthly Pension** = 25,000 (30,000 - 5,000)

### Scenario 2: Final Summary shows only Grand Total

1. View any pensioner with computation data
2. Verify the **Final Summary** section contains exactly one row:
   - **Grand Total Overpayment** — present
   - Net Pension Overpayment — absent
   - Total Agency Overpayments — absent

### Scenario 3: Edge case — all deductions are Crediting Agency

1. Create a pensioner with single deduction marked as crediting
2. Verify:
   - **Total Agency** = 0
   - **Net Monthly Pension** = Gross Monthly Pension
   - **Final Summary** shows only Grand Total Overpayment

## Running Tests

```bash
# Backend tests
cd apps/backend && php artisan test --filter="OverpaymentComputation"

# Frontend tests
cd apps/frontend && npm test
```

## Expected Test Outcomes

All existing tests should continue to pass since no computation logic or API response shape has changed. The only change is in the frontend component rendering.
