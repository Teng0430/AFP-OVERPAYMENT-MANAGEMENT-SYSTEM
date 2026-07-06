# Feature Specification: Fix Add Pensioner & Multi-Component Overpayment Computation

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description detailing (1) Add Pensioner form submission failure, (2) crediting agency business rule for the first agency entry, (3) multi-component overpayment computation covering net pension, each individual agency, and a grand total, and (4) updated UI layout showing gross/net pension, per-agency breakdown, and final summary.

## Clarifications

### Session 2026-07-06

- Q1: Date of Death vs Due Date — same field or distinct? → A: Single field — "Due Date/Date of Death" is the same field used as the computation anchor. The label may vary by context (e.g., "Date of Death" for deceased pensioners, "Due Date" for separated members) but drives an identical computation.
- Q2: Can agency deduction rows be reordered after entry? If so, does the crediting agency flag follow position? → A: Reordering is allowed, but the crediting agency flag stays on whichever agency was first at submission time (flag does not follow position).

## User Scenarios & Testing

### User Story 1 — Add Pensioner Form Submits Successfully (Priority: P1)

An encoder fills out the Add Pensioner form with valid data and submits it. The system saves the pensioner record and returns a confirmation. If the form contains invalid data, the system shows clear, specific error messages describing exactly what needs to be corrected.

**Why this priority**: The Add Pensioner form is the primary data-entry mechanism. When it fails with a generic network error, encoders cannot do their work and have no way to diagnose the problem.

**Independent Test**: Can be tested by opening the form, filling all required fields with valid data, and submitting. A successful save with clear confirmation demonstrates the fix. Submitting with invalid data should show field-level validation errors instead of a generic network message.

**Acceptance Scenarios**:

1. **Given** a completed Add Pensioner form with all valid fields, **When** the encoder submits, **Then** the record is saved and a success confirmation is displayed.
2. **Given** a submitted form that fails server-side validation, **When** the encoder submits, **Then** specific field-level error messages are shown describing what needs correction (not a generic "unable to connect" message).
3. **Given** a network or server outage, **When** the encoder submits, **Then** an appropriate error message is shown that reflects the actual failure reason.
4. **Given** the form submission, **When** the request is sent, **Then** the payload structure matches exactly what the server expects.

---

### User Story 2 — First Agency Is Crediting Agency (Priority: P1)

When an encoder adds agency deduction rows, the first row is automatically treated as the crediting agency where the net monthly pension is deposited. The system stores this distinction and displays it clearly in the UI.

**Why this priority**: This is a critical business rule — the crediting agency receives the net pension and must be tracked separately from other deduction-only agencies.

**Independent Test**: Can be tested by creating a pensioner with multiple agency entries and verifying the first entry is marked as the crediting agency. The stored record should preserve this distinction.

**Acceptance Scenarios**:

1. **Given** the agency deduction section, **When** the first row is added, **Then** it is automatically designated as the crediting agency.
2. **Given** a saved pensioner record with agency deductions, **When** viewed, **Then** the first agency entry is stored with a `creditingAgency` flag set to true.
3. **Given** the pensioner detail or summary view, **When** displayed, **Then** the crediting agency is visually distinguished from other deduction entries.
4. **Given** the net monthly pension calculation, **When** computed, **Then** the net amount is associated with the crediting agency as the destination.

---

### User Story 3 — Multi-Component Overpayment Computation (Priority: P1)

An encoder enters Gross Monthly Pension, Date of Death / Due Date (a single field serving as the computation anchor), Last Payment date, and multiple agency deductions. The system computes: (a) Net Monthly Pension = Gross Pension minus total agency deductions, (b) Net Pension Overpayment using Net Monthly Pension, (c) per-agency overpayment for each agency independently, and (d) Grand Total Overpayment summing net pension overpayment plus all agency overpayments. Each component shows a detailed breakdown.

**Why this priority**: The previous model computed overpayment only on the gross pension with a single deduction figure. The new model reflects the actual financial structure where multiple agencies have independent claims, and the net pension flows to the crediting agency.

**Independent Test**: Can be tested with a known scenario: Gross Pension 100,000, agencies LBP (crediting), ALIP 10,000, PVB 5,000, Date of Death 15-Jan-2026, Last Payment 31-Mar-2026. The net pension = 85,000. Each agency (including LBP) gets individual fractional + whole-month computation. The grand total = net pension overpayment + LBP overpayment + ALIP overpayment + PVB overpayment.

**Acceptance Scenarios**:

1. **Given** Gross Monthly Pension and agency deduction amounts, **When** computed, **Then** Net Monthly Pension equals Gross Pension minus the sum of all agency deduction amounts.
2. **Given** Net Monthly Pension, Date of Death, and Last Payment, **When** computed, **Then** Net Pension Overpayment is calculated using the same date arithmetic (fractional days + whole months × daily rate based on Net Monthly Pension).
3. **Given** each agency's deduction amount, **When** computed independently, **Then** each agency overpayment equals agency amount × the same fractional/whole-month factors derived from the date range.
4. **Given** all component overpayments, **When** totaled, **Then** Grand Total Overpayment equals Net Pension Overpayment plus the sum of all individual agency overpayments.
5. **Given** the computation display, **When** shown, **Then** a detailed breakdown is visible showing: Gross Pension, Total Deductions, Net Pension, Crediting Agency, per-agency fractional amounts and whole-month amounts, per-agency overpayment totals, Net Pension Overpayment, Total Agency Overpayments, and the Grand Total Overpayment.

---

### User Story 4 — Leap Year and Variable Month Support (Priority: P2)

The system correctly computes overpayments across any date range, including leap-year Februarys (29 days), short months (28-30 days), and long months (31 days), with no precision errors.

**Why this priority**: Financial computations must be audit-proof across all calendar scenarios, including leap years which occur every 4 years.

**Independent Test**: Can be tested with a date range crossing February of a leap year (e.g., 01-Feb-2024 to 31-Mar-2024) and verifying daily rates use 29 days for February.

**Acceptance Scenarios**:

1. **Given** a start date in February of a leap year, **When** the daily rate is computed, **Then** the divisor is 29 days.
2. **Given** a start date in a 31-day month, **When** the daily rate is computed, **Then** the divisor is 31 days.
3. **Given** a start date in a 30-day month, **When** the daily rate is computed, **Then** the divisor is 30 days.
4. **Given** a date range spanning multiple month lengths, **When** fractional days and whole months are computed, **Then** each month boundary is respected and the total matches the calendar-day count.

---

### User Story 5 — Dynamic Agency Support (Priority: P2)

An encoder can add up to 10 agency deduction rows dynamically. Each row computes its independent overpayment contribution. Removing a row recalculates the grand total.

**Why this priority**: Agencies change over time and encoders must be able to add or remove entries without manual recalculation.

**Independent Test**: Can be tested by starting with 0 rows, adding up to 10, entering values, then removing rows and verifying the grand total updates.

**Acceptance Scenarios**:

1. **Given** the agency section, **When** the encoder adds rows one at a time, **Then** the system allows up to 10 rows.
2. **Given** rows already present, **When** a row is removed, **Then** the grand total overpayment recalculates immediately.
3. **Given** the maximum of 10 rows, **When** the encoder attempts to add an 11th row, **Then** the add button is disabled or the action is prevented.

---

### Edge Cases

- What happens when Date of Death and Last Payment are the same month? The system computes fractional days only with zero whole months, applied to every component (net pension and each agency).
- What happens when Date of Death falls on the last day of the month? Start Date becomes the first day of the next month.
- What happens when there are zero agency deductions? Net Monthly Pension equals Gross Monthly Pension, and the only overpayment component is the Net Pension Overpayment.
- What happens when a single agency is entered? That agency is both the crediting agency and the only deduction agency; its overpayment is computed independently.
- What happens with decimal monthly pension amounts? Financial precision is preserved throughout all computation stages.
- What happens to existing pensioner records that used the old computation model? Backward compatibility is maintained — existing records remain readable under the new display format.
- What happens when Gross Pension is less than total deductions? Net Pension would be negative — the system should flag this as an error since net pension cannot be negative.
- What happens if the encoder reorders agency rows after the first entry was designated as crediting? The crediting agency flag stays on the original first entry regardless of its new position; reordering does not reassign the flag.

## Requirements

### Functional Requirements

- **FR-001**: The Add Pensioner form submission MUST succeed when all fields contain valid data, returning a clear success confirmation.
- **FR-002**: Failed form submissions MUST display field-level error messages specific to the validation failure, never a generic "unable to connect" message.
- **FR-003**: The system MUST preserve and display meaningful server-side error messages when a submission fails due to network, timeout, or server errors.
- **FR-004**: The request payload sent on form submission MUST match exactly what the server expects in structure and field naming.
- **FR-005**: The first agency deduction entry at submission time MUST be automatically marked as the crediting agency; this designation persists regardless of any subsequent reordering of rows.
- **FR-006**: The crediting agency designation MUST be stored in the system and retrievable on subsequent views of the pensioner record.
- **FR-007**: The crediting agency MUST be visually distinguished in the UI (e.g., badge, label, or highlight) from other non-crediting agency deductions.
- **FR-008**: Net Monthly Pension MUST be computed as Gross Monthly Pension minus the sum of all agency deduction amounts.
- **FR-009**: Net Pension Overpayment MUST be computed using Net Monthly Pension with the same date-based formula (fractional days + whole months) used for any other component.
- **FR-010**: Each individual agency's overpayment MUST be computed independently using that agency's deduction amount with the same date-based formula.
- **FR-011**: The Grand Total Overpayment MUST equal Net Pension Overpayment plus the sum of all per-agency overpayments.
- **FR-012**: The computation breakdown MUST display: Gross Pension, Total Deductions, Net Pension, Crediting Agency, per-agency fractional amount, per-agency whole-month amount, per-agency overpayment total, Net Pension Overpayment, Total Agency Overpayments, and Grand Total Overpayment.
- **FR-013**: All computed values MUST update automatically whenever any input (Date of Death, Last Payment, Gross Monthly Pension, any agency deduction) changes.
- **FR-014**: The system MUST support up to 10 agency deduction entries dynamically, with add/remove controls.
- **FR-015**: Removing an agency deduction row MUST immediately recalculate all dependent values (Net Pension, per-agency overpayment, grand total).
- **FR-016**: The daily rate computation MUST use the correct number of days for the start month, including 29 days for February in leap years.
- **FR-017**: Net Monthly Pension MUST NOT be negative — the system MUST validate that total deductions do not exceed Gross Monthly Pension.
- **FR-018**: The computation MUST be deterministic across all date combinations, including leap years and month boundaries.
- **FR-019**: Existing functionality and backward compatibility with existing records MUST be preserved.

### Key Entities

- **Pensioner**: An AFP member whose pension overpayment is being computed. Attributes include rank, name, serial number, account number, date of death/due date (a single field), last payment date, gross monthly pension, agency deductions (array), and all computed overpayment fields.
- **Crediting Agency**: The agency/financial institution that was first in the deduction list at submission time, where the net monthly pension is deposited. This is both a deduction agency and the receiving agency for the net pension. Reordering rows after submission does not change which agency is designated as crediting.
- **Agency Deduction**: A financial deduction from the pensioner's gross pension directed to a specific agency or financial institution. Each deduction has an agency name, an amount, and a crediting flag (true only for the first entry).
- **Net Monthly Pension**: Gross Monthly Pension minus total agency deductions. This is the actual amount credited to the crediting agency.
- **Net Pension Overpayment**: The overpayment computed on the Net Monthly Pension using the date-based fractional + whole-month formula.
- **Agency Overpayment**: Per-agency overpayment computed independently on each agency's deduction amount using the same date-based formula.
- **Grand Total Overpayment**: The sum of Net Pension Overpayment plus all individual agency overpayments.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Encoders can submit the Add Pensioner form with valid data and receive a success confirmation every time.
- **SC-002**: Zero occurrences of the generic "unable to connect" error when the actual cause is a validation or payload mismatch issue.
- **SC-003**: The crediting agency is correctly identified and stored for 100% of new pensioner records.
- **SC-004**: Multi-component overpayment results are 100% accurate when compared to independent manual calculation using the prescribed formulas (net pension, per-agency, grand total).
- **SC-005**: All computed values update within 500ms of any input change, with no page refresh required.
- **SC-006**: Computation handles all calendar scenarios correctly, including leap years, 28/29/30/31-day months, year boundaries, and same-month date ranges.
- **SC-007**: Users can add, view, and remove up to 10 agency entries with automatic recalculation of all dependent values.
- **SC-008**: Net pension validation catches cases where total deductions exceed gross pension.

## Architecture: Computation Engine Specification

### Mathematical Model

The overpayment computation is decomposed into independent components, each computed with identical date arithmetic. The model follows a "factors → apply" pattern where shared date factors are derived once, then applied to each financial component.

#### Step 1: Date Factors

```
startDate       = dateOfDeath + 1 day
endDate         = last day of lastPayment month
wholeMonths     = number of complete calendar months between startDate and endDate
fractionalDays  = remaining days after wholeMonths (≤ daysInMonth of the start-of-fraction month)
dailyRate(A)    = A / daysInMonth(startDate)
```

All date arithmetic uses `Carbon` (PHP) / `Date.UTC` (TypeScript) for timezone-safe computation. Leap years are handled automatically by the calendar library (Feb has 29 days in leap years, 28 otherwise).

#### Step 2: Component Overpayment Formula

Every component (net pension, each agency deduction) uses the same formula:

```
componentOverpayment(amount, dateOfDeath, lastPayment):
    months    = wholeMonths(dateOfDeath, lastPayment)
    fracDays  = fractionalDays(dateOfDeath, lastPayment)
    rate      = dailyRate(amount, dateOfDeath)
    return    = (months × amount) + (fracDays × rate)
```

#### Step 3: Apply to Financial Components

```
TotalDeductions        = Σ(agency.amount for each agency in deductions)

NetMonthlyPension      = max(0, GrossMonthlyPension − TotalDeductions)

NetPensionOverpayment  = componentOverpayment(NetMonthlyPension, dateOfDeath, lastPayment)

For each agency:
    AgencyOverpayment[i] = componentOverpayment(agency[i].amount, dateOfDeath, lastPayment)

GrandTotalOverpayment   = NetPensionOverpayment + Σ(AgencyOverpayment[i])
```

#### Mathematical Identity

The sum of all component overpayments mathematically equals the overpayment computed on Gross Monthly Pension:

```
GrandTotalOverpayment = componentOverpayment(GrossMonthlyPension, dateOfDeath, lastPayment)
```

Proof:
```
Let G = GrossMonthlyPension, D[i] = agency deductions
NetMonthlyPension = G − ΣD[i]
NetPensionOverpayment = componentOverpayment(G − ΣD[i])
AgencyOverpayments = Σ componentOverpayment(D[i])

By linearity of componentOverpayment (it's a linear function w.r.t. amount):
componentOverpayment(G) = componentOverpayment(G − ΣD[i]) + Σ componentOverpayment(D[i])
                       = NetPensionOverpayment + ΣAgencyOverpayments[i]
                       = GrandTotalOverpayment
```

This means the breakdown into components is a **redistribution** of the gross overpayment, not an additional amount.

#### Crediting Agency Storage Model

```
agency_deductions: [
  {
    agency_name: "LBP",
    amount: 5000.00,
    crediting_agency: true     // first entry only
  },
  {
    agency_name: "AFPSLAI",
    amount: 3000.00,
    crediting_agency: false
  }
]

crediting_agency_name: "LBP"  // denormalized for fast queries
```

- `crediting_agency` boolean per entry is used at submission time to designate the first row
- `crediting_agency_name` column on `pensioners` table stores the name for indexed querying
- Both are set by the backend controller based on the first deduction entry
- Reordering rows does not reassign which entry was first at submission

#### Validation Rules

| Rule | Location | Implementation |
|------|----------|---------------|
| Deductions ≤ Gross | `StorePensionerRequest::after()` | `Σ(amount) > monthly_pension → validation error` |
| Max 10 deductions | `StorePensionerRequest::rules()` | `agency_deductions.max:10` |
| No negative amounts | `StorePensionerRequest::rules()` | `agency_deductions.*.amount.min:0` |
| Crediting agency boolean | `StorePensionerRequest::rules()` | `agency_deductions.*.crediting_agency:nullable,boolean` |

#### Database Schema (Migration)

```sql
-- Additive only — no destructive changes
ALTER TABLE pensioners ADD COLUMN crediting_agency_name VARCHAR(50) NULL AFTER agency_deductions;
```

#### API Contract

**POST /api/pensioners** — Request Payload:
```json
{
  "rank": "LCDR",
  "name": "Juan Dela Cruz",
  "serial_number": "AFPCN-12345",
  "date_of_death": "2026-01-15",
  "last_payment": "2026-03-31",
  "cause_of_stoppage": "Late Death Reporting",
  "agency_name": "LBP",
  "monthly_pension": 100000.00,
  "agency_deductions": [
    { "agency_name": "LBP", "amount": 5000.00, "crediting_agency": true },
    { "agency_name": "ALIP", "amount": 10000.00, "crediting_agency": false },
    { "agency_name": "PVB", "amount": 5000.00, "crediting_agency": false }
  ],
  "amount_collected": 0,
  "status": "not-yet-recovered"
}
```

**Response** — Success (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rank": "LCDR",
    "name": "Juan Dela Cruz",
    "monthly_pension": 100000.00,
    "agency_deductions": [ ... ],
    "crediting_agency_name": "LBP",
    "net_monthly_pension": 85000.00,
    "net_pension_overpayment": 154032.25,
    "agency_overpayments": [
      { "agency_name": "LBP", "amount": 5000.00, "overpayment": 9072.58 },
      { "agency_name": "ALIP", "amount": 10000.00, "overpayment": 18145.16 },
      { "agency_name": "PVB", "amount": 5000.00, "overpayment": 9072.58 }
    ],
    "grand_total_overpayment": 190322.58,
    ...
  }
}
```

#### Frontend Computation Architecture

```typescript
// Shared factor derivation — called once per computation
computeOverpaymentFactors(dateOfDeath, lastPayment):
    → { wholeMonths, fractionalDays, dailyRate }

// Apply factors to any single monthly amount
computeComponentOverpayment(monthlyAmount, dateOfDeath, lastPayment):
    → { overpayment, factors }

// Full multi-component breakdown
computeFullBreakdown(grossPension, agencyDeductions, dateOfDeath, lastPayment):
    → {
        netMonthlyPension,
        netPensionOverpayment,
        agencyOverpayments: [{ agency_name, amount, overpayment }],
        grandTotalOverpayment
      }
```

Real-time computation pipeline: `form.watch()` → `useMemo(computeFullBreakdown)` → `OverpaymentComputationBreakdown` component renders sections A–D.

#### Implementation Files

| Layer | File | Purpose |
|-------|------|---------|
| Backend service | `OverpaymentCalculationService.php` | Static methods: netMonthlyPension, componentOverpayment, netPensionOverpayment, agencyOverpayments, grandTotalOverpayment |
| Backend model | `Pensioner.php` | Computed attribute accessors delegating to service |
| Backend controller | `PensionerController.php` | Derives crediting_agency_name from first deduction |
| Backend request | `StorePensionerRequest.php` | Validates deductions ≤ gross, crediting_agency boolean |
| Frontend calc | `financial-calculations.ts` | computeOverpaymentFactors, computeComponentOverpayment, computeFullBreakdown |
| Frontend UI | `OverpaymentComputationBreakdown.tsx` | 4-section multi-component display |
| Frontend form | `AddPensionerPage.tsx` | Real-time computation via useMemo, field-level error display |
| API errors | `api.ts` | Interceptor extracts `error.details` for field-level validation |

- The Add Pensioner form submission failure is caused by a request payload mismatch between the frontend and backend (field names, structure, or data types) rather than an external network issue or server outage.
- The crediting agency rule applies to ALL pensioner records created through the Add Pensioner form — every pensioner has exactly one crediting agency.
- The computation for each agency uses the same date-derived factors (fractional days, whole months, daily rate) regardless of the agency amount. Only the amount changes per agency.
- Financial computations use standard decimal arithmetic with no rounding until the final display (two decimal places for currency).
- The start date for computation is Date of Death + 1 day; the end date is the last calendar day of the Last Payment month.
- All currency values are in Philippine Peso (PHP).
- The system operates in Philippine Time (UTC+8).
