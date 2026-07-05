<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/006-enterprise-login-redesign/plan.md
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

### 002 - React Frontend Scaffold (2026-06-27)

React + Vite frontend scaffold at `apps/frontend/` with:
- React 19.2.x with TypeScript strict mode
- Vite build tool (dev server, HMR, optimized production builds)
- Vitest 4.1.x testing with coverage reporting
- ESLint flat config + Prettier for code quality
- react-router-dom 7.x for client-side routing
- axios 1.18.x HTTP client with centralized API service
- Environment variable configuration via `.env.example`
- Bundle size budget <500KB gzipped

**Run dev server**: `cd apps/frontend && npm run dev`
**Run tests**: `cd apps/frontend && npm test`
**Build**: `cd apps/frontend && npm run build`
**Lint**: `cd apps/frontend && npm run lint`

### 003 - Laravel Sanctum Authentication (2026-06-27)

Backend authentication API at `apps/backend/` with:
- User registration endpoint (`POST /api/register`) with form request validation
- User login endpoint (`POST /api/login`) with bcrypt password verification
- User logout endpoint (`POST /api/logout`) with Sanctum token revocation
- Token management endpoints (`GET /api/tokens`, `DELETE /api/tokens/{id}`)
- Rate limiting on auth endpoints (60 attempts/minute/IP)
- Consistent JSON error envelope for validation errors
- Pest test suite (14 new tests in `tests/Feature/Api/Auth/`)
- PHPStan level 6 compliance (zero errors)
- PSR-12 style compliance via Pint (zero violations)

**Run tests**: `cd apps/backend && php artisan test`
**Run auth endpoint tests**: `cd apps/backend && php artisan test --filter="Auth"`

### 004 - Post-Login Dashboard (2026-06-27)

Frontend post-login dashboard at `apps/frontend/` with:
- Dashboard page as authenticated landing page after login
- Persistent navigation bar with user profile image and name
- Logout functionality from navigation bar dropdown
- Protected route handling (redirect unauthenticated users to login)
- Auth state management via React Context + useAuth hook
- Auth service module for login, register, logout, getUser API calls
- Placeholder avatar for users without profile images
- WCAG 2.1 AA accessible nav bar with keyboard navigation and ARIA labels

**Run frontend tests**: `cd apps/frontend && npm test`
**Type check**: `cd apps/frontend && npx tsc --noEmit`
**Lint**: `cd apps/frontend && npm run lint`
