# Implementation Plan: Laravel Sanctum Authentication

**Branch**: `003-laravel-sanctum-auth` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-laravel-sanctum-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build backend authentication API endpoints (register, login, logout, token management) using Laravel Sanctum. The Sanctum package is already installed with `HasApiTokens` on the User model, but no auth endpoints exist yet. This feature creates the full auth API surface needed by the frontend.

## Technical Context

**Language/Version**: PHP 8.2+ / Laravel 12.x

**Primary Dependencies**: Laravel Sanctum (bundled with Laravel 12), Laravel's built-in validation and rate-limiting middleware

**Storage**: MySQL 8.x primary database (`ids_backend`); in-memory SQLite for tests — User model already exists with migration

**Testing**: Pest 3.x with in-memory SQLite (PHPUnit under the hood, configured per scaffold)

**Target Platform**: Linux/Nginx web server (local dev via `php artisan serve`)

**Project Type**: RESTful API backend (web service)

**Performance Goals**: Registration <5s, login <3s, 100 failed attempts/min per IP without performance degradation

**Constraints**: All code under `apps/backend/`; PSR-12 coding standard; PHPStan level 6; min 80% test coverage; consistent JSON envelope responses; bcrypt password hashing; rate-limited auth endpoints

**Scale/Scope**: Single backend application serving auth endpoints for web and mobile clients; supports thousands of users with standard MySQL capacity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Gates** (from `.specify/memory/constitution.md`):

| Gate | Criteria | Status |
|------|----------|--------|
| **I - Code Quality** | PSR-12; PHPStan level 6; no debug artifacts | ✅ (from scaffold 001) |
| **II - Testing** | Pest with in-memory SQLite; min 80% coverage | ✅ (from scaffold 001) |
| **III - UX Consistency** | Consistent JSON envelope `{success, data, error}` | ✅ (macros configured in scaffold 001) |
| **IV - Performance** | API response <200ms p95; N+1 prevention | ⚠️ Token listing needs eager loading of user relation |
| **V - Security** | Sanctum + bcrypt; input validation; rate limiting; no secrets in code | ✅ (Sanctum + bcrypt already in place) |

**Note on Performance (Gate IV)**: Token listing (`GET /api/tokens`) must use eager loading to avoid N+1 when fetching user tokens. Standard CRUD operations have no N+1 risk.

**Complexity Justification**: Single backend feature within existing `apps/backend/` — standard controller/service structure, no complexity violation.

## Project Structure

### Documentation (this feature)

```text
specs/003-laravel-sanctum-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── HealthCheckController.php   # Existing
│   │   │       └── AuthController.php          # [NEW] register, login, logout, tokens
│   │   └── Requests/
│   │       ├── RegisterRequest.php             # [NEW] Registration validation
│   │       └── LoginRequest.php                # [NEW] Login validation
│   ├── Models/
│   │   └── User.php                           # Existing (HasApiTokens already applied)
│   └── Providers/
│       └── AppServiceProvider.php              # Existing (response macros already configured)
├── routes/
│   └── api.php                                # Updated with auth routes
├── tests/
│   ├── Feature/
│   │   ├── Api/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterTest.php           # [NEW]
│   │   │   │   ├── LoginTest.php              # [NEW]
│   │   │   │   ├── LogoutTest.php             # [NEW]
│   │   │   │   └── TokenManagementTest.php    # [NEW]
│   │   │   └── HealthCheckTest.php             # Existing
│   │   └── Http/
│   │       └── Controllers/
│   │           └── Api/
│   │               └── HealthCheckControllerTest.php  # Existing
│   ├── Unit/
│   │   └── ...
│   ├── Pest.php                               # Existing
│   └── TestCase.php                           # Existing
└── config/
    ├── sanctum.php                            # Existing (Sanctum config)
    └── cors.php                               # Existing (CORS config)
```

**Structure Decision**: Follows the existing `apps/backend/` scaffold conventions. New controller goes in `app/Http/Controllers/Api/`. New form requests go in `app/Http/Requests/`. Tests follow existing Pest feature test patterns in `tests/Feature/Api/Auth/`.

## Complexity Tracking

No complexity violations identified. Single backend feature within the existing `apps/backend/` project.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
