# Feature Specification: Update Computation Logic for Breakdown and Summary

**Feature Branch**: `010-update-computation-logic`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Update the computation logic for Computation Breakdown and Final Summary — Total Agency excludes 'Crediting Agency', Net Monthly Pension = Gross Monthly Pension − Total Agency, remove Net Pension Overpayment and Total Agency Overpayments from Final Summary, keep only Grand Total Overpayment."

## User Scenarios & Testing

### User Story 1 - Updated Total Agency Computation (Priority: P1)

As a user viewing the Computation Breakdown, I want the Total Agency value to exclude the "Crediting Agency" overpayment so that the Total Agency reflects only actual agency overpayments.

**Why this priority**: This is the foundational computation change that other calculations depend on.

**Independent Test**: Can be fully tested by verifying that the Total Agency displayed equals the sum of all agency overpayments except "Crediting Agency".

**Acceptance Scenarios**:

1. **Given** there are multiple agency overpayments including one from "Crediting Agency", **When** the Computation Breakdown is displayed, **Then** Total Agency equals the sum of all agency overpayments excluding the "Crediting Agency" amount.
2. **Given** the only agency overpayment is from "Crediting Agency", **When** the Computation Breakdown is displayed, **Then** Total Agency equals zero.
3. **Given** there are no agency overpayments, **When** the Computation Breakdown is displayed, **Then** Total Agency equals zero.

---

### User Story 2 - Updated Net Monthly Pension Computation (Priority: P1)

As a user viewing the Computation Breakdown, I want the Net Monthly Pension to be computed as Gross Monthly Pension minus Total Agency so that I see my net pension after accounting for all agency overpayments.

**Why this priority**: This computation directly depends on the Total Agency (P1) and is a core value in the breakdown.

**Independent Test**: Can be fully tested by verifying the formula: Net Monthly Pension = Gross Monthly Pension − Total Agency.

**Acceptance Scenarios**:

1. **Given** a Gross Monthly Pension of 10,000 and Total Agency of 2,000, **When** the Computation Breakdown is displayed, **Then** Net Monthly Pension is 8,000.
2. **Given** Total Agency is zero, **When** the Computation Breakdown is displayed, **Then** Net Monthly Pension equals Gross Monthly Pension.

---

### User Story 3 - Simplified Final Summary (Priority: P2)

As a user viewing the Final Summary, I want to see only the Grand Total Overpayment (without Net Pension Overpayment or Total Agency Overpayments) so that the summary is clear and focused.

**Why this priority**: This is a display/presentation change that removes unnecessary information.

**Independent Test**: Can be fully tested by verifying that the Final Summary section contains only the Grand Total Overpayment value.

**Acceptance Scenarios**:

1. **Given** a completed computation, **When** the Final Summary is displayed, **Then** it includes Grand Total Overpayment.
2. **Given** a completed computation, **When** the Final Summary is displayed, **Then** it does NOT include Net Pension Overpayment.
3. **Given** a completed computation, **When** the Final Summary is displayed, **Then** it does NOT include Total Agency Overpayments.

---

### Edge Cases

- What happens when the "Crediting Agency" name has different casing (e.g., "crediting agency" or "CREDITING AGENCY")? The system should handle case-insensitive matching.
- What happens when all agency overpayments are from "Crediting Agency"? Total Agency should be zero, and Net Monthly Pension should equal Gross Monthly Pension.
- What happens when there are zero agency overpayments? Total Agency is zero, Net Monthly Pension equals Gross Monthly Pension, Grand Total Overpayment remains as computed.

## Requirements

### Functional Requirements

- **FR-001**: System MUST compute Total Agency as the sum of all Agency Overpayments, excluding any Agency Overpayment where the agency name matches "Crediting Agency" (case-insensitive comparison).
- **FR-002**: System MUST compute Net Monthly Pension as Gross Monthly Pension minus Total Agency.
- **FR-003**: System MUST continue to compute and display Grand Total Overpayment in the Final Summary using existing business logic.
- **FR-004**: System MUST NOT display Net Pension Overpayment in the Final Summary.
- **FR-005**: System MUST NOT display Total Agency Overpayments in the Final Summary.
- **FR-006**: All other Computation Breakdown items and computations MUST remain unchanged.

### Key Entities

- **Agency Overpayment**: A record representing an overpayment attributed to a specific agency, identified by agency name and a monetary amount.
- **Computation Breakdown**: The UI section that displays step-by-step calculations, including Total Agency and Net Monthly Pension.
- **Final Summary**: The UI section that displays final totals, now containing only Grand Total Overpayment.
- **Total Agency**: Computed value — sum of all agency overpayments excluding "Crediting Agency".
- **Net Monthly Pension**: Computed value — Gross Monthly Pension minus Total Agency.
- **Grand Total Overpayment**: The overall total overpayment, computed using existing business logic.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users see Total Agency correctly computed as the sum of all agency overpayments except "Crediting Agency" (verified with 3+ test data scenarios).
- **SC-002**: Users see Net Monthly Pension correctly computed as Gross Monthly Pension minus Total Agency (verified with 3+ test data scenarios).
- **SC-003**: The Final Summary displays only Grand Total Overpayment — Net Pension Overpayment and Total Agency Overpayments are not shown.
- **SC-004**: All existing Computation Breakdown items not mentioned in this spec continue to display their correct values.

## Assumptions

- The existing data model for Agency Overpayments (including the agency name field) remains unchanged.
- "Crediting Agency" matching should be case-insensitive to handle minor formatting differences.
- The Computation Breakdown and Final Summary are distinct UI sections that can be updated independently.
- The Gross Monthly Pension value is already available from existing computation logic and is not changed by this specification.
- The Grand Total Overpayment computation logic is already implemented and remains unchanged.
