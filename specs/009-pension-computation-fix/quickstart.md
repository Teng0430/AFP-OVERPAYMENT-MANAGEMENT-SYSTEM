# Quickstart Validation Guide: Fix Pensioner Computation & Connection Handling

## Prerequisites

- Backend server running: `cd apps/backend && php artisan serve`
- Frontend dev server running: `cd apps/frontend && npm run dev`
- Database migrated: `cd apps/backend && php artisan migrate`
- Authenticated session with valid Sanctum token

## Scenario 1: Crediting Agency Auto-Computes Correctly

### Setup
1. Open the Add Pensioner form
2. Enter Gross Monthly Pension: **190,000**
3. Add agency deductions:
   - Agency 1: `LBP` (crediting), Amount: `0`
   - Agency 2: `AMWSLAI`, Amount: `10,000`
   - Agency 3: `ALIP`, Amount: `15,000`
   - Agency 4: `AFPMBAI`, Amount: `5,000`
4. Fill other required fields

### Expected Outcome
- Crediting Agency Amount (Net Monthly Pension) displays: **160,000**
- Total Agency (non-crediting deductions) displays: **30,000**
- Crediting agency field is read-only (not editable)
- Changing any deduction amount or pension immediately updates all computed values

### Verification
```bash
cd apps/backend && php artisan test --filter="CreditingAgencyComputation"
```

## Scenario 2: Pension Summary Shows Three Rows

### Setup
1. View any pensioner record with agency deductions
2. Navigate to the Pension Summary section

### Expected Outcome
- Exactly three rows displayed: **Gross Monthly Pension**, **Total Agency**, **Net Monthly Pension**
- No "Deductions" row visible
- Net Monthly Pension equals Crediting Agency Amount

### Verification
```bash
cd apps/backend && php artisan test --filter="PensionSummary"
cd apps/frontend && npx vitest run --reporter=verbose -- PensionSummary
```

## Scenario 3: Error Messages Are Distinct

### Setup
1. Ensure frontend dev server is running
2. Stop the backend server

### Expected Outcome
- Submitting the form shows "Connection refused by server. Please check that the API server is running and CORS is configured correctly." (not "Unable to connect")

### Verification
```bash
cd apps/frontend && npx vitest run --reporter=verbose -- ErrorHandling
```

## Scenario 4: Validation Catches Excess Deductions

### Setup
1. Open the Add Pensioner form
2. Enter Gross Monthly Pension: **25,000**
3. Add non-crediting agency deduction: **30,000**

### Expected Outcome
- Form submission shows field-level validation error: "Total non-crediting deductions (30000.00) must not exceed gross monthly pension (25000.00)."

### Verification
```bash
cd apps/backend && php artisan test --filter="NonCreditingDeductionValidation"
```

## Running All Tests

```bash
# Backend
cd apps/backend && php artisan test --filter="Pensioner"

# Frontend
cd apps/frontend && npx vitest run --reporter=verbose
```
