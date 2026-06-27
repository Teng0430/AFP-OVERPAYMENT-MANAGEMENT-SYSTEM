# Implementation Plan: Laravel Backend Scaffold

**Branch**: `001-laravel-backend-scaffold` | **Date**: 2026-06-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-laravel-backend-scaffold/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Initialize a Laravel 11 backend project with MySQL database connection, API routing structure, token-based authentication, testing infrastructure, and development tooling — all housed under `apps/backend/` per the project constitution.

## Technical Context

**Language/Version**: PHP 8.3

**Primary Dependencies**: Laravel 11.x, Composer 2.8.x, npm 11.x (for frontend asset build tooling)

**Storage**: MySQL 8.4 LTS (primary), in-memory SQLite (test environment per constitution)

**Testing**: Pest 4.x with in-memory SQLite

**Target Platform**: Linux server (local dev on Windows via Laravel Valet/Sail or built-in server)

**Project Type**: Web service (JSON API backend)

**Performance Goals**: API response time <200ms at p95 for standard endpoints; health-check <1s

**Constraints**: PSR-12 coding standards, PHPStan level 6, consistent JSON envelope (`{ success: bool, data: ..., error: ... }`), N+1 query prohibition, Sanctum token auth, all code under `apps/`

**Scale/Scope**: Initial scaffold — single application serving as backend for the IDS system. Authentication and user-facing features deferred to subsequent features.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status | Notes |
|------|-------------|--------|-------|
| G-001 | PSR-12 coding standards | CONFIGURED | Laravel 11 ships PSR-4 compliant; PHP_CodeSniffer or Laravel Pint added for PSR-12 enforcement |
| G-002 | PHPStan level 6 | CONFIGURED | `phpstan/phpstan` required as dev dependency with level=6 in config |
| G-003 | Pest testing with in-memory SQLite | CONFIGURED | Laravel 11 ships with Pest; `DB_CONNECTION=sqlite` and `DB_DATABASE=:memory:` in phpunit.xml for testing |
| G-004 | Consistent JSON envelope | CONFIGURED | API response macro/service registered in `AppServiceProvider` or `App\Http\Response` |
| G-005 | Laravel Sanctum token auth | CONFIGURED | Sanctum installed and configured; `EnsureFrontendRequestsAreStateful` middleware active for SPA auth |
| G-006 | Database indexes on WHERE/JOIN/ORDER BY | NOTED | Built-in migrations include indexes on `users.email` and `personal_access_tokens.tokenable_id`; future features must maintain this |
| G-007 | Code under `apps/` directory | COMPLIANT | Laravel project root is `apps/backend/`; all PHP code lives within that subtree |
| G-008 | .env.example as reference | CONFIGURED | Default `.env.example` from Laravel extended with all required configuration keys |
| G-009 | Input validation & sanitization | CONFIGURED | Laravel validation services available; `ValidateRequests` middleware active by default |
| G-010 | N+1 query prevention (eager loading) | NOTED | Documented as required practice for future feature implementations |

No violations found. All gates either pass or are pre-configured by the framework.

## Project Structure

### Documentation (this feature)

```text
specs/001-laravel-backend-scaffold/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/backend/                     # Laravel 11 application root
├── app/
│   ├── Http/
│   │   ├── Controllers/          # API controllers
│   │   └── Middleware/            # Custom middleware
│   ├── Models/                    # Eloquent models
│   └── Providers/                 # Service providers
├── bootstrap/
├── config/                       # Configuration files
├── database/
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
├── public/                       # Web server entry point
├── resources/
├── routes/
│   └── api.php                   # API route definitions
├── storage/
├── tests/                        # Pest test suite
│   ├── Feature/
│   └── Unit/
├── .env.example                  # Environment template
├── composer.json
├── phpunit.xml
└── pint.json                     # Laravel Pint (PSR-12) config

docs/                             # Project documentation
```

**Structure Decision**: Laravel project placed at `apps/backend/` per constitution requirement that all feature code resides under `apps/`. The standard Laravel 11 directory structure is preserved within. Documentation remains at `docs/`.

## Complexity Tracking

No constitution violations identified. Complexity tracking not required.
