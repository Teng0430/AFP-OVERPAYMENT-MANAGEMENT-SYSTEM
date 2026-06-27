# Quickstart: Laravel Sanctum Authentication

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

Validation scenarios to prove the authentication feature works end-to-end.

---

## Prerequisites

- Backend dependencies installed: `cd apps/backend && composer install`
- Environment configured: `cd apps/backend && copy .env.example .env`
- Migrations run: `cd apps/backend && php artisan migrate`
- Server running: `cd apps/backend && php artisan serve`

---

## Validation Scenario 1: User Registration

**Goal**: Verify a new user can register and receive an authentication token.

**Steps**:
1. Send `POST /api/register` with valid name, email, and password
2. Verify response status is 201
3. Verify response includes `success: true`
4. Verify response includes `data.user` with id, name, email
5. Verify response includes `data.token` (a non-empty string)
6. Verify the returned token can access `/api/user` (protected endpoint)

**Expected**:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123","password_confirmation":"password123"}'
# → 201, { "success": true, "data": { "user": {...}, "token": "1|..." } }
```

---

## Validation Scenario 2: User Login

**Goal**: Verify a registered user can log in.

**Steps**:
1. Send `POST /api/login` with the registered email and password
2. Verify response status is 200
3. Verify response includes `success: true` and a new token
4. Verify invalid credentials return 401 with generic error message

**Expected**:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
# → 200, { "success": true, "data": { "user": {...}, "token": "1|..." } }
```

---

## Validation Scenario 3: User Logout

**Goal**: Verify an authenticated user can log out and the token is revoked.

**Steps**:
1. Log in to get a valid token
2. Send `POST /api/logout` with `Authorization: Bearer <token>`
3. Verify response status is 200
4. Try to access `/api/user` with the same token
5. Verify the request returns 401

---

## Validation Scenario 4: Token Management

**Goal**: Verify token listing and revocation.

**Steps**:
1. Log in to get a valid token
2. Log in again from a "different device" to get a second token
3. Send `GET /api/tokens` with the first token
4. Verify response includes both tokens
5. Send `DELETE /api/tokens/{second_token_id}` with the first token
6. Verify the second token is revoked (can no longer access `/api/user`)

---

## Validation Scenario 5: Validation & Rate Limiting

**Goal**: Verify validation rules and rate limiting work.

**Steps**:
1. Send `POST /api/register` with missing fields → 422
2. Send `POST /api/register` with duplicate email → 422
3. Send `POST /api/register` with password < 8 chars → 422
4. Send `POST /api/login` with wrong password → 401 (generic message)
5. Send rapid repeated login requests → 429 (rate limited)

---

## Quick Verification (Automated)

```bash
# Run backend tests
cd apps/backend && php artisan test

# Run static analysis
cd apps/backend && vendor/bin/phpstan analyse --level=6

# Run style check
cd apps/backend && vendor/bin/pint --test
```

**Expected**: All tests pass, PHPStan level 6 passes with zero errors, Pint passes with zero violations.
