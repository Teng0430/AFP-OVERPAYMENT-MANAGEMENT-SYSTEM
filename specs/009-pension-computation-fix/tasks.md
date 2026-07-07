---

description: "Task list for fixing pensioner computation and connection handling"
---

# Tasks: Fix Pensioner Computation & Connection Handling

**Input**: Design documents from `specs/009-pension-computation-fix/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests ARE included as requested in the feature specification (quickstart.md references specific test filters).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Dual-project monorepo**: `apps/backend/` (Laravel API), `apps/frontend/` (React SPA)
- Backend paths: `apps/backend/app/...`, `apps/backend/tests/...`
- Frontend paths: `apps/frontend/src/...`, `apps/frontend/tests/...`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure and configuration — no new project setup needed.

- [ ] T001 Verify CORS config in `apps/backend/config/cors.php` includes `http://localhost:5173` and `http://localhost:3000` in `allowed_origins`
- [ ] T002 [P] Verify `apps/frontend/.env` has correct `VITE_API_BASE_URL` pointing to backend API
- [ ] T003 Verify backend server starts: `cd apps/backend && php artisan serve` (confirm no errors)
- [ ] T004 [P] Verify frontend dev server starts: `cd apps/frontend && npm run dev` (confirm no errors)

**Checkpoint**: Environment confirmed working — computation and error-handling changes can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend computation logic change — crediting agency formula correction. This MUST be complete before any frontend changes to ensure consistency.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Update `OverpaymentCalculationService::netMonthlyPension()` in `apps/backend/app/Services/OverpaymentCalculationService.php` to filter out the crediting agency deduction (where `crediting_agency === true`) before summing deductions
- [ ] T006 Update `StorePensionerRequest::after()` in `apps/backend/app/Http/Requests/StorePensionerRequest.php` to validate that only non-crediting deduction total ≤ monthly_pension (change from all deductions)
- [ ] T007 [P] Update `UpdatePensionerRequest.php` at `apps/backend/app/Http/Requests/UpdatePensionerRequest.php` — add the same `after()` validation as StorePensionerRequest (check non-crediting deductions ≤ monthly_pension)
- [ ] T008 [P] Update `PensionerResource.php` at `apps/backend/app/Http/Resources/PensionerResource.php` — add `total_non_crediting` field computed as sum of deduction amounts where `crediting_agency` is false
- [ ] T009 Run backend tests: `cd apps/backend && php artisan test --filter="Pensioner"` (confirm existing tests still pass or update expected values)

**Checkpoint**: Backend foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Crediting Agency Amount Auto-Computes (Priority: P1) 🎯 MVP

**Goal**: The crediting agency amount automatically computes as Gross Monthly Pension minus only non-crediting agency deductions. The field is read-only and updates in real time.

**Independent Test**: Enter Gross Monthly Pension = 190,000, add non-crediting agencies AMWSLAI (10,000), ALIP (15,000), AFPMBAI (5,000). Crediting agency amount displays 160,000. Changing any value immediately updates the result.

### Tests for User Story 1

- [ ] T010 [P] [US1] Update backend computation test in `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` to verify net_monthly_pension excludes only non-crediting deductions
- [ ] T011 [US1] Update frontend computation test in `apps/frontend/src/lib/__tests__/overpayment-computation.test.ts` to verify `computeFullBreakdown` only subtracts non-crediting deductions

### Implementation for User Story 1

- [ ] T012 [US1] Update `computeFullBreakdown` in `apps/frontend/src/lib/financial-calculations.ts` — change `totalDeductions` to only sum deductions where `crediting_agency` is not `true`
- [ ] T013 [P] [US1] Update `PensionerController::computeAndMergeOverpayment()` in `apps/backend/app/Http/Controllers/Api/PensionerController.php` — ensure `net_monthly_pension` is not stored but computed via accessor; remove any manual `net_monthly_pension` setting if present
- [ ] T014 [US1] Ensure `AddPensionerPage.tsx` at `apps/frontend/src/pages/AddPensionerPage.tsx` makes the crediting agency amount field read-only and displays the computed value

**Checkpoint**: User Story 1 fully functional — crediting agency auto-computes correctly on both frontend and backend

---

## Phase 4: User Story 2 — Pension Summary Shows Correct Breakdown (Priority: P1)

**Goal**: Pension Summary displays exactly three rows: Gross Monthly Pension, Total Agency (non-crediting deductions only), and Net Monthly Pension (= Crediting Agency Amount). The "Deductions" field is removed.

**Independent Test**: Enter Gross Monthly Pension = 190,000 with three non-crediting agencies totaling 30,000. Summary shows Gross: 190,000, Total Agency: 30,000, Net: 160,000. No "Deductions" row appears.

### Tests for User Story 2

- [ ] T015 [P] [US2] Update backend summary test in `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` to verify PensionerResource response includes `total_non_crediting` and excludes any `deductions` field
- [ ] T016 [US2] Update frontend component test in `apps/frontend/src/components/pensioner/__tests__/OverpaymentComputationBreakdown.test.ts` to verify the three-row summary with no "Deductions" row

### Implementation for User Story 2

- [ ] T017 [P] [US2] Update `OverpaymentComputationBreakdown.tsx` at `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx` — remove the "Deductions" section, display only three rows: Gross Monthly Pension, Total Agency (sum of non-crediting deductions), Net Monthly Pension (= crediting agency amount)
- [ ] T018 [US2] Update `AddPensionerPage.tsx` at `apps/frontend/src/pages/AddPensionerPage.tsx` — remove any "Deductions" display from the computation summary card, ensure only the new three-row format is shown
- [ ] T019 [P] [US2] Update `PensionersPage.tsx` at `apps/frontend/src/pages/PensionersPage.tsx` — if the page previously displayed a "Deductions" column in the pensioner list, remove it

**Checkpoint**: User Story 2 complete — Pension Summary shows clean three-row format with no "Deductions" field

---

## Phase 5: User Story 3 — Reliable Connection and Error Handling (Priority: P1)

**Goal**: The frontend correctly distinguishes between network failures, server errors, validation errors, CORS errors, and API misconfigurations, displaying a specific message for each.

**Independent Test**: Simulate different failure modes — server down (500), validation failure (422), network timeout, and CORS error. Each shows a distinct, helpful message.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add frontend error handling tests in `apps/frontend/src/services/__tests__/api.test.ts` covering: network error, CORS error, timeout, 401, 403, 422, 500 — each should produce the correct error message from the spec

### Implementation for User Story 3

- [ ] T021 [US3] Update axios error interceptor in `apps/frontend/src/services/api.ts` — enhance the `!error.response` handler to distinguish:
  - CORS errors (check `error.message` for CORS-related patterns) → "Connection refused by server. Please check that the API server is running and CORS is configured correctly."
  - Timeout errors (check `error.code === 'ECONNABORTED'`) → "Request timed out. Please check your network connection and try again."
  - DNS/network errors (fallback) → "Unable to connect. Please check your internet connection and try again."
- [ ] T022 [US3] Verify the error display in `AddPensionerPage.tsx` at `apps/frontend/src/pages/AddPensionerPage.tsx` correctly renders all error types (validation errors show field-level list, server errors show message, connection errors show message)

**Checkpoint**: User Story 3 complete — error handling provides specific, useful messages for each failure type

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and cleanup across all stories.

- [ ] T023 Run full backend test suite: `cd apps/backend && php artisan test` (all tests pass)
- [ ] T024 [P] Run full frontend test suite: `cd apps/frontend && npm test` (all tests pass)
- [ ] T025 Run PHPStan: `cd apps/backend && vendor/bin/phpstan analyse --level=6` (zero errors)
- [ ] T026 [P] Run ESLint: `cd apps/frontend && npm run lint` (zero violations)
- [ ] T027 Run Pint: `cd apps/backend && vendor/bin/pint` (PSR-12 compliance)
- [ ] T028 [P] Run TypeScript type check: `cd apps/frontend && npx tsc --noEmit` (zero errors)
- [ ] T029 Run quickstart.md validation scenarios from `specs/009-pension-computation-fix/quickstart.md` to verify end-to-end behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 (Phase 4)**: Depends on Foundational (Phase 2). Can be done in parallel with US1.
- **US3 (Phase 5)**: Depends on Foundational (Phase 2). Can be done in parallel with US1 and US2.
- **Polish (Final Phase)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — Independent of US1 and US3
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) — Independent of US1 and US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core computation changes before display/UI changes
- Story complete before moving to next

### Parallel Opportunities

- T001, T002, T003, T004 (Phase 1) — all independent checks
- T006, T007, T008 (Phase 2) — independent file changes
- T010, T011 (US1 tests) — independent
- T015, T016 (US2 tests) — independent
- T020 (US3 tests) — single task
- T017, T019 (US2 impl) — independent
- US1 (Phase 3), US2 (Phase 4), US3 (Phase 5) — can all be worked on in parallel after Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Update backend computation test in apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php"
Task: "Update frontend computation test in apps/frontend/src/lib/__tests__/overpayment-computation.test.ts"

# Launch all implementation tasks for User Story 1 together:
Task: "Update computeFullBreakdown in apps/frontend/src/lib/financial-calculations.ts"
Task: "Update PensionerController::computeAndMergeOverpayment() in apps/backend/app/Http/Controllers/Api/PensionerController.php"
Task: "Update AddPensionerPage.tsx crediting field to read-only"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (backend computation change — CRITICAL)
3. Complete Phase 3: User Story 1 (crediting agency auto-computes)
4. **STOP and VALIDATE**: Test User Story 1 independently — verify crediting amount formula on both frontend and backend
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (crediting formula + read-only field)
   - Developer B: User Story 2 (Pension Summary display)
   - Developer C: User Story 3 (error interceptor enhancement)
3. Stories complete and integrate independently — no file conflicts between US1 and US3; US2 touches only display components

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Key formula change**: `netMonthlyPension` now subtracts only non-crediting deductions (where `crediting_agency !== true`)
