<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-laravel-backend-scaffold/plan.md
<!-- SPECKIT END -->

## Completed Features

### 001 - Laravel Backend Scaffold (2026-06-27)

Laravel 12 backend scaffold at `apps/backend/` with:
- PHP 8.2, Composer 2.x, Laravel 12.x framework
- MySQL 8.x primary database (`ids_backend`); in-memory SQLite for tests
- Laravel Sanctum token authentication (`HasApiTokens` on `User` model)
- API routing in `routes/api.php` with `auth:sanctum` middleware on protected routes
- Health-check endpoint: `GET /api/health` (public, JSON envelope)
- Consistent JSON response envelope (`success`, `data`, `error`) via `AppServiceProvider` macros
- CORS configuration in `config/cors.php` via `CORS_PATHS` / `CORS_ALLOWED_ORIGINS` env vars
- Pest 3.x test suite (25 tests, 98 assertions, all passing)
- PHPStan level 6 (zero errors, via larastan/larastan)
- Laravel Pint PSR-12 style (zero violations)
- Complete `.env.example` with all required keys

**Run tests**: `cd apps/backend && php artisan test`
**Run server**: `cd apps/backend && php artisan serve`
**Migrations**: `cd apps/backend && php artisan migrate`
