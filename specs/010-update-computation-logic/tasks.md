---

description: "Task list for updating computation logic in Computation Breakdown and Final Summary"
---

# Tasks: Update Computation Logic for Breakdown and Summary

**Input**: Design documents from `specs/010-update-computation-logic/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No new tests required — existing tests cover all computation logic and no tests were requested in the spec.

**Organization**: Tasks are grouped by user story. US1 and US2 require only verification (formulas already correct). US3 is the sole implementation change.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/app/Services/`, `apps/backend/app/Models/`, `apps/backend/app/Http/`
- **Frontend**: `apps/frontend/src/components/`, `apps/frontend/src/lib/`
- **Tests**: `apps/backend/tests/`, `apps/frontend/src/lib/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — all tooling and dependencies are already in place.

- [x] T001 Verify project dependencies are installed in `apps/frontend/node_modules` and `apps/backend/vendor`

**Checkpoint**: Environment ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational work needed — no database changes, no API changes, no new models or services.

No tasks. All prerequisites are satisfied by the existing codebase.

---

## Phase 3: User Story 1 - Updated Total Agency Computation (Priority: P1) 🎯 MVP

**Goal**: Verify that the Total Agency computation already correctly excludes "Crediting Agency" overpayments.

**Independent Test**: Inspect `OverpaymentCalculationService::netMonthlyPension()` and `computeFullBreakdown()` to confirm non-crediting filter is applied.

### Implementation for User Story 1

- [x] T002 [US1] Verify `OverpaymentCalculationService::netMonthlyPension()` in `apps/backend/app/Services/OverpaymentCalculationService.php:142-144` correctly filters out deductions with `crediting_agency === true`
- [x] T003 [US1] Verify `computeFullBreakdown()` in `apps/frontend/src/lib/financial-calculations.ts:176` correctly filters out deductions with `crediting_agency === true`
- [x] T004 [US1] Verify `total_non_crediting` in `apps/backend/app/Http/Resources/PensionerResource.php:41-49` correctly sums only non-crediting deduction amounts
- [x] T005 [P] [US1] Run `cd apps/backend && php artisan test --filter="OverpaymentComputation"` to confirm all computation tests pass

**Checkpoint**: Total Agency formula confirmed correct. No code changes needed.

---

## Phase 4: User Story 2 - Updated Net Monthly Pension Computation (Priority: P1)

**Goal**: Verify that the Net Monthly Pension computation already correctly uses the formula `Gross Monthly Pension − Total Agency`.

**Independent Test**: Inspect the formula in both backend and frontend to confirm `net = max(0, gross - totalNonCrediting)`.

### Implementation for User Story 2

- [x] T006 [US2] Verify `netMonthlyPension()` return in `apps/backend/app/Services/OverpaymentCalculationService.php:148` matches `max(0, gross - sum(non-crediting amounts))`
- [x] T007 [US2] Verify `computeFullBreakdown()` net calculation in `apps/frontend/src/lib/financial-calculations.ts:179` matches `max(0, gross - totalDeductions)`
- [x] T008 [P] [US2] Run `cd apps/frontend && npm test` to confirm all frontend computation tests pass

**Checkpoint**: Net Monthly Pension formula confirmed correct. No code changes needed.

---

## Phase 5: User Story 3 - Simplified Final Summary (Priority: P2)

**Goal**: Remove "Net Pension Overpayment" and "Total Agency Overpayments" rows from the Final Summary section, keeping only "Grand Total Overpayment".

**Independent Test**: View a pensioner with computation data — the Final Summary card should show exactly one row: Grand Total Overpayment.

### Implementation for User Story 3

- [x] T009 [US3] Remove unused `totalAgencyOverpayments` variable (line 15) from `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`
- [x] T010 [US3] Remove "Net Pension Overpayment" display row (lines 98-101) from the Final Summary section in `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`
- [x] T011 [US3] Remove "Total Agency Overpayments" display row (lines 102-105) from the Final Summary section in `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`
- [x] T012 [US3] Verify "Grand Total Overpayment" display row (lines 106-109) remains intact in `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`

**Checkpoint**: At this point, the Final Summary should display only the Grand Total Overpayment.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: TypeScript compilation check, lint verification, manual validation.

- [x] T013 [P] Run `cd apps/frontend && npx tsc --noEmit` to verify TypeScript strict mode passes (0 errors)
- [x] T014 [P] Run `cd apps/frontend && npm run lint` to verify no lint violations (0 new warnings; 3 pre-existing in badge.tsx, button.tsx, form.tsx)
- [x] T015 [P] Run `cd apps/frontend && npm test` to confirm all frontend tests pass (53/53)
- [x] T016 [P] Run `cd apps/backend && php artisan test` to confirm all backend tests pass (64/66 - 2 pre-existing failures: ExampleTest, WelcomeTest with MissingAppKeyException)
- [ ] T017 Run manual validation per `specs/010-update-computation-logic/quickstart.md` scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No tasks — all prerequisites satisfied
- **US1 (Phase 3)**: Can start after Setup — no blocking dependencies
- **US2 (Phase 4)**: Can start after Setup — no blocking dependencies
- **US3 (Phase 5)**: Can start after Setup — independent from US1 and US2
- **Polish (Phase 6)**: Depends on Phase 5 (US3) completion

### User Story Dependencies

- **US1 (P1)**: No code changes needed — verification only
- **US2 (P1)**: No code changes needed — verification only
- **US3 (P2)**: Independent from US1 and US2 — can be implemented in parallel

### Parallel Opportunities

- T002-T005 (US1) can run in parallel with T006-T008 (US2) with T009-T012 (US3)
- T013-T016 (Polish) can run in parallel once US3 is complete

---

## Parallel Example: User Story 3

```bash
# Launch all US3 implementation tasks together:
Task: "Remove unused totalAgencyOverpayments variable in OverpaymentComputationBreakdown.tsx:15"
Task: "Remove Net Pension Overpayment row (lines 98-101)"
Task: "Remove Total Agency Overpayments row (lines 102-105)"
```

---

## Implementation Strategy

### MVP First (User Story 3 Only)

Since US1 and US2 are already correctly implemented, the MVP is just US3:

1. Complete Phase 1 (Setup)
2. Complete Phase 5 (US3) — the actual code change
3. Complete Phase 6 (Polish) — verify everything works
4. Manual validation per quickstart.md

### Incremental Delivery

Since only US3 requires code changes, the entire feature can be delivered in a single increment.

---

## Notes

- No backend changes required — all computation formulas are already correct
- No database migrations or schema changes
- No API endpoint changes — `PensionerResource` continues to return all fields
- The `netPensionOverpayment` and `agencyOverpayments` fields remain in the API response (backward compatible); only the frontend display changes
