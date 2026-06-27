# Research: Laravel Backend Scaffold

**Created**: 2026-06-27 | **Plan**: [plan.md](plan.md)

## Technology Decisions

### Backend Framework

- **Decision**: Laravel 11.x
- **Rationale**: Laravel provides built-in support for MySQL via Eloquent ORM, has a mature ecosystem for API development (Sanctum, built-in rate limiting, resource controllers), ships with Pest testing support, and enforces PSR-4 autoloading. Version 11 is the latest LTS-equivalent release.
- **Alternatives considered**: Symfony (more flexible but requires more boilerplate for API projects), Slim (lighter but lacking built-in auth/testing infrastructure)

### Database

- **Decision**: MySQL 8.4 LTS (production), in-memory SQLite (testing)
- **Rationale**: MySQL is the explicitly requested database. Using in-memory SQLite for tests (per constitution) ensures tests run fast and are isolated without external database dependencies.
- **Alternatives considered**: PostgreSQL (equally capable but not requested), MariaDB (MySQL-compatible but version differences could cause issues)

### Authentication

- **Decision**: Laravel Sanctum with token-based API auth
- **Rationale**: Sanctum is bundled with Laravel 11, provides simple token-based API authentication, supports SPA cookie-based auth for future frontend integration, and tokens can be scoped to minimum permissions.
- **Alternatives considered**: Laravel Passport (full OAuth2 — overkill for first-party API), JWT packages (manual token management, no SPA support built-in)

### Testing

- **Decision**: Pest 4.x with in-memory SQLite
- **Rationale**: Pest is the project-standard testing framework, provides a cleaner syntax than PHPUnit, and Laravel 11 ships with Pest support. In-memory SQLite matches constitution requirements.
- **Alternatives considered**: PHPUnit (Pest wraps it — Pest is preferred per constitution)

### Code Quality

- **Decision**: PHPStan level 6, Laravel Pint (PSR-12)
- **Rationale**: PHPStan level 6 catches type mismatches and logic errors without being overly strict. Pint enforces PSR-12 formatting with zero-config setup.
- **Alternatives considered**: PHP CS Fixer (equivalent but separate config), Psalm (equivalent to PHPStan)

### Project Structure

- **Decision**: Laravel project at `apps/backend/` with standard Laravel directory layout
- **Rationale**: Constitution requires all feature code under `apps/`. Laravel's standard directory structure is well-understood and maps cleanly to `apps/backend/`.
- **Alternatives considered**: Project at root (violates constitution), project at `src/` (not standard Laravel convention)

## Configuration Decisions

### Database Connection

- **Default connection**: `mysql` (via `DB_CONNECTION=mysql` in `.env`)
- **Test connection**: `sqlite` with `:memory:` database
- **Required `.env` keys**: `DB_HOST`, `DB_PORT` (3306), `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

### API Response Envelope

- **Format**: `{ success: bool, data: ..., error: ... }`
- **Implementation**: Global response macro in a service provider
- **Error structure**: `{ success: false, error: { message: string, code: string, details?: array } }`

### Sanctum Configuration

- **Token expiration**: No expiration by default (per Sanctum defaults); individual tokens can be revoked
- **Token abilities**: Configurable per-token scope for fine-grained access control
- **Middleware**: `auth:sanctum` applied to API routes

## Dependencies

| Package | Purpose | Version Constraint |
|---------|---------|-------------------|
| `laravel/laravel` | Framework skeleton | 11.x |
| `laravel/sanctum` | API token auth | Bundled |
| `pestphp/pest` | Testing framework | 4.x |
| `pestphp/pest-plugin-laravel` | Laravel integration for Pest | 4.x |
| `laravel/pint` | PSR-12 code style | 1.x |
| `phpstan/phpstan` | Static analysis | 2.x |
| `phpstan/phpstan-laravel` | Laravel integration for PHPStan | 2.x |
