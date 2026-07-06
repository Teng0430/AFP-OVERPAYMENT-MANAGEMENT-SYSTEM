---

description: "Task list for Fix Add Pensioner & Multi-Component Overpayment Computation"
---

# Tasks: Fix Add Pensioner & Multi-Component Overpayment Computation

**Input**: Design documents from `specs/008-fix-pensioner-form/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `apps/backend/`
- Frontend: `apps/frontend/`

---

## Phase 1: Setup

**Purpose**: Project initialization — NO setup tasks needed; project is already scaffolded from features 001–004 and updated through 007.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend — Migration, Model, Service, Controller

- [x] T001 [P] Create database migration adding `crediting_agency_name` (varchar(50), nullable) column to pensioners table in `apps/backend/database/migrations/2026_07_06_000012_add_crediting_agency_to_pensioners.php`
- [ ] T002 Update `Pensioner` model in `apps/backend/app/Models/Pensioner.php` — add `crediting_agency_name` to `$fillable` and `casts`; update `agency_deductions` cast to accept entries with `crediting_agency` boolean; add computed accessors: `net_monthly_pension`, `net_pension_overpayment`, `agency_overpayments`, `grand_total_overpayment`; update `daily_rate` and `overpayment_amount` to delegate to new service methods
- [ ] T003 [P] Update `OverpaymentCalculationService` in `apps/backend/app/Services/OverpaymentCalculationService.php` — add `netMonthlyPension(float $gross, array $deductions): float`, `componentOverpayment(float $amount, ?string $dateOfDeath, ?string $lastPayment): float`, `netPensionOverpayment(float $gross, array $deductions, ?string $dateOfDeath, ?string $lastPayment): float`, `agencyOverpayments(array $deductions, ?string $dateOfDeath, ?string $lastPayment): array`, `grandTotalOverpayment(float $netPensionOverpayment, array $agencyOverpayments): float`; keep existing methods for backward compat
- [ ] T004 [P] Update `StorePensionerRequest` in `apps/backend/app/Http/Requests/StorePensionerRequest.php` — validate `agency_deductions.*.crediting_agency` (boolean, first entry must be true); validate net pension >= 0 (total deductions <= gross); add validation rule for crediting agency name consistency
- [ ] T005 [P] Update `UpdatePensionerRequest` in `apps/backend/app/Http/Requests/UpdatePensionerRequest.php` — mirror store request changes with `sometimes` rules
- [ ] T006 [P] Update `PensionerResource` in `apps/backend/app/Http/Resources/PensionerResource.php` — include `crediting_agency_name`, `net_monthly_pension`, `agency_overpayments`, `net_pension_overpayment`, `grand_total_overpayment` in API response
- [ ] T007 [P] Update `PensionerController` in `apps/backend/app/Http/Controllers/Api/PensionerController.php` — call new multi-component computation methods during store/update; derive `crediting_agency_name` from first deduction entry; persist `crediting_agency_name` to model; fix any payload mapping that causes validation errors

### Frontend — Types, Services, Calc Engine

- [ ] T008 [P] Update interfaces in `apps/frontend/src/types/index.ts` — add `creditingAgency: boolean` to `AgencyDeduction`; add `AgencyOverpayment` interface (`{agencyName, amount, overpayment}`); add `MultiComponentResult` interface (`{netMonthlyPension, netPensionOverpayment, agencyOverpayments, grandTotalOverpayment}`); update `Pensioner` interface with `creditingAgencyName`, `netMonthlyPension`, `grandTotalOverpayment`
- [ ] T009 [P] Update `financial-calculations.ts` in `apps/frontend/src/lib/financial-calculations.ts` — add `computeOverpaymentFactors(dateOfDeath, lastPayment)` returning shared factors; add `computeComponentOverpayment(monthlyAmount, factors)` for reusable per-component math; add `computeFullBreakdown(grossPension, deductions, dateOfDeath, lastPayment)` returning multi-component result; keep existing `computeOverpayment` for backward compat
- [ ] T010 [P] Update `pensioners.ts` service in `apps/frontend/src/services/pensioners.ts` — fix payload serialization to send snake_case field names (this is the root cause of the "Unable to connect" error); add `crediting_agency_name` and `agency_deductions[*].crediting_agency` to create/update payloads; handle validation error responses properly (surface backend error messages instead of generic network error)
- [ ] T011 [P] Backend test for multi-component computation in `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` — add tests for `netMonthlyPension`, `componentOverpayment`, `netPensionOverpayment`, `agencyOverpayments`, `grandTotalOverpayment`
- [ ] T012 [P] Frontend computation test for multi-component functions in `apps/frontend/src/lib/__tests__/overpayment-computation.test.ts` — add tests for `computeFullBreakdown`, `computeOverpaymentFactors`, `computeComponentOverpayment`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Fix Add Pensioner Submission (Priority: P1) 🎯 MVP

**Goal**: The Add Pensioner form submits successfully without the "Unable to connect" error. Validation errors show field-level messages from the backend.

**Independent Test**: Open Add Pensioner form, fill all fields with valid data, submit — record saves and confirmation appears. Submit with invalid data (e.g., blank required field) — field-level error messages appear instead of generic "Unable to connect".

### Implementation for User Story 1

- [ ] T013 [P] [US1] Fix frontend API error handling in `apps/frontend/src/services/pensioners.ts` — ensure 422 validation error responses are parsed and surfaced to the form instead of being caught by the generic axios error handler
- [ ] T014 [P] [US1] Fix frontend payload serialization in `AddPensionerPage` and pensioners service — ensure all form fields are serialized as snake_case before sending to backend; specifically `agency_deductions` array entries must be `{agency_name, amount}` not `{agencyName, amount}`; test by capturing the actual HTTP request payload
- [ ] T015 [US1] Update `AddPensionerPage` in `apps/frontend/src/pages/AddPensionerPage.tsx` — improve error display to show backend validation error messages inline next to fields; add error state handling for network/timeout errors with descriptive messages

**Checkpoint**: Add Pensioner form submits and validates correctly. The "Unable to connect" error is resolved.

---

## Phase 4: User Story 2 — Crediting Agency Rule (Priority: P1)

**Goal**: The first agency deduction entry is automatically designated as the crediting agency. This flag is stored, persisted, and visually distinguished in the UI.

**Independent Test**: Create a pensioner with 3 agency deductions. Verify the first entry is marked as "Crediting Agency" in the UI. Reorder rows — the flag stays on the original first entry. View the saved record — the crediting agency is stored and retrievable.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Update `AgencyDeductionRepeater` in `apps/frontend/src/components/pensioner/AgencyDeductionRepeater.tsx` — add visual badge/label "Crediting Agency" on the first row; add up/down reorder buttons to each row; when reordering, the crediting agency badge stays with the original first row regardless of new position
- [ ] T017 [P] [US2] Update `AddPensionerPage` in `apps/frontend/src/pages/AddPensionerPage.tsx` — ensure the first agency deduction in the form submission is marked with `crediting_agency: true`; all other rows get `crediting_agency: false`; display crediting agency name in a summary section
- [ ] T018 [P] [US2] Update `PensionersPage` in `apps/frontend/src/pages/PensionersPage.tsx` — add "Crediting Agency" column showing `creditingAgencyName`; highlight the crediting agency row or show a badge in the deductions summary

**Checkpoint**: Crediting agency rule works end-to-end — marked at submission, stored in DB, displayed in form and list.

---

## Phase 5: User Story 3 — Multi-Component Overpayment Computation (Priority: P1)

**Goal**: The system computes Net Monthly Pension, Net Pension Overpayment, per-agency overpayments, and Grand Total Overpayment. All values update in real time and are displayed with a detailed breakdown.

**Independent Test**: Enter Gross Pension 100,000, LBP (crediting, 2,000), ALIP (10,000), PVB (5,000), DoD 15-Jan-2026, Last Payment 31-Mar-2026. Verify: Net = 83,000, each agency overpayment is independently computed, Grand Total = Net Pension Overpayment + LBP + ALIP + PVB.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Rewrite `OverpaymentComputationBreakdown` in `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx` — display multi-component breakdown: Gross Pension, Total Deductions, Net Monthly Pension, Crediting Agency; per-agency section showing each agency's fractional amount, whole-month amount, and total; final summary with Net Pension Overpayment, Total Agency Overpayments, and Grand Total Overpayment
- [ ] T020 [US3] Integrate multi-component computation into `AddPensionerPage` — subscribe to changes on all inputs (gross pension, all agency deductions, dates); call `computeFullBreakdown()` on each change; pass result to `OverpaymentComputationBreakdown`; ensure all computed values update within 500ms
- [ ] T021 [P] [US3] Update backend `OverpaymentComputationTest` in `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` — add test for the full multi-component scenario: gross=100000, deductions=[LBP 2000, ALIP 10000, PVB 5000], DoD=15-Jan-2026, LP=31-Mar-2026; verify net monthly pension, net pension overpayment, each agency overpayment, and grand total
- [ ] T022 [P] [US3] Add frontend test in `apps/frontend/src/lib/__tests__/overpayment-computation.test.ts` — test `computeFullBreakdown` with the same scenario; verify the grand total mathematically equals gross pension × date factors

**Checkpoint**: Multi-component overpayment is fully computed and displayed. All components independently calculated and summed correctly.

---

## Phase 6: User Story 4 — Dynamic Agency Support (Priority: P2)

**Goal**: Users can add up to 10 agency deduction rows dynamically, remove rows, reorder rows, and see all computed values recalculate automatically.

**Independent Test**: Start with 0 rows, add 5 agency rows, fill amounts, verify grand total shows. Remove 2 rows, verify recalculation. Reorder rows, verify crediting agency stays on original first entry. Attempt to add 11th row — prevented.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Add reorder up/down buttons to each row in `AgencyDeductionRepeater` — when reordering, ensure `creditingAgency` flag persists on the original first row; update parent form state with reordered array
- [ ] T024 [P] [US4] Add frontend test for dynamic agency operations in `apps/frontend/src/lib/__tests__/agency-deductions.test.ts` — test add row (up to 10), remove row (min 1), reorder row, crediting agency flag persistence after reorder
- [ ] T025 [US4] Update validation in `AddPensionerPage` — disable "Add Agency" button at 10 rows; show summary of remaining slots; validate each row's agency_name and amount on blur

**Checkpoint**: Dynamic agency support is complete — add, remove, reorder all work with real-time recalculation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T026 Run full backend test suite: `cd apps/backend && php artisan test`
- [ ] T027 Run full frontend test suite: `cd apps/frontend && npm test`
- [ ] T028 Run frontend type check: `cd apps/frontend && npx tsc --noEmit`
- [ ] T029 [P] Run frontend linter: `cd apps/frontend && npm run lint`
- [ ] T030 [P] Run backend linter: `cd apps/backend && ./vendor/bin/pint`
- [ ] T031 [P] Run backend static analysis: `cd apps/backend && ./vendor/bin/phpstan analyse`
- [ ] T032 Run quickstart validation scenarios from `specs/008-fix-pensioner-form/quickstart.md` — execute all 7 scenarios manually
- [ ] T033 Final review: verify backward compatibility with existing pensioner records; verify old `agency_deduction` column still accessible; verify zero "Unable to connect" regression

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: No dependencies — can start immediately; ALL user stories depend on this
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) → can start directly after Foundational
  - US2 (Phase 4) → can start after Foundational, parallel with US1
  - US3 (Phase 5) → can start after Foundational, parallel with US1/US2
  - US4 (Phase 6) → can start after US2 (shares AgencyDeductionRepeater)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories (MVP scope)
- **US2 (P1)**: Can start after Foundational — independent of US1
- **US3 (P1)**: Can start after Foundational — computation engine independent of form; UI integration with form depends on US1
- **US4 (P2)**: Depends on US2 (agency repeater modifications build on crediting agency feature)

### Parallel Opportunities

- All Foundational [P] tasks can run in parallel (T001, T003-T012)
- US1 tasks can run in parallel with US2 and US3 foundational work
- US2 and US3 can run in parallel after foundational
- US4 builds on US2 (sequential)
- All Polish [P] tasks can run in parallel (T029-T031)

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent backend tasks together:
Task: "Create migration at apps/backend/database/migrations/"
Task: "Update OverpaymentCalculationService at apps/backend/app/Services/"
Task: "Update StorePensionerRequest at apps/backend/app/Http/Requests/"
Task: "Update PensionerResource at apps/backend/app/Http/Resources/"
Task: "Update PensionerController at apps/backend/app/Http/Controllers/Api/"
```

```bash
# Launch all independent frontend tasks together:
Task: "Update types in apps/frontend/src/types/index.ts"
Task: "Update financial-calculations.ts in apps/frontend/src/lib/"
Task: "Update pensioners.ts service in apps/frontend/src/services/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently — form submits without "Unable to connect", validation errors surface properly
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add US1 (Fix submission) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Crediting agency) → Test independently → Deploy/Demo
4. Add US3 (Multi-component computation) → Test independently → Deploy/Demo
5. Add US4 (Dynamic agency) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Developer A: US1 (form submission fix) + US3 (computation — independent)
3. Developer B: US2 (crediting agency) + US4 (dynamic agency — builds on US2)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
