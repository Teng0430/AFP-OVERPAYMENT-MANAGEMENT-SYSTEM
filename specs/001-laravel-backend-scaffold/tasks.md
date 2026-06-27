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
- [ ] T009 [P] Set up base API route structure in `routes/api.php` – load routes with `api` middleware group
- [ ] T010 Write database connection test in `tests/Feature/DatabaseTest.php` – confirm MySQL connection and expected tables exist

**Checkpoint**: Foundation ready – user story implementation can now begin.

---

## Phase 3: User Story 3 - Set Up API Structure (Priority: P2)

**Goal**: Expose a health-check endpoint, consistent JSON response envelope, and CORS configuration so frontend clients can communicate with the backend.

**Independent Test**: Hit `GET /api/health` and receive `{"success":true,"data":{"status":"healthy"}}` with HTTP 200.

### Tests for User Story 3 (per constitution: contract tests required) ⚠️

- [ ] T011 [P] [US3] Write contract test for health-check response format in `tests/Feature/HealthTest.php`

### Implementation for User Story 3

- [ ] T012 [P] [US3] Create JSON response envelope macro in `app/Providers/AppServiceProvider.php` – register `success()` and `error()` response macros with `{ success: bool, data: ..., error: ... }` format
- [ ] T013 [US3] Create health-check endpoint in `routes/api.php` and `app/Http/Controllers/Api/HealthController.php` – return app status and DB connection status
- [ ] T014 [US3] Configure CORS in `config/cors.php` – set allowed origins, methods, headers

**Checkpoint**: API structure is functional and independently testable via health-check endpoint.

---

## Phase 4: User Story 4 - Configure Environment & Tooling (Priority: P3)

**Goal**: Set up code quality tools (PHPStan, Laravel Pint) and finalize environment template so the project meets constitutional standards.

**Independent Test**: Run `vendor/bin/phpstan analyse --level=6` and `vendor/bin/pint --test` – both pass with zero errors for scaffolded code.

### Implementation for User Story 4

- [ ] T015 [P] [US4] Configure PHPStan at level 6 in `phpstan.neon` – add `phpstan/phpstan-laravel` extension, scan `apps/backend/app` and `apps/backend/tests`
- [ ] T016 [P] [US4] Configure Laravel Pint in `pint.json` – set PSR-12 preset, target `apps/backend/app` and `apps/backend/tests`
- [ ] T017 [US4] Finalize `.env.example` – ensure all config keys documented with placeholder values, no real secrets
- [ ] T018 [US4] Write tooling validation test in `tests/Feature/ToolingTest.php` – verify PHPStan and Pint run without errors

**Checkpoint**: All code quality gates pass. Tooling enforces constitutional standards.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories.

- [ ] T019 Run full Pest test suite (`php artisan test`) and fix any failures
- [ ] T020 [P] Run PHPStan level 6 and fix reported issues
- [ ] T021 [P] Run Laravel Pint and fix style violations
- [ ] T022 Validate all quickstart.md scenarios manually – server start, health check, migrations, protected route, test suite
- [ ] T023 [P] Remove debug artifacts, commented code, and unused imports across `apps/backend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories
- **User Story 3 (Phase 3)**: Depends on Foundational completion – independent of US4
- **User Story 4 (Phase 4)**: Depends on Foundational completion – independent of US3
- **Polish (Phase 5)**: Depends on Phase 1–4 completion

### User Story Dependencies

- **User Story 3 (P2)**: Can start after Foundational – no dependency on US4
- **User Story 4 (P3)**: Can start after Foundational – no dependency on US3

### Within Each User Story

- Tests MUST be written before implementation (TDD)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- US3 and US4 can be implemented in parallel (different concerns)
- All tests within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 3

```bash
# Launch contract test + implementation simultaneously:
Task: "Write contract test for health-check in tests/Feature/HealthTest.php"
Task: "Create JSON response envelope macro in app/Providers/AppServiceProvider.php"
Task: "Create health-check endpoint in routes/api.php and HealthController.php"
Task: "Configure CORS in config/cors.php"
```

---

## Implementation Strategy

### MVP First (User Story 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL – blocks all stories)
3. Complete Phase 3: User Story 3 (health check, envelope, CORS)
4. **STOP and VALIDATE**: Test API health endpoint independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 3 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 4 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 3 (API structure)
   - Developer B: User Story 4 (Tooling)
3. Stories complete and integrate independently
