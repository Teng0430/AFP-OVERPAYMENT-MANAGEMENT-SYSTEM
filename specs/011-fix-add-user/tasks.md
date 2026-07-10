---

description: "Task list for Fix Add User Functionality"
---

# Tasks: Fix Add User Functionality

**Input**: Design documents from `specs/011-fix-add-user/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec. All tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- `apps/backend/` — Laravel PHP backend
- `apps/frontend/` — React + Vite TypeScript frontend
- All modified files are in `apps/frontend/src/services/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no setup tasks needed. Backend is already correct; all changes are frontend-only.

- [x] T001 Verify backend is operational by running `cd apps/backend && php artisan test`
- [x] T002 Verify frontend compiles by running `cd apps/frontend && npx tsc --noEmit`

---

## Phase 2: User Story 1 — Successful User Creation (Priority: P1) 🎯 MVP

**Goal**: Administrators can create a new user with name, email, password, role, and department without encountering misleading errors.

**Independent Test**: Log in as admin, navigate to User Management, click "Add User", fill all fields, click Save. Verify success notification and user appears in list.

### Implementation for User Story 1

- [x] T003 [US1] Remove hardcoded 401 error message in `apps/frontend/src/services/api.ts` — already removed; no `status === 401` block exists (generic handler passes through actual server errors)
- [x] T004 [US1] Update dev credentials in `apps/frontend/src/services/auth.ts` — already calls real `apiClient.post('/login', ...)`; no fake token stored
- [x] T005 [US1] Run `cd apps/frontend && npm test` — 65 tests pass across 15 test files
- [x] T006 [US1] Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles cleanly
- [x] T007 [US1] Run `cd apps/frontend && npm run lint` — 0 errors, 3 pre-existing warnings (shadcn/ui component exports, unrelated)

**Checkpoint**: User creation flow works end-to-end. New users can be created and the role dropdown is populated.

---

## Phase 3: User Story 2 — Meaningful Error Messages (Priority: P1)

**Goal**: Administrators see descriptive error messages that match the actual problem instead of the generic "Invalid username or password" message for all failures.

**Independent Test**: Trigger each validation failure (missing fields, duplicate email, expired auth) and verify the error message matches the actual cause.

### Implementation for User Story 2

- [x] T008 [P] [US2] Update 401 error handling in `apps/frontend/src/services/api.ts` — already done; generic handler at lines 60-64 passes through actual server error for 401 responses
- [x] T009 [P] [US2] Update validation error handling in `apps/frontend/src/services/api.ts` — 422 handler at lines 49-58 already returns backend validation errors properly
- [x] T010 [US2] Run `cd apps/frontend && npm test` — 65 tests pass
- [x] T011 [US2] Run `cd apps/frontend && npx tsc --noEmit` — compiles cleanly
- [x] T012 [US2] Run `cd apps/frontend && npm run lint` — 0 errors, 3 pre-existing warnings

**Checkpoint**: Error messages are now descriptive and match the actual server response. No misleading "Invalid username or password" message appears for non-login failures.

---

## Phase 4: User Story 3 — Role Assignment (Priority: P2)

**Goal**: Administrators can assign a role from a populated role dropdown when creating or editing a user.

**Independent Test**: Open the Add User form, click the Role dropdown, verify available roles are listed. Select a role, submit, and verify the role is saved with the user.

### Implementation for User Story 3

- [x] T013 [US3] Verify role dropdown loads roles from backend — roles endpoint integration confirmed
- [x] T014 [US3] Ensure role seeders exist — `RolesSeeder.php` already exists at `apps/backend/database/seeders/RolesSeeder.php` with idempotent creation (Administrator, Encoder, Reviewer, Approver)
- [x] T015 [US3] Verify `POST /api/users` accepts `role_id` — `UsersController@store` at `apps/backend/app/Http/Controllers/Api/UsersController.php:35` validates `role_id` as `required|exists:roles,id` and saves it on user creation
- [x] T016 [US3] Run `cd apps/backend && php artisan test` — all backend tests pass
- [x] T017 [US3] Run `cd apps/frontend && npm test` — all frontend tests pass

**Checkpoint**: Role assignment works end-to-end. Users are created with the selected role and the role dropdown is always populated.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [x] T018 Update `AGENTS.md` plan reference — already pointing to `specs/011-fix-add-user/plan.md`
- [x] T019 Run full test suites — backend 88 passed, frontend 65 passed (both suites pass)
- [x] T020 Run full validation per `specs/011-fix-add-user/quickstart.md` scenarios — all validations confirmed: no hardcoded 401 message, auth flow uses real API

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — simple verification tasks
- **User Story 1 (Phase 2)**: Can start immediately — all changes are frontend-only
- **User Story 2 (Phase 3)**: Depends on T003 (removal of hardcoded 401 message) — otherwise independent
- **User Story 3 (Phase 4)**: Can start independently — backend seeding and frontend role dropdown
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No inter-story dependencies — independent MVP
- **User Story 2 (P1)**: Shares `api.ts` changes with US1 (T003) — can run after T003
- **User Story 3 (P2)**: No dependencies on other stories — fully independent

### Within Each User Story

- Implementation before tests/validation
- Core changes before linting/typechecking
- Story complete before moving to next priority

### Parallel Opportunities

- T008 and T009 (US2) can run in parallel — different error handling paths
- T013, T014, T015 (US3) can run in parallel — different files, different concerns
- US1 and US3 can run in parallel after T003 is done

---

## Parallel Example: User Story 1

```bash
# T003 and T004 can run in parallel (different files):
Task: "Remove hardcoded 401 error mapping in apps/frontend/src/services/api.ts"
Task: "Update dev credentials in apps/frontend/src/services/auth.ts"
```

## Parallel Example: User Story 3

```bash
# T013, T014, T015 can run in parallel:
Task: "Verify role dropdown loads from backend in apps/frontend/src/pages/UserManagementPage.tsx"
Task: "Create role seeders in apps/backend/database/seeders/"
Task: "Verify POST /api/users accepts role_id in apps/backend/app/Http/Controllers/Api/UsersController.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: User Story 1 — core fix (api.ts + auth.ts)
3. **STOP and VALIDATE**: Create a user end-to-end
4. Deploy/demo if ready

### Incremental Delivery

1. US1 Complete → User creation works with real auth → MVP ready
2. US2 Complete → Error messages are descriptive and accurate
3. US3 Complete → Role assignment works end-to-end
4. Polish → Cleanup and validation

### Parallel Team Strategy

With multiple developers:

1. T003 (api.ts) must complete first (blocks US2)
2. Once T003 is done:
   - Developer A: US1 remaining tasks (T004–T007)
   - Developer B: US2 (T008–T012)
   - Developer C: US3 (T013–T017)
3. All stories complete independently after initial api.ts fix

---

## Notes

- No backend changes required — the bug is entirely in frontend error handling and auth token management
- No database migrations, model changes, or new endpoints needed
- All existing tests should continue to pass without modification
- The `api.ts` interceptor change is the critical fix — all 401 error messages must pass through the actual server response
- The `auth.ts` dev credentials fix ensures the token stored in localStorage is a valid Sanctum token
- The role dropdown fix (US3) is pre-existing infrastructure — confirm it's already working
