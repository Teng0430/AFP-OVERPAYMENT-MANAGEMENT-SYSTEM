---

description: "Task list for Pensioner Form & Overpayment Computation Update"
---

# Tasks: Pensioner Form & Overpayment Computation Update

**Input**: Design documents from `specs/007-pensioner-form-overpayment-computation/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Unit tests are REQUIRED per spec — comprehensive coverage of computation edge cases, leap years, validation failures, and agency deduction array operations.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `apps/backend/`
- Frontend: `apps/frontend/`

---

## Phase 1: Setup

**Purpose**: Project initialization — NO setup tasks needed; project is already scaffolded from features 001–004.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend — Schema, Model, Service

- [ ] T001 [P] Create database migration adding `last_payment` (date, required) and `agency_deductions` (json, nullable) columns to pensioners table in `apps/backend/database/migrations/YYYY_MM_DD_HHMMSS_update_pensioners_table.php`
- [ ] T002 Update `Pensioner` model in `apps/backend/app/Models/Pensioner.php` — add `last_payment` and `agency_deductions` to `$fillable`, cast `agency_deductions` to array, add `$dates`, update computed accessors to use new formula
- [ ] T003 [P] Rewrite `OverpaymentCalculationService` in `apps/backend/app/Services/OverpaymentCalculationService.php` — implement new formula (startDate = DoD+1, endDate = last day of last_payment month, wholeMonths, fractionalDays, totalDays, dailyRate, overpaymentAmount) with leap-year-safe date arithmetic
- [ ] T004 [P] Update `StorePensionerRequest` in `apps/backend/app/Http/Requests/StorePensionerRequest.php` — add `last_payment` (required, date), `agency_deductions` (array, max:10, each with agency_name + amount), remove `fractional_days`/`whole_months` from accepted inputs, make `date_of_death` required, validate monthly_pension > 0
- [ ] T005 [P] Update `UpdatePensionerRequest` in `apps/backend/app/Http/Requests/UpdatePensionerRequest.php` — mirror store request changes with `sometimes` rules
- [ ] T006 [P] Update `PensionerResource` in `apps/backend/app/Http/Resources/PensionerResource.php` — include `last_payment`, `agency_deductions`, `start_date`, `end_date`, `daily_rate`, `total_overpayment_days`, `overpayment_amount` in API response
- [ ] T007 [P] Update `PensionerController` in `apps/backend/app/Http/Controllers/Api/PensionerController.php` — call new `OverpaymentCalculationService` during store/update to persist computed `fractional_days` and `whole_months`; map legacy `agency_deduction` to first entry of `agency_deductions` for backward compat

### Frontend — Types, Services, Calc Engine

- [ ] T008 [P] Update constants in `apps/frontend/src/types/index.ts` — replace `RANK_OPTIONS` with new 46-value list (ADM, VADM, RADM, etc.), replace `AGENCY_OPTIONS` with new 24-value list (LBP, DBP, PVB, etc.), add `AgencyDeduction` interface, update `Pensioner` interface with `lastPayment`, `agencyDeductions`, `startDate`, `endDate`, `dailyRate`, `totalDays`, `overpaymentAmount`
- [ ] T009 [P] Rewrite `financial-calculations.ts` in `apps/frontend/src/lib/financial-calculations.ts` — implement pure function `computeOverpayment(input: OverpaymentInput): OverpaymentResult` using new formula, export new interface types
- [ ] T010 [P] Update `pensioners.ts` service in `apps/frontend/src/services/pensioners.ts` — update `createPensioner` and `updatePensioner` payload types to include `last_payment`, `agency_deductions`, remove `fractional_days`/`whole_months` from create payload

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Add Pensioner with Updated Form Fields (Priority: P1) 🎯 MVP

**Goal**: Encoders can open the Add Pensioner form and see updated Rank dropdown, Agency Name dropdown, dynamic agency deduction repeater (default 1 row, max 10), and required Last Payment field, then submit successfully.

**Independent Test**: Open Add Pensioner form, verify updated dropdown values, add 3 agency deduction rows, fill Last Payment, fill all fields, submit, and verify the record appears in the pensioner list.

### Tests for User Story 1

- [ ] T011 [P] [US1] Unit test for agency deduction array validation (max 10, min 1, negative amounts rejected, empty agency_name rejected) in `apps/frontend/src/lib/__tests__/agency-deductions.test.ts`
- [ ] T012 [P] [US1] Unit test for form field presence (Rank dropdown has all 46 values, Agency dropdown has all 24 values, Last Payment field exists) in `apps/frontend/src/lib/__tests__/form-fields.test.ts`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `AgencyDeductionRepeater` component in `apps/frontend/src/components/pensioner/AgencyDeductionRepeater.tsx` — dynamic row list with agency searchable dropdown per row, deduction amount input, Add Agency button (disabled at 10), Remove row button (disabled at 1 row)
- [ ] T014 [US1] Rewrite `AddPensionerPage` in `apps/frontend/src/pages/AddPensionerPage.tsx` — integrate new rank dropdown (searchable), agency name dropdown (searchable), AgencyDeductionRepeater, Last Payment date field; update zod validation schema; wire react-hook-form to new fields; integrate live financial summary card (placeholder until US2)
- [ ] T015 [US1] Update `PensionersPage` in `apps/frontend/src/pages/PensionersPage.tsx` — add Last Payment column, display agency_deductions summary (e.g., "3 deductions: LBP, AFPSLAI, ..."), update filters to include last_payment range

**Checkpoint**: Add Pensioner form is functional with all new UI components; records can be submitted and displayed in the list.

---

## Phase 4: User Story 2 — Automated Overpayment Computation (Priority: P1)

**Goal**: As the encoder fills in Date of Death, Last Payment, and Monthly Pension, the system automatically computes and displays the overpayment breakdown in real time.

**Independent Test**: Enter Date of Death (15-Jan-2026), Last Payment (31-Mar-2026), Monthly Pension (30,000) — verify computed values: 2 whole months, 16 fractional days, 75 total days, ₱967.74 daily rate, and correct overpayment amount.

### Tests for User Story 2

- [ ] T016 [P] [US2] Unit test for standard computation scenario (15-Jan-2026 → 31-Mar-2026 / 30k pension) in `apps/frontend/src/lib/__tests__/overpayment-computation.test.ts`
- [ ] T017 [P] [US2] Unit test for leap year (01-Feb-2024 → 29-Feb-2024 / 30k pension — daily rate = 30000/29) in same test file
- [ ] T018 [P] [US2] Unit test for same-month computation (15-Mar-2026 → 31-Mar-2026 — wholeMonths=0, fractionalDays=16, totalDays=17) in same test file
- [ ] T019 [P] [US2] Unit test for end-of-month boundary (31-Jan-2026 → 31-Mar-2026 — start=01-Feb, wholeMonths=1, fractionalDays=30) in same test file
- [ ] T020 [P] [US2] Unit test for multi-month leap year crossing (15-Dec-2023 → 29-Feb-2024) in same test file
- [ ] T021 [P] [US2] Unit test for months with 28/30/31 days (various start months) in same test file
- [ ] T022 [P] [US2] Backend unit test for overpayment computation in `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` — test same scenarios in PHP

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create `OverpaymentComputationBreakdown` component in `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx` — displays Start Date, End Date, Whole Months, Fractional Days in Month, Total Overpayment Days, Daily Pension Rate, Overpayment Amount with labels, formatted PHP currency, and clear visual layout
- [ ] T024 [US2] Integrate real-time computation into `AddPensionerPage` — subscribe to changes on `date_of_death`, `last_payment`, `monthly_pension`; call `computeOverpayment()` on each change; pass result to `OverpaymentComputationBreakdown`; update live financial summary card with computed values
- [ ] T025 [US2] Add computation display to `PensionersPage` table — show key computed values (whole months, fractional days, overpayment amount) in row, and provide expandable detail or modal with full computation breakdown

**Checkpoint**: Overpayment computation is fully automated — all inputs compute instantly, breakdown is visible, and values are persisted on save.

---

## Phase 5: User Story 3 — Form Validation (Priority: P2)

**Goal**: The system prevents submission when validation rules are violated and shows clear error messages for each field.

**Independent Test**: Attempt to submit with Last Payment before Date of Death, Monthly Pension = 0, negative deduction amounts, and empty required fields — all should show validation errors and block submission.

### Tests for User Story 3

- [ ] T026 [P] [US3] Backend validation test for StorePensionerRequest in `apps/backend/tests/Feature/Api/Pensioner/PensionerValidationTest.php` — test all new validation rules (last_payment after date_of_death, monthly_pension > 0, agency_deductions array constraints)
- [ ] T027 [P] [US3] Frontend validation test in `apps/frontend/src/lib/__tests__/form-validation.test.ts` — test zod schema rules for all field validations

### Implementation for User Story 3

- [ ] T028 [P] [US3] Enhance frontend validation error display in `apps/frontend/src/pages/AddPensionerPage.tsx` — ensure all validation errors are shown inline next to respective fields, with clear error messages; disable submit button when form is invalid
- [ ] T029 [US3] Add cross-field validation for Last Payment vs Date of Death — show inline error on Last Payment field when it's earlier than Date of Death
- [ ] T030 [US3] Add validation for maximum 10 agency deduction rows — disable Add Agency button at 10; show warning if user tries to exceed

**Checkpoint**: All validation rules are enforced on both frontend and backend.

---

## Phase 6: User Story 4 — Label Update: Fractional Days in Month (Priority: P2)

**Goal**: Every user-facing instance of "Fraction Days" is replaced with "Fractional Days in Month" — across forms, tables, reports, exports, and computation breakdowns.

**Independent Test**: View the Add Pensioner form, pensioner list table, computation breakdown, and any report/export — all must show "Fractional Days in Month" with zero instances of "Fraction Days" remaining.

### Tests for User Story 4

- [ ] T031 [US4] Search the entire frontend and backend codebase for "Fraction Days" (case-insensitive) and verify zero remaining user-facing instances in `apps/frontend/src/` and `apps/backend/app/`

### Implementation for User Story 4

- [ ] T032 [P] [US4] Update frontend label references — replace "Fraction Days" with "Fractional Days in Month" in `apps/frontend/src/pages/AddPensionerPage.tsx`, `apps/frontend/src/pages/PensionersPage.tsx`, `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`, and any other UI components
- [ ] T033 [P] [US4] Update backend label references — replace "Fraction Days" with "Fractional Days in Month" in reports (`apps/backend/app/Http/Controllers/Api/ReportsController.php`), exports (PDF/CSV), and any other user-facing strings
- [ ] T034 [US4] Update report templates and export column headers — check `apps/backend/app/Http/Controllers/Api/ReportsController.php` for export headers, PDF generation strings

**Checkpoint**: Label rename is complete and consistent across the entire application.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T035 Run full backend test suite: `cd apps/backend && php artisan test`
- [ ] T036 Run full frontend test suite: `cd apps/frontend && npm test`
- [ ] T037 Run frontend type check: `cd apps/frontend && npx tsc --noEmit`
- [ ] T038 [P] Run frontend linter: `cd apps/frontend && npm run lint`
- [ ] T039 [P] Run backend linter: `cd apps/backend && ./vendor/bin/pint`
- [ ] T040 [P] Run backend static analysis: `cd apps/backend && ./vendor/bin/phpstan analyse`
- [ ] T041 Run quickstart validation scenarios from `specs/007-pensioner-form-overpayment-computation/quickstart.md` — execute all 7 scenarios manually
- [ ] T042 Final review: verify no old "Fraction Days" labels remain; verify backward compatibility with existing records

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: No dependencies — can start immediately; ALL user stories depend on this
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) → US2 (Phase 4) sequential due to form UI integration order
  - US3 (Phase 5) can start after Foundational, in parallel with US1/US2
  - US4 (Phase 6) can start after Foundational, in parallel with any other story
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories (MVP scope)
- **US2 (P1)**: Depends on US1 form being available (computation display integrated into form)
- **US3 (P2)**: Can start after Foundational — independent of US1/US2/US4
- **US4 (P2)**: Can start after Foundational — independent of US1/US2/US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before page integration
- Page integration before list/display updates
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational [P] tasks can run in parallel (T001-T010)
- US1 tests [P] can run in parallel (T011-T012)
- US2 tests [P] can run in parallel with each other (T016-T022)
- US3 tasks can run in parallel with US1/US2 tasks
- US4 tasks can run in parallel with any other story
- All Polish [P] tasks can run in parallel (T038-T040)

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent backend tasks together:
Task: "Create migration script at apps/backend/database/migrations/"
Task: "Rewrite OverpaymentCalculationService at apps/backend/app/Services/"
Task: "Update StorePensionerRequest at apps/backend/app/Http/Requests/"
Task: "Update PensionerResource at apps/backend/app/Http/Resources/"
```

```bash
# Launch all independent frontend tasks together:
Task: "Update constants in apps/frontend/src/types/index.ts"
Task: "Rewrite financial-calculations.ts in apps/frontend/src/lib/"
Task: "Update pensioners.ts service in apps/frontend/src/services/"
```

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Standard computation test"
Task: "Leap year test"
Task: "Same-month test"
Task: "End-of-month boundary test"
Task: "Multi-month leap year test"
Task: "28/30/31 day month test"
Task: "Backend overpayment computation test"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently — Add Pensioner form with new fields works, saves records correctly
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add US1 (Form with new fields) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Automated computation) → Test independently → Deploy/Demo
4. Add US3 (Validation) → Test independently → Deploy/Demo
5. Add US4 (Label rename) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Developer A: US1 + US2 (form integration chain)
3. Developer B: US3 (validation — independent)
4. Developer C: US4 (label rename — independent)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
