---

description: "Task list for fixing Add User functionality"
---

# Tasks: Fix Add User Functionality

**Input**: Design documents from `specs/011-fix-add-user/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No new tests required — the fix is in error handling and auth flow; existing tests already cover the backend logic.

**Organization**: Tasks are grouped by user story. US1 and US2 are tightly coupled (both involve the same Axios interceptor fix). US3 is an independent enhancement for role seeding.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend services**: `apps/frontend/src/services/`
- **Backend seeders**: `apps/backend/database/seeders/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project is already set up and dependencies are installed. No setup tasks needed.

No tasks. All prerequisites are satisfied by the existing codebase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — the fixes are self-contained frontend changes.

No tasks.

---

## Phase 3: User Story 1 - Successful User Creation (Priority: P1) 🎯 MVP

**Goal**: Enable successful user creation by removing the hardcoded error override that blocks all 401 responses.

**Independent Test**: Log in, open Add User, fill all fields, submit — user should be created and list should refresh with a success notification.

### Implementation for User Story 1

- [ ] T001 [US1] Remove hardcoded 401 error override in `apps/frontend/src/services/api.ts` lines 40-42 so the actual server error message passes through to the caller

**Checkpoint**: User creation no longer blocked by the hardcoded error message.

---

## Phase 4: User Story 2 - Meaningful Error Messages (Priority: P1)

**Goal**: Ensure the frontend displays the actual error message returned by the backend instead of the misleading "Invalid username or password."

**Independent Test**: Submit with a duplicate email — must see "The email has already been taken". Submit with invalid token — must see "Unauthenticated."

### Implementation for User Story 2

- [ ] T002 [US2] Fix dev credentials login flow in `apps/frontend/src/services/auth.ts` to call the real login API instead of storing a fake token, so that subsequent API requests carry a valid Sanctum token
- [ ] T003 [US2] Verify `apps/frontend/src/pages/UserManagementPage.tsx` error display renders the actual error message from the catch block (line ~186-188) instead of a hardcoded fallback

**Checkpoint**: All error scenarios produce messages that accurately describe the actual problem.

---

## Phase 5: User Story 3 - Role Assignment (Priority: P2)

**Goal**: Ensure the role dropdown is populated with available roles, and if no roles exist, default roles are seeded without affecting existing data.

**Independent Test**: Open Add User — role dropdown must show options. If no roles in DB, default roles (Administrator, Encoder, Reviewer, Approver) must be available.

### Implementation for User Story 3

- [ ] T004 [US3] Create or update a Laravel seeder in `apps/backend/database/seeders/RolesSeeder.php` that seeds default roles (Administrator, Encoder, Reviewer, Approver) idempotently — checking `Role::where('slug', $slug)->exists()` before inserting
- [ ] T005 [US3] Verify `apps/frontend/src/services/users.ts` `getRoles()` endpoint call returns roles and `apps/frontend/src/pages/UserManagementPage.tsx` populates the role dropdown from the response data

**Checkpoint**: Roles are always available in the dropdown, and new users can be assigned a role at creation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification checks after all changes are applied.

- [ ] T006 [P] Run `cd apps/frontend && npx tsc --noEmit` to verify TypeScript strict mode passes
- [ ] T007 [P] Run `cd apps/frontend && npm run lint` to verify no lint violations
- [ ] T008 [P] Run `cd apps/frontend && npm test` to confirm all frontend tests pass
- [ ] T009 [P] Run `cd apps/backend && php artisan test` to confirm all backend tests pass
- [ ] T010 Run `cd apps/backend && php artisan db:seed --class=RolesSeeder` to verify role seeding works
- [ ] T011 Run manual validation per `specs/011-fix-add-user/quickstart.md` scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No tasks
- **US1 (Phase 3)**: Can start immediately — single file edit
- **US2 (Phase 4)**: Independent from US1 — can run in parallel
- **US3 (Phase 5)**: Independent from US1 and US2 — can run in parallel
- **Polish (Phase 6)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: No dependencies — single file change in `api.ts`
- **US2 (P1)**: Independent — files are `auth.ts` and `UserManagementPage.tsx` (different from `api.ts`)
- **US3 (P2)**: Independent — file is `RolesSeeder.php` (backend, not frontend)

### Parallel Opportunities

- T001 (US1), T002-T003 (US2), and T004-T005 (US3) can all run in parallel since they modify different files
- T006-T010 (Polish) can run in parallel once all user story phases are complete

---

## Parallel Example: User Story 1 + User Story 2 + User Story 3

```bash
# All three user stories can be implemented simultaneously:
Task: "Fix Axios interceptor in api.ts"
Task: "Fix auth flow in auth.ts"
Task: "Create role seeder in RolesSeeder.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

The MVP is just the `api.ts` fix — remove the hardcoded 401 error message. This alone restores user creation:

1. Complete Phase 3 (US1) — fix `api.ts`
2. Run verification to confirm it works

### Incremental Delivery

1. Fix `api.ts` (US1) → User creation works, errors are accurate → **MVP**
2. Fix `auth.ts` (US2) → Dev auth uses real API, proper session management
3. Seed roles (US3) → Role dropdown always populated

---

## Notes

- Root cause is entirely in the frontend — no backend changes needed
- The `api.ts` interceptor fix is the single most critical change (removes the misleading message)
- The `auth.ts` dev credentials fix prevents future 401s from fake tokens
- Role seeding is idempotent — safe to run multiple times
