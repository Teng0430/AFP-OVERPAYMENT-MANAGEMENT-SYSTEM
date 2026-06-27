# Research: Laravel Sanctum Authentication

**Phase**: 0 — Outline & Research
**Date**: 2026-06-27

## Overview

This document consolidates research findings for the Laravel Sanctum Authentication feature. No NEEDS CLARIFICATION markers were present in the spec or plan, so this document confirms existing decisions and documents best practices.

---

## 1. Authentication Flow

**Decision**: Token-based API authentication using Laravel Sanctum

**Rationale**:
- Sanctum is already installed and configured in the backend scaffold (001)
- User model already uses `HasApiTokens` trait
- API routing already has `auth:sanctum` middleware on protected routes
- Token-based auth is the standard approach for SPA + API architectures without session cookies

**Flow**:
- **Register**: `POST /api/register` → validates input → creates User → issues Sanctum token → returns `{user, token}`
- **Login**: `POST /api/login` → validates credentials → issues Sanctum token → returns `{user, token}`
- **Logout**: `POST /api/logout` → revokes current token → returns success
- **Token List**: `GET /api/tokens` → returns all user tokens
- **Token Revoke**: `DELETE /api/tokens/{id}` → deletes specific token

---

## 2. Sanctum Token Configuration

**Decision**: Plain tokens (no abilities/scopes) for v1; token name defaults to "auth-token"

**Rationale**:
- The current app has no role-based or scope-based access control
- Abilities can be added later when authorization is needed
- Sanctum's `createToken()` returns a plain-text token on creation only

**Best practices**:
- Store token name from the client perspective (e.g., "web", "mobile")
- Return the plain-text token only once (on creation)
- Never store or log plain-text tokens

---

## 3. Validation Strategy

**Decision**: Laravel Form Request classes for registration and login validation

**Rationale**:
- Form Requests encapsulate validation rules, authorization logic, and error messages
- Keep controllers clean by moving validation out
- Pest tests can validate error responses directly

**Validation rules**:
- **Register**: name (required, string, max:255), email (required, string, email, unique:users), password (required, string, min:8, confirmed)
- **Login**: email (required, string, email), password (required, string)

---

## 4. Rate Limiting

**Decision**: Laravel's built-in rate limiter on auth endpoints

**Rationale**:
- Laravel provides `RateLimiter` facade and middleware out of the box
- Default throttle middleware (60 attempts per minute per IP) is sufficient for v1
- Pre-configured in Laravel's `Http/Kernel.php`

**Best practices**:
- Apply rate limiting to both login and register endpoints
- Return standard 429 status with "Too Many Attempts" message
- Consider more granular limits per-email for login in future versions

---

## 5. Error Response Format

**Decision**: Consistent JSON envelope already configured in scaffold 001

The existing `AppServiceProvider` macros provide:
```json
// Success
{ "success": true, "data": { ... }, "error": null }

// Error (validation)
{ "success": false, "data": null, "error": { "message": "...", "code": "VALIDATION_ERROR", "details": { ... } } }

// Error (auth)
{ "success": false, "data": null, "error": { "message": "...", "code": "AUTHENTICATION_ERROR" } }
```

**Existing tests** verify this format (`AuthenticationTest.php` lines 33-39).

---

## 6. Existing Backend Structure

The scaffold at `apps/backend/` already has:
- Sanctum installed with `HasApiTokens` on User model
- `routes/api.php` with `/api/health` (public) and `/api/user` (protected via `auth:sanctum`)
- `AppServiceProvider` with `response()->success()` and `response()->error()` macros
- CORS configured via env vars
- User model with `name`, `email`, `password` (fillable and hidden)
- Pest test suite (25 tests) with in-memory SQLite
- PHPStan level 6 (zero errors)
- PSR-12 compliance

**This feature adds**: AuthController, RegisterRequest, LoginRequest, updated routes, and ~20 new tests.

---

## 7. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token name | "auth-token" for default, passed from client | Frontend controls naming for multi-device scenarios |
| Password min length | 8 characters | Industry standard minimum |
| Login error message | "Invalid credentials." (generic) | Prevents user enumeration |
| Token list response | id, name, created_at, last_used_at | User-friendly display without exposing token value |
| Token revocation | Delete from database (not expiry) | Sanctuum revokes by deleting the token record |
| Test database | SQLite in-memory | Consistent with scaffold configuration |
