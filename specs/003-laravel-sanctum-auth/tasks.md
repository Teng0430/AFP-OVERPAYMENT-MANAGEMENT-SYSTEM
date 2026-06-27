---

description: "Task list for Laravel Sanctum Authentication feature"
---

# Tasks: Laravel Sanctum Authentication

**Input**: Design documents from `/specs/003-laravel-sanctum-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Included per constitution requirement — all backend features MUST be tested with Pest using in-memory SQLite (min 80% coverage).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/app/`, `apps/backend/routes/`, `apps/backend/tests/`
- **Frontend**: Not applicable (this feature is backend-only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing scaffold is ready — Sanctum is already installed, User model has `HasApiTokens`, response macros and exception handling are already configured. No new setup tasks needed.

- [ ] T001 Verify existing scaffold: Sanctum installed, User model has HasApiTokens, response macros in AppServiceProvider, exception handler in bootstrap/app.php

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T002 Configure rate limiting for auth endpoints in `apps/backend/app/Providers/AppServiceProvider.php` (define rate limiter for auth routes, 60 attempts/minute/IP)
- [ ] T003 [P] Create `AuthController` skeleton in `apps/backend/app/Http/Controllers/Api/AuthController.php` with placeholder methods (register, login, logout, tokens, revokeToken)
- [ ] T004 [P] Remove inline `/api/user` closure from `apps/backend/routes/api.php` and refactor to use `AuthController@user` method

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: New visitors can create an account with name, email, and password and receive an authentication token.

**Independent Test**: Submit valid registration data via `POST /api/register` and receive a 201 response with user data and a token.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Create `RegisterRequest` form request in `apps/backend/app/Http/Requests/RegisterRequest.php` with validation rules (name required|string|max:255, email required|string|email|unique:users, password required|string|min:8|confirmed)
- [ ] T006 [US1] Implement `register()` method in `apps/backend/app/Http/Controllers/Api/AuthController.php` — validate request, create User, create Sanctum token, return 201 with `response()->success(['user' => $user, 'token' => $token])`
- [ ] T007 [US1] Add public `POST /api/register` route in `apps/backend/routes/api.php` pointing to `AuthController@register`

### Tests for User Story 1

- [ ] T008 [US1] Create registration test file at `apps/backend/tests/Feature/Api/Auth/RegisterTest.php` — test successful registration returns 201 with user+token
- [ ] T009 [P] [US1] Test duplicate email returns 422 validation error in `apps/backend/tests/Feature/Api/Auth/RegisterTest.php`
- [ ] T010 [P] [US1] Test weak password (under 8 chars) returns 422 validation error in `apps/backend/tests/Feature/Api/Auth/RegisterTest.php`
- [ ] T011 [P] [US1] Test missing fields return 422 validation errors in `apps/backend/tests/Feature/Api/Auth/RegisterTest.php`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. New users can register.

---

## Phase 4: User Story 2 - User Login (Priority: P1)

**Goal**: Registered users can authenticate with email and password and receive a new authentication token.

**Independent Test**: Submit valid credentials via `POST /api/login` and receive a 200 response with user data and a token; invalid credentials receive 401.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Create `LoginRequest` form request in `apps/backend/app/Http/Requests/LoginRequest.php` with validation rules (email required|string|email, password required|string)
- [ ] T013 [US2] Implement `login()` method in `apps/backend/app/Http/Controllers/Api/AuthController.php` — validate request, attempt auth (via `Hash::check` or `Auth::attempt`), return 200 with token or 401 with generic error
- [ ] T014 [US2] Add public `POST /api/login` route in `apps/backend/routes/api.php` pointing to `AuthController@login`

### Tests for User Story 2

- [ ] T015 [US2] Create login test file at `apps/backend/tests/Feature/Api/Auth/LoginTest.php` — test successful login returns 200 with user+token
- [ ] T016 [P] [US2] Test invalid password returns 401 with generic "Invalid credentials." error in `apps/backend/tests/Feature/Api/Auth/LoginTest.php`
- [ ] T017 [P] [US2] Test unregistered email returns 401 with generic error (same message as invalid password) in `apps/backend/tests/Feature/Api/Auth/LoginTest.php`
- [ ] T018 [P] [US2] Test missing fields return 422 validation errors in `apps/backend/tests/Feature/Api/Auth/LoginTest.php`

**Checkpoint**: At this point, User Stories 1 AND 2 should work. Users can register and log in.

---

## Phase 5: User Story 3 - User Logout (Priority: P1)

**Goal**: Authenticated users can revoke their current token and end their session.

**Independent Test**: Authenticate, call `POST /api/logout` with the token, then verify the same token can no longer access protected endpoints (returns 401).

### Implementation for User Story 3

- [ ] T019 [US3] Implement `logout()` method in `apps/backend/app/Http/Controllers/Api/AuthController.php` — revoke current token via `$request->user()->currentAccessToken()->delete()`, return 200 with "Logged out successfully."
- [ ] T020 [US3] Add protected `POST /api/logout` route in `apps/backend/routes/api.php` inside the `auth:sanctum` middleware group pointing to `AuthController@logout`

### Tests for User Story 3

- [ ] T021 [US3] Create logout test file at `apps/backend/tests/Feature/Api/Auth/LogoutTest.php` — test successful logout revokes token and returns 200
- [ ] T022 [P] [US3] Test accessing a protected endpoint with a revoked token returns 401 in `apps/backend/tests/Feature/Api/Auth/LogoutTest.php`
- [ ] T023 [P] [US3] Test logout without token returns 401 in `apps/backend/tests/Feature/Api/Auth/LogoutTest.php`

**Checkpoint**: Core auth lifecycle complete — users can register, log in, and log out.

---

## Phase 6: User Story 4 - Token Management (Priority: P2)

**Goal**: Authenticated users can view their active tokens and revoke specific tokens individually.

**Independent Test**: Authenticate with multiple tokens, list them via `GET /api/tokens`, revoke one via `DELETE /api/tokens/{id}`, and verify the revoked token no longer works while others remain valid.

### Implementation for User Story 4

- [ ] T024 [US4] Implement `tokens()` method in `apps/backend/app/Http/Controllers/Api/AuthController.php` — return user's tokens (id, name, created_at, last_used_at) via `$request->user()->tokens()->orderBy('created_at', 'desc')->get()`
- [ ] T025 [US4] Add protected `GET /api/tokens` route in `apps/backend/routes/api.php` inside `auth:sanctum` group pointing to `AuthController@tokens`
- [ ] T026 [US4] Implement `revokeToken()` method in `apps/backend/app/Http/Controllers/Api/AuthController.php` — find token by id, verify it belongs to the user, delete it, return 200 or 403/404
- [ ] T027 [US4] Add protected `DELETE /api/tokens/{id}` route in `apps/backend/routes/api.php` inside `auth:sanctum` group pointing to `AuthController@revokeToken`

### Tests for User Story 4

- [ ] T028 [US4] Create token management test file at `apps/backend/tests/Feature/Api/Auth/TokenManagementTest.php` — test listing tokens returns all active tokens
- [ ] T029 [P] [US4] Test revoking a specific token removes it from the list and invalidates it in `apps/backend/tests/Feature/Api/Auth/TokenManagementTest.php`
- [ ] T030 [P] [US4] Test revoking another user's token returns 403 in `apps/backend/tests/Feature/Api/Auth/TokenManagementTest.php`
- [ ] T031 [P] [US4] Test revoking a non-existent token returns 404 in `apps/backend/tests/Feature/Api/Auth/TokenManagementTest.php`

**Checkpoint**: All user stories functional. Users have full auth lifecycle and token management.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation.

- [ ] T032 Run full test suite: `cd apps/backend && php artisan test` — verify all existing tests + new auth tests pass
- [ ] T033 [P] Run static analysis: `cd apps/backend && vendor/bin/phpstan analyse --level=6` — verify zero errors
- [ ] T034 [P] Run style check: `cd apps/backend && vendor/bin/pint --test` — verify zero violations
- [ ] T035 Update `AGENTS.md` to mark feature 003 as completed with summary description
- [ ] T036 Run quickstart validation scenarios from `specs/003-laravel-sanctum-auth/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — scaffold verification only
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (register), US2 (login), and US3 (logout) have NO dependencies on each other
  - US4 (tokens) depends on login/logout concepts but uses separate endpoints
  - Sequential execution recommended (P1 → P1 → P1 → P2)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 - Registration (P1)**: No dependencies on other stories
- **User Story 2 - Login (P1)**: Requires registered user (logically depends on US1 existing, but testable independently by seeding a user)
- **User Story 3 - Logout (P1)**: Requires authenticated user (testable independently by creating user+token in test setup)
- **User Story 4 - Token Management (P2)**: Requires authenticated user (testable independently)

### Within Each User Story

- Requests before controller methods
- Controller methods before routes
- Routes before tests
- Story complete before moving to next priority

### Parallel Opportunities

- T003 (AuthController skeleton) and T004 (refactor /api/user) and T002 (rate limiting) can run in parallel
- All test tasks marked [P] within a story can run in parallel with each other
- US1 (T005-T007) and US2 (T012-T014) implementation files are separate form requests — can run in parallel if staffed

---

## Parallel Example: User Story 1

```bash
# Launch all form request tasks together (no file conflicts):
Task: "Create RegisterRequest in app/Http/Requests/RegisterRequest.php"
Task: "Create LoginRequest in app/Http/Requests/LoginRequest.php"

# Launch all test files together (different test files):
Task: "Create RegisterTest.php"
Task: "Create LoginTest.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify scaffold)
2. Complete Phase 2: Foundational (rate limiting, controller skeleton)
3. Complete Phase 3: User Story 1 (register)
4. **STOP and VALIDATE**: Run `php artisan test` — MVP delivers user registration
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Register) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Login) → Test independently → Deploy/Demo
4. Add User Story 3 (Logout) → Test independently → Deploy/Demo
5. Add User Story 4 (Token Mgmt) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Existing test at `tests/Feature/AuthenticationTest.php` already verifies 401 response format — do not modify
- Commit after each phase or logical group
- The `/api/user` route currently exists as a closure — refactor it to use AuthController@user method
- Stop at any checkpoint to validate story independently
