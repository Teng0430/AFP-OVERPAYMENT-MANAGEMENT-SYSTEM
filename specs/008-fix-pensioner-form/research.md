# Research: Fix Add Pensioner & Multi-Component Overpayment Computation

## Unknown 1: Add Pensioner "Unable to Connect" Root Cause

- **Decision**: The root cause is a request payload mismatch between frontend and backend. The frontend sends fields in camelCase (or a structure that doesn't match the backend's expected snake_case form request). The fix involves aligning the frontend payload structure with the backend's `StorePensionerRequest` validation rules — specifically ensuring `agency_deductions` is sent as an array of `{agency_name, amount}` objects (not the old `agency_deduction` scalar), and that `crediting_agency` is included.
- **Rationale**: The error manifests as a generic network failure because the frontend catches any non-2xx response as a connection error. The actual cause is a 422 validation error from the backend that gets swallowed by the catch-all handler. Fixing the payload alignment and improving the error handler to surface validation errors resolves both the symptom and the diagnostic issue.
- **Alternatives considered**:
  - CORS issue: Already configured correctly from feature 001/003, confirmed working for auth endpoints.
  - Server outage/network: Other API calls (login, dashboard) work, ruling out connectivity.
  - Timeout: The request completes quickly but returns 422, so timeout is not the issue.

## Unknown 2: Crediting Agency Storage Strategy

- **Decision**: Store `crediting_agency` as a boolean field in the `agency_deductions` JSON array entries (`{agency_name, amount, crediting_agency: true/false}`). Also store the crediting agency name in a dedicated column `crediting_agency_name` (nullable string) on the `pensioners` table for efficient querying.
- **Rationale**: The JSON array is the natural home for per-agency metadata. The additional column allows fast filtering/reporting without JSON extraction. Both are kept in sync during writes.
- **Alternatives considered**:
  - Separate `crediting_agency` join table: over-normalized for 1:1 relationship.
  - Flag only in JSON without column: requires JSON extraction for every query, slow at scale.
  - Computed as "first row in JSON array": fragile if row ordering changes.

## Unknown 3: Multi-Component Overpayment — Net Pension vs Per-Agency

- **Decision**: The computation engine exposes three layers:
  1. `computeOverpaymentFactors(dateOfDeath, lastPayment)` — returns shared date factors: `{wholeMonths, fractionalDays, dailyRate, daysInMonth, startDate, endDate}`
  2. `computeComponentOverpayment(monthlyAmount, factors)` — applies factors to any monthly amount (net pension or agency deduction): `{wholeMonthsAmount, fractionalAmount, total}`
  3. `computeFullBreakdown(grossPension, deductions[], factors)` — orchestrates: net pension computation, per-agency computation, grand total

  The grand total is mathematically equivalent to Gross Pension × factors.
- **Rationale**: Separating date factors from amount computations avoids redundant date arithmetic. Each agency's overpayment is simply `deductionAmount × sameFactors`. The net pension overpayment uses the same factors on Net Monthly Pension.
- **Alternatives considered**:
  - Monolithic function returning all values at once: harder to test, less reusable.
  - Compute each agency independently with full date arithmetic: redundant work for the same date range.

## Technology: Per-Agency Computation on Frontend

- **Decision**: Frontend computation is extended with the new layered functions in `financial-calculations.ts`. The `OverpaymentComputationBreakdown` component is refactored to display per-agency breakdowns and the grand total.
- **Rationale**: Matches existing pattern from feature 007. Pure functions for real-time preview, PHP service for server-side persistence. The PHP service also needs updating to compute per-agency amounts.
- **Alternatives considered**:
  - Compute only on backend: 500ms real-time target requires frontend computation.
  - Shared computation library: not warranted for this project size.

## Technology: Agency Row Reordering

- **Decision**: The agency deduction repeater component supports drag-and-drop reordering via a simple up/down button per row (no drag-and-drop library needed). The `creditingAgency` flag persists on the original first row regardless of position changes.
- **Rationale**: Up/down buttons are simpler to implement and more accessible than drag-and-drop. The flag persistence rule (Q2 clarification) means the UI must visually indicate which row is the crediting agency at all times.
- **Alternatives considered**:
  - Drag-and-drop: requires additional library (dnd-kit), accessibility complexity.
  - No reordering: rejected by Q2 clarification.
