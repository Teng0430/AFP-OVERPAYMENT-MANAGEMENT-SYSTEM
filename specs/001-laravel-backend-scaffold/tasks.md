# Tasks: Laravel Backend Scaffold

**Input**: Design documents from `specs/001-laravel-backend-scaffold/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Contract tests included per constitution requirement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `apps/backend/` at repository root
- Adjust paths based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold Laravel 11 project in `apps/backend/` and install all required dependencies.

- [ ] T001 Create Laravel 11 project in `apps/backend/` via `composer create-project laravel/laravel`
- [ ] T002 [P] Install required Composer packages: laravel/sanctum, pestphp/pest, pestphp/pest-plugin-laravel, laravel/pint, phpstan/phpstan, phpstan/phpstan-laravel
- [ ] T003 Configure `.env` with basic app settings and generate APP_KEY via `php artisan key:generate`
- [ ] T004 Write smoke test confirming application boots in `tests/Feature/SmokeTest.php`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Configure MySQL database connection in `config/database.php` – set default to `mysql`, charset `utf8mb4`, collation `utf8mb4_unicode_ci`
- [ ] T006 Complete `.env.example` with all required variables: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DRIVER`, `CORS_PATHS`, `CORS_ALLOWED_ORIGINS`
- [ ] T007 Run default Laravel migrations (`php artisan migrate`) – tables: users, password_reset_tokens, personal_access_tokens, sessions, cache, cache_locks, failed_jobs
- [ ] T008 [P] Install and configure Laravel Sanctum – publish config, set `api` guard, configure token abilities
- [ ] T009 [P] Set up base API route structure in `apps/backend/routes/api.php` – load routes with `api` middleware group
- [ ] T010 Write database connection test in `tests/Feature/DatabaseTest.php` – confirm MySQL connection and expected tables exist (connectivity validation only — uses real MySQL; all other tests use in-memory SQLite per constitution)
- [ ] T011 Configure Pest coverage to 80% minimum in `phpunit.xml` with `<coverage><min>80%</min></coverage>`

**Checkpoint**: Foundation ready – user story implementation can now begin.

---

## Phase 3: User Story 1 - Initialize Backend Project (Priority: P1) 🎯 MVP

**Goal**: The Laravel backend project is initialized with standard directory structure and the development server responds to requests.

**Independent Test**: Start `php artisan serve` and verify the default response is served at `http://127.0.0.1:8000`; verify project directory contains expected subdirectories: `app/Http/Controllers/`, `database/migrations/`, `routes/`, `tests/`.

### Tests for User Story 1

- [ ] T012 [P] [US1] Write Pest test verifying project structure exists with expected directories
- [ ] T013 [P] [US1] Write Pest test verifying default Laravel welcome page returns HTTP 200

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create default API controller scaffold at `apps/backend/app/Http/Controllers/Controller.php`
- [ ] T015 [US1] Verify `routes/web.php` returns default welcome view on GET `/`
- [ ] T016 [US1] Verify `php artisan serve` boots without errors

**Checkpoint**: Backend project is initialized and serves default content

---

## Phase 4: User Story 2 - Configure Database Connection (Priority: P1)

**Goal**: MySQL database is connected and default migrations execute successfully, creating the core schema for users, sessions, and API tokens.

**Independent Test**: Run `php artisan migrate:fresh` and verify all expected tables exist in MySQL (`users`, `personal_access_tokens`, `sessions`, `cache`, `failed_jobs`); then run `php artisan migrate:status` and confirm all migrations are marked as "Ran".

### Tests for User Story 2

- [ ] T017 [P] [US2] Write Pest test verifying database connection returns expected tables list
- [ ] T018 [P] [US2] Write Pest test verifying `users` migration creates expected columns per data model
- [ ] T019 [P] [US2] Write Pest test verifying `personal_access_tokens` migration creates expected columns

### Implementation for User Story 2

- [ ] T020 [US2] Configure MySQL connection settings in `apps/backend/config/database.php`
- [ ] T021 [US2] Execute and verify default Laravel migrations in `apps/backend/database/migrations/`
- [ ] T022 [US2] Verify `users` table schema matches data model in `specs/001-laravel-backend-scaffold/data-model.md`
- [ ] T023 [US2] Verify `personal_access_tokens` table schema matches data model

**Checkpoint**: MySQL database is connected and core schema exists

---

## Phase 5: User Story 3 - Set Up API Structure (Priority: P2)

**Goal**: API routing is configured with Sanctum token authentication, a health-check endpoint returns structured JSON, CORS is configured for frontend communication, and all responses follow the consistent envelope format.

**Independent Test**: Send `GET /api/health` and receive `{"success":true,"data":{"status":"healthy","database":"connected"}}`; send `GET /api/user` without token and receive `401 Unauthenticated` JSON error.

### Tests for User Story 3

- [ ] T024 [P] [US3] Write contract test for health-check endpoint at `tests/Feature/HealthCheckTest.php`
- [ ] T025 [P] [US3] Write contract test for unauthenticated access returning 401 JSON
- [ ] T026 [US3] Write integration test for response envelope format consistency

### Implementation for User Story 3

- [ ] T027 [US3] Create health-check controller at `apps/backend/app/Http/Controllers/Api/HealthCheckController.php`
- [ ] T028 [US3] Define health-check route in `apps/backend/routes/api.php` at `GET /api/health`
- [ ] T029 [US3] Register API response envelope macro in `apps/backend/app/Providers/AppServiceProvider.php`
- [ ] T030 [P] [US3] Configure CORS in `apps/backend/config/cors.php` for frontend origin
- [ ] T031 [US3] Add `auth:sanctum` middleware to API route group in `apps/backend/routes/api.php`
- [ ] T032 [US3] Verify health-check endpoint returns database connectivity status

**Checkpoint**: API foundation works - authenticated endpoints protected, health endpoint operational

---

## Phase 6: User Story 4 - Configure Environment & Tooling (Priority: P3)

**Goal**: Environment template is complete, code quality tools pass on scaffolded code, and static analysis confirms zero errors.

**Independent Test**: Run `./vendor/bin/pint --test` (zero violations); run `vendor/bin/phpstan analyse --level=6` (zero errors); verify `.env.example` contains all keys: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY`, `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`.

### Tests for User Story 4

- [ ] T033 [P] [US4] Write test verifying `.env.example` contains all required keys
- [ ] T034 [US4] Write test verifying `php artisan config:cache` runs without errors

### Implementation for User Story 4

- [ ] T035 [US4] Run `./vendor/bin/pint` to auto-fix PSR-12 style on all scaffolded files
- [ ] T036 [US4] Run `vendor/bin/phpstan analyse --level=6` and fix any errors in scaffolded code
- [ ] T037 [US4] Add `apps/backend/.env` to `.gitignore` and verify `.env.example` is tracked

**Checkpoint**: Tooling is configured and passes on all scaffolded code

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full validation of the complete scaffold

- [ ] T038 Run `php artisan test` and confirm full test suite passes (zero failures)
- [ ] T039 [P] Run `vendor/bin/phpstan analyse --level=6` and confirm zero errors
- [ ] T040 [P] Run `./vendor/bin/pint --test` and confirm zero style violations
- [ ] T041 Run `php artisan migrate:fresh` from scratch and verify all tables created
- [ ] T042 Run `php artisan route:list` and verify expected routes are registered
- [ ] T043 Execute [quickstart.md](quickstart.md) validation scenarios end-to-end
- [ ] T044 Verify `apps/backend/.env.example` has no secrets committed
- [ ] T045 Update `AGENTS.md` to reference the completed feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel after Foundational
  - US3 depends on US2 (database must be ready for health check)
  - US4 can run in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 3 (P2)**: Depends on US2 (database health check) - independently testable via mock
- **User Story 4 (P3)**: Can start after Foundational - no dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Core implementation before validation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- US1 and US2 can run in parallel after Foundational
- US4 can run in parallel with US3
- All tests for a user story marked [P] can run in parallel
- Models/tables within a story marked [P] can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all tests for User Story 3 together:
Task: "Write contract test for health-check endpoint at tests/Feature/HealthCheckTest.php"
Task: "Write contract test for unauthenticated access returning 401 JSON"

# Launch all implementation tasks for User Story 3 together:
Task: "Define health-check route in apps/backend/routes/api.php"
Task: "Configure CORS in apps/backend/config/cors.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Initialize backend project)
4. Complete Phase 4: User Story 2 (Configure database)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready (scaffold foundation exists)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Backend project with database → Deploy/Demo (MVP!)
3. Add User Story 3 → API structure with auth and health check → Deploy/Demo
4. Add User Story 4 → Tooling and environment config → Deploy/Demo
5. Each phase adds value independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (project init + structure)
   - Developer B: User Story 2 (database + migrations)
3. After US1 + US2:
   - Developer A: User Story 3 (API structure)
   - Developer B: User Story 4 (tooling)
4. All stories integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
