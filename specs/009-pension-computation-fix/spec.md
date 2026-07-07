# Feature Specification: Fix Pensioner Computation & Connection Handling

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description detailing (1) crediting agency amount not auto-computing correctly, (2) Pension Summary including a "Deductions" field that should be removed, and (3) a persistent "Unable to connect. Please check your internet connection and try again." error that blocks form submission.

## User Scenarios & Testing

### User Story 1 — Crediting Agency Amount Auto-Computes (Priority: P1)

An encoder enters Gross Monthly Pension and non-crediting agency deductions on the Pensioner Detail form. The system automatically calculates the Crediting Agency Amount as Gross Monthly Pension minus the total of all non-crediting agency deductions. The crediting amount field is read-only and updates in real time whenever the pension amount or any agency deduction changes.

**Why this priority**: The crediting agency receives the net pension deposit. Manual entry is error-prone and the business rule is fixed — the crediting amount is always the residual after non-crediting deductions.

**Independent Test**: Enter Gross Monthly Pension = 190,000, add non-crediting agencies AMWSLAI (10,000), ALIP (15,000), AFPMBAI (5,000). The crediting agency amount should display 160,000 (190,000 − 30,000). Changing any deduction or the pension amount immediately updates the crediting amount.

**Acceptance Scenarios**:

1. **Given** a Gross Monthly Pension value, **When** non-crediting agency deductions are entered, **Then** the Crediting Agency Amount equals Gross Monthly Pension minus the sum of all non-crediting agency deductions.
2. **Given** the crediting agency amount field, **When** displayed, **Then** it is read-only and cannot be manually edited.
3. **Given** any input change (monthly pension, agency deduction amount, addition/removal of agency rows), **When** the value changes, **Then** the crediting agency amount updates automatically without requiring a page refresh or manual trigger.
4. **Given** existing pensioner records with manually-entered crediting amounts, **When** the record is loaded, **Then** the crediting amount is recalculated using the formula if the pension and deductions are present.

---

### User Story 2 — Pension Summary Shows Correct Breakdown (Priority: P1)

An encoder views the Pension Summary section and sees only three lines: Gross Monthly Pension (the monthly pension amount), Total Agency (sum of non-crediting agency deductions only), and Net Monthly Pension (the crediting agency amount). The "Deductions" field is no longer displayed or used in any computation.

**Why this priority**: The previous "Deductions" field conflated the crediting agency amount with non-crediting deductions, creating confusion. The summary should reflect the actual financial flow: pension minus non-crediting deductions equals net pension (crediting agency amount).

**Independent Test**: Enter Gross Monthly Pension = 190,000 with three non-crediting agencies totaling 30,000. The summary shows Gross: 190,000, Total Agency: 30,000, Net: 160,000. No "Deductions" row appears.

**Acceptance Scenarios**:

1. **Given** a pensioner record with deductions, **When** the Pension Summary is displayed, **Then** the only rows shown are Gross Monthly Pension, Total Agency, and Net Monthly Pension.
2. **Given** the Pension Summary, **When** computed, **Then** Net Monthly Pension equals the Crediting Agency Amount from the computation.
3. **Given** the Pension Summary, **When** displayed, **Then** no "Deductions" row or label appears anywhere in the summary.
4. **Given** any existing record that previously displayed "Deductions", **When** viewed, **Then** the summary shows the new three-line format.

---

### User Story 3 — Reliable Connection and Error Handling (Priority: P1)

An encoder submits the pensioner form or loads pensioner data and receives meaningful error messages when things go wrong, not a misleading "Unable to connect. Please check your internet connection and try again." message. The system correctly distinguishes between network failures, server errors, validation errors, and API misconfigurations, displaying an appropriate message for each.

**Why this priority**: The generic connection error blocks all encoder work and provides no diagnostic information. Encoders cannot tell whether the issue is their network, the server, or invalid form data.

**Independent Test**: Simulate different failure modes — server down (500), validation failure (422), network timeout, and CORS error. Each shows a distinct, helpful message. A successful submission shows a confirmation.

**Acceptance Scenarios**:

1. **Given** a working backend, **When** the frontend sends a request, **Then** the request succeeds and the response is handled normally.
2. **Given** a server error (5xx), **When** the frontend receives the response, **Then** a specific server error message is shown (not a generic connection error).
3. **Given** a validation error (422), **When** the frontend receives the response, **Then** field-level error messages are displayed.
4. **Given** a network failure (no internet, DNS failure), **When** the request fails, **Then** a clear network error message is shown.
5. **Given** a CORS or API misconfiguration, **When** the request fails, **Then** a diagnostic message appropriate to the failure type is shown.
6. **Given** a successful API response, **When** data is received, **Then** no connection error message is displayed.

---

### Edge Cases

- What happens when Gross Monthly Pension is less than total non-crediting agency deductions? The crediting agency amount would be negative — the system flags this as an error since net pension cannot be negative, consistent with existing validation.
- What happens when there are zero non-crediting agency deductions? The crediting agency amount equals Gross Monthly Pension, and Total Agency is zero.
- What happens when a single agency is present and it is the crediting agency? Total Agency is zero (no non-crediting deductions), and the crediting amount equals Gross Monthly Pension.
- What happens with an existing pensioner record that has a manually-stored crediting amount? The record is re-computed on load using the formula, ensuring consistency.
- What happens when the backend is unreachable during form submission? The error message reflects the actual failure (server error, network error, etc.) rather than a generic connection message.
- What happens when the API base URL is misconfigured in the frontend environment? The system should display a configuration-related error rather than an "internet connection" message.

## Requirements

### Functional Requirements

- **FR-001**: The Crediting Agency Amount MUST be computed as Gross Monthly Pension minus the sum of all non-crediting agency deduction amounts.
- **FR-002**: The crediting agency amount field MUST be read-only and not manually editable by the user.
- **FR-003**: The crediting agency amount MUST update automatically whenever Gross Monthly Pension or any agency deduction changes, with no page refresh required.
- **FR-004**: The Pension Summary MUST display exactly three rows: Gross Monthly Pension, Total Agency (sum of non-crediting agency deductions), and Net Monthly Pension (equals Crediting Agency Amount).
- **FR-005**: The "Deductions" field MUST be removed from the Pension Summary display and computation.
- **FR-006**: Net Monthly Pension in the summary MUST equal the computed Crediting Agency Amount.
- **FR-007**: The frontend MUST correctly distinguish between network failures (no internet, DNS failure, timeout), server errors (5xx), validation errors (422), and CORS/configuration errors, displaying a specific message for each.
- **FR-008**: The generic "Unable to connect. Please check your internet connection and try again." message MUST NOT appear when the actual failure is a server error, validation error, or API misconfiguration.
- **FR-009**: The frontend API base URL configuration MUST be verified to point to the correct backend endpoint.
- **FR-010**: Backend CORS configuration MUST allow requests from the frontend origin.
- **FR-011**: The frontend HTTP client MUST include proper error interceptors that parse error types and surface appropriate messages.
- **FR-012**: Existing pensioner records MUST remain functional after these changes, with recalculated fields where applicable.
- **FR-013**: The computation MUST validate that non-crediting agency deductions do not exceed Gross Monthly Pension, flagging an error if they do.

### Key Entities

- **Pensioner**: An AFP member record with attributes including gross monthly pension, agency deductions, computed crediting agency amount, and pension summary fields.
- **Crediting Agency**: The agency designated to receive the net monthly pension. The crediting agency amount is the residual after all non-crediting deductions are subtracted from the gross pension.
- **Non-Crediting Agency**: Any agency deduction entry that is not the crediting agency. Deductions from these agencies are summed to compute Total Agency in the summary.
- **Pension Summary**: A computed display showing Gross Monthly Pension, Total Agency (non-crediting deductions), and Net Monthly Pension (crediting agency amount). Does not include a "Deductions" row.
- **API Error Handler**: A frontend component/module that intercepts HTTP responses and maps status codes and error types to user-friendly messages, distinguishing network, server, validation, and configuration errors.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The crediting agency amount is computed correctly (verified against manual calculation) for 100% of test cases with varying pension amounts and deduction combinations.
- **SC-002**: The Pension Summary displays exactly three rows (Gross, Total Agency, Net) with no "Deductions" row for 100% of records viewed.
- **SC-003**: All computed values update within 500ms of any input change, with no page refresh required.
- **SC-004**: Zero occurrences of the generic "Unable to connect" error for actual server, validation, or configuration failures.
- **SC-005**: Each error type (network, server, validation, configuration) produces a distinct, accurate message that helps the user understand the actual issue.
- **SC-006**: All existing pensioner records remain accessible and display correct computed values after the update.
- **SC-007**: Form submission success rate for valid data is 100% when the backend is healthy.
