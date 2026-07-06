# Feature Specification: Pensioner Form & Overpayment Computation Update

**Feature Branch**: `007-pensioner-form-overpayment-computation`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Update the existing Add Pensioner form and pension overpayment computation module with updated rank dropdown, agency list, multiple agency deductions, new Last Payment field, label rename, and automated pension overpayment computation."

## User Scenarios & Testing

### User Story 1 - Add Pensioner with Updated Form Fields (Priority: P1)

An encoder opens the Add Pensioner form and sees the updated fields: a searchable Rank dropdown with standardized military abbreviations, a searchable Agency Name dropdown replacing the old Bank Name field, a dynamic agency deduction repeater (defaulting to one row), and a new required Last Payment date field. The encoder fills in all fields, adds up to 10 agency deductions, and submits the form successfully.

**Why this priority**: The Add Pensioner form is the primary data entry mechanism — all downstream workflows depend on accurate pensioner intake.

**Independent Test**: Can be fully tested by opening the Add Pensioner form, verifying the updated dropdown values, adding multiple agency deductions, filling the Last Payment field, and submitting a complete record.

**Acceptance Scenarios**:

1. **Given** the Add Pensioner form, **When** an encoder opens it, **Then** the Rank field displays a searchable dropdown with all specified military rank abbreviations (ADM, VADM, RADM, etc.).
2. **Given** the Agency Name dropdown, **When** an encoder opens it, **Then** the field is labeled "Agency Name (AGDB's / FI's)" and contains all specified agency values (LBP, DBP, PVB, etc.).
3. **Given** the agency deduction repeater section, **When** the form loads, **Then** exactly one deduction row is displayed by default.
4. **Given** a single deduction row, **When** the encoder clicks "Add Agency", **Then** a new deduction row is added (up to a maximum of 10).
5. **Given** multiple deduction rows, **When** the encoder clicks remove on a row, **Then** the row is removed unless only one row remains.
6. **Given** the Last Payment field, **When** the encoder selects a date, **Then** the date is recorded as the last month the pension was received.
7. **Given** the form with all required fields completed, **When** the encoder submits, **Then** the record is saved with agency deductions stored as an array of objects.

---

### User Story 2 - Automated Overpayment Computation (Priority: P1)

An encoder enters a Date of Death and Last Payment date for a pensioner. The system automatically computes whole months overpaid, fractional days in the month, total overpayment days, daily pension rate, and total overpayment amount. All computed values update in real time as inputs change, and a detailed computation breakdown is visible.

**Why this priority**: Accurate overpayment computation is the core business requirement — manual calculation is error-prone and time-consuming.

**Independent Test**: Can be fully tested by entering Date of Death (15-Jan-2026), Last Payment (31-Mar-2026), and Monthly Pension (30,000), then verifying the computed values match the expected output (2 whole months, 16 fractional days, 75 total days, 967.74 daily rate).

**Acceptance Scenarios**:

1. **Given** Date of Death and Last Payment dates, **When** either date changes, **Then** the Start Date is computed as Date of Death + 1 day and End Date as the last calendar day of the Last Payment month.
2. **Given** Start Date and End Date, **When** both are set, **Then** Whole Months equals the number of complete calendar months between them.
3. **Given** Whole Months and remaining days, **When** computed, **Then** Fractional Days in Month equals the remaining days after subtracting complete months.
4. **Given** Start Date and End Date, **When** computed, **Then** Total Days = End Date - Start Date + 1.
5. **Given** Monthly Pension and Start Date, **When** computed, **Then** Daily Pension Rate = Monthly Pension divided by the number of days in the Start Month.
6. **Given** all computed values, **When** calculated, **Then** Overpayment Amount = (Whole Months × Monthly Pension) + (Fractional Days × Daily Pension Rate).
7. **Given** any input change (Date of Death, Last Payment, Monthly Pension), **When** the value changes, **Then** all computed values update automatically without requiring a form submission.
8. **Given** the computation module, **When** displayed, **Then** a detailed breakdown of the computation is shown.
9. **Given** a leap year date (e.g., Date of Death: 01-Feb-2024), **When** computed, **Then** February is treated as having 29 days.
10. **Given** months with 28, 29, 30, or 31 days, **When** used as the start month, **Then** the daily pension rate uses the correct number of days for that month.

---

### User Story 3 - Form Validation (Priority: P2)

An encoder tries to submit the Add Pensioner form with invalid data. The system prevents submission and displays clear validation errors.

**Why this priority**: Data integrity depends on correct validation — bad data at entry propagates errors through all downstream reports and computations.

**Independent Test**: Can be tested by attempting to submit the form with Last Payment before Date of Death, zero monthly pension, negative deduction amounts, or more than 10 agency deductions.

**Acceptance Scenarios**:

1. **Given** the Add Pensioner form, **When** the encoder enters a Last Payment date earlier than the Date of Death, **Then** a validation error is shown and the form cannot be submitted.
2. **Given** the Add Pensioner form, **When** a Monthly Pension of zero or less is entered, **Then** a validation error is shown.
3. **Given** an agency deduction row, **When** a negative amount is entered, **Then** a validation error is shown.
4. **Given** the Add Agency button, **When** 10 rows already exist, **Then** the button is disabled.
5. **Given** the form, **When** any required field is empty, **Then** the form cannot be submitted and validation errors are shown.

---

### User Story 4 - Label Update: Fractional Days in Month (Priority: P2)

Users see the field formerly labeled "Fraction Days" now labeled "Fractional Days in Month" consistently across all screens — the Add Pensioner form, the pensioner detail view, reports, exports, and the computation breakdown.

**Why this priority**: Consistent terminology prevents confusion and ensures users understand what the field represents.

**Independent Test**: Can be tested by viewing the Add Pensioner form, pensioner list table, computation breakdown, and any report or export — all must use "Fractional Days in Month".

**Acceptance Scenarios**:

1. **Given** the Add Pensioner form, **When** displayed, **Then** the label reads "Fractional Days in Month" instead of "Fraction Days".
2. **Given** the computation breakdown display, **When** shown, **Then** the label reads "Fractional Days in Month".
3. **Given** any report or export containing this field, **When** generated, **Then** the field label reads "Fractional Days in Month".

---

### Edge Cases

- What happens when Date of Death and Last Payment are the same month? The system computes fractional days only, with zero whole months.
- What happens when Date of Death falls on the last day of the month? Start Date becomes the first day of the next month.
- What happens when Last Payment is the same as Date of Death? Validation rejects this — Last Payment cannot be earlier than Date of Death, but an equal date results in zero overpayment days (Start Date = DoD + 1 > End Date).
- What happens in February of a leap year (e.g., 29 days)? The daily pension rate uses 29 for February, and fractional days are computed correctly.
- What happens when the monthly pension has decimal values (e.g., 30,000.50)? The system preserves precision throughout computation.
- What happens when a deduction row has no agency selected? The system validates each row — both agency name and deduction amount are required per row.
- What happens to existing pensioner records that used the old "Fraction Days" label? Backward compatibility is maintained — existing data is preserved and displayed under the new label.

## Requirements

### Functional Requirements

- **FR-001**: Rank field MUST be a searchable dropdown containing exactly the specified rank abbreviations: ADM, VADM, RADM, COMO, CAPT, CDR, LCDR, LT, LTJG, ENS, GEN, LTGEN, MGEN, BGEN, COL, LTC, MAJ, CPT, 1LT, 2LT, FOIC, MCPO, SCPO, CPO, PO1, PO2, PO3, SA, SN, SR, CMSG, SMSG, MSG, TSG, SSG, SGT, CPL, PFC, PVT, OW, EW, MR, MS, MRS, GDN.
- **FR-002**: "Bank Name" field MUST be renamed to "Agency Name (AGDB's / FI's)" and MUST be a searchable dropdown containing exactly: LBP, DBP, PVB, ACDI, ACES, AFPFCMPC, AFPMBAI, AFPSLAI, AGFO, ALIP, AMWSLAI, AVACC, BABSLAI, BOT B4 ACCT (101), CWSLA, FABSLAI, KBKP, KKMPC, PAFCPIC, PNSLAI, PNRA-CCI, PVB EMER LOAN, RSBS 5% OF DIFFL, RSBS 5% OF REG RATE.
- **FR-003**: System MUST provide a dynamic agency deduction repeater starting with one row, allowing up to 10 entries.
- **FR-004**: Each agency deduction row MUST contain an Agency Name dropdown and a Deduction Amount (currency) field.
- **FR-005**: User MUST be able to add a new deduction row via an "Add Agency" button, up to a maximum of 10 rows.
- **FR-006**: User MUST be able to remove any deduction row, except when only one row remains.
- **FR-007**: Agency deduction data MUST be stored as an array of objects, each containing agency name and deduction amount.
- **FR-008**: System MUST include a new required date field "Last Payment" representing the last month for which pension was received.
- **FR-009**: All instances of "Fraction Days" label MUST be replaced with "Fractional Days in Month" across the entire UI, reports, exports, and computation displays.
- **FR-010**: Overpayment computation MUST start one day after Date of Death (Start Date = Date of Death + 1 day).
- **FR-011**: Overpayment computation MUST end on the last calendar day of the Last Payment month (End Date = last day of Last Payment month).
- **FR-012**: System MUST automatically compute Whole Months as the number of complete calendar months between Start Date and End Date.
- **FR-013**: System MUST automatically compute Fractional Days in Month as the remaining days after subtracting complete months.
- **FR-014**: System MUST automatically compute Total Days as End Date - Start Date + 1.
- **FR-015**: System MUST automatically compute Daily Pension Rate as Monthly Pension divided by the number of days in the Start Month.
- **FR-016**: System MUST automatically compute Overpayment Amount as (Whole Months × Monthly Pension) + (Fractional Days × Daily Pension Rate).
- **FR-017**: All computed values MUST update automatically whenever any input (Date of Death, Last Payment, Monthly Pension) changes.
- **FR-018**: System MUST display a detailed computation breakdown showing Start Date, End Date, Whole Months, Fractional Days in Month, Total Overpayment Days, Daily Pension Rate, and Overpayment Amount.
- **FR-019**: Last Payment date MUST NOT be earlier than Date of Death.
- **FR-020**: Monthly Pension MUST be greater than zero.
- **FR-021**: Deduction amounts MUST NOT be negative.
- **FR-022**: All required fields MUST be validated before form submission.
- **FR-023**: System MUST correctly handle leap years (February with 29 days).
- **FR-024**: System MUST correctly support months with 28, 29, 30, and 31 days.
- **FR-025**: All calculations MUST be deterministic and timezone-safe.
- **FR-026**: Existing functionality unrelated to these requirements MUST remain unchanged.
- **FR-027**: Backward compatibility with existing pensioner records MUST be preserved.

### Key Entities

- **Pensioner**: An AFP member whose pension overpayment is being computed. Key attributes include rank, agency name, agency deductions (array), date of death, last payment, monthly pension, and computed overpayment fields (whole months, fractional days in month, total days, daily pension rate, overpayment amount).
- **Agency Deduction**: A financial deduction from a pensioner's pension directed to a specific agency or financial institution. Each deduction has an agency name and an amount.
- **Overpayment Computation**: The automated calculation that determines the total amount overpaid to a pensioner based on Date of Death, Last Payment date, and Monthly Pension, following the prescribed formula.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Encoders can complete a full Add Pensioner form (including rank selection, agency deduction entries, and Last Payment date) in under 3 minutes.
- **SC-002**: Overpayment computation results are 100% accurate compared to manual calculation using the prescribed formula, across all date combinations including leap years, month boundaries, and same-month scenarios.
- **SC-003**: All computed values update within 500ms of any input change, with no page refresh required.
- **SC-004**: Form validation catches 100% of invalid submissions (Last Payment before Date of Death, zero/negative Monthly Pension, negative deductions, >10 agency entries).
- **SC-005**: The "Fractional Days in Month" label appears consistently on 100% of screens, reports, and exports where the field is displayed, with zero instances of the old "Fraction Days" label remaining.
- **SC-006**: Existing pensioner records are unaffected by the changes — all legacy data remains accessible and correctly displayed under the updated labels.

## Assumptions

- The specified rank abbreviations are final and do not require dynamic updates from external systems.
- The specified agency names are final and do not require dynamic updates from external systems.
- The overpayment computation formula as specified is authoritative; no alternative formula interpretations are needed.
- All currency values use Philippine Peso (PHP) as the default currency.
- Existing pensioner records stored with the old schema (single agency deduction, no Last Payment field) will have null/zero values for new fields and remain functional.
- The "Fraction Days" to "Fractional Days in Month" rename applies to all user-facing labels; database column names may remain unchanged for backward compatibility if appropriate mapping is maintained in the UI layer.
- Date arithmetic uses the Gregorian calendar and accounts for leap years per standard calendar rules.
- The system operates within a single timezone (Philippine Time, UTC+8), making timezone-safe date arithmetic straightforward.
