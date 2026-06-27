# Quickstart: Laravel Backend Scaffold

**Created**: 2026-06-27 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

## Prerequisites

- PHP 8.2+ with extensions: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenxml`, `xml`
- Composer 2.8.x
- MySQL 8.x server running and accessible
- Node.js 22.x LTS (for frontend build tooling, if used)

## Setup Commands

```bash
# 1. Navigate to the backend directory
cd apps/backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment template and edit database settings
cp .env.example .env
# Edit .env: set DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 4. Generate application encryption key
php artisan key:generate

# 5. Create the database in MySQL (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ids_backend"

# 6. Run database migrations
php artisan migrate

# 7. Start the development server
php artisan serve
```

## Validation Scenarios

### Scenario 1: Server Starts Successfully

```bash
php artisan serve
# Expected: "Laravel development server started: http://127.0.0.1:8000"
```

### Scenario 2: Health Check Endpoint

```bash
curl http://127.0.0.1:8000/api/health
# Expected: {"success":true,"data":{"status":"healthy","app":"laravel","version":"11.x","database":"connected","timestamp":"..."}}
```

### Scenario 3: Database Migrations

```bash
php artisan migrate:status
# Expected: All migrations listed as "Ran" (Y)
# Verify tables exist:
mysql -u root -p -e "USE ids_backend; SHOW TABLES;"
# Expected: users, personal_access_tokens, sessions, cache, cache_locks, failed_jobs, job_batches, jobs
```

### Scenario 4: Protected Route Returns 401

```bash
curl -X GET http://127.0.0.1:8000/api/user -H "Accept: application/json"
# Expected: {"success":false,"error":{"message":"Unauthenticated.","code":"UNAUTHENTICATED"}}
```

### Scenario 5: Test Suite Passes

```bash
php artisan test
# Expected: All tests pass (PASS)
```

### Scenario 6: Code Quality

```bash
# PHPStan
vendor/bin/phpstan analyse --level=6

# Laravel Pint (PSR-12)
./vendor/bin/pint --test
```

## Expected Outcomes

| Scenario | Expected Result |
|----------|----------------|
| Server starts | Listening on 127.0.0.1:8000 |
| Health check | `"status": "healthy"`, `"database": "connected"` |
| Migrations run | All tables created in MySQL |
| Protected route | 401 Unauthenticated JSON response |
| Test suite | All tests passing (zero failures) |
| PHPStan | Level 6 passes with zero errors |
| Laravel Pint | No style violations |

## Contract References

- [API Response Envelope](contracts/api-envelope.md)
- [Health Check Endpoint](contracts/health-check.md)
- [Authentication](contracts/authentication.md)
- [Data Model](data-model.md)
