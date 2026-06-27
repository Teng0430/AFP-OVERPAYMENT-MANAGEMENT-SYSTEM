# Data Model: Laravel Sanctum Authentication

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

This document defines the backend data model for authentication. The User model already exists from scaffold 001; this feature adds authentication-related attributes and the PersonalAccessToken model from Sanctum.

---

## Entity: User

**Table**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint, auto-increment | PK | Unique user identifier |
| `name` | varchar(255) | NOT NULL | User's display name |
| `email` | varchar(255) | NOT NULL, UNIQUE | User's email address (login credential) |
| `email_verified_at` | timestamp | NULLABLE | Email verification timestamp (not used in v1) |
| `password` | varchar(255) | NOT NULL | Bcrypt-hashed password |
| `remember_token` | varchar(100) | NULLABLE | Laravel remember token (not used by Sanctum API auth) |
| `created_at` | timestamp | NOT NULL | Account creation time |
| `updated_at` | timestamp | NOT NULL | Last update time |

**Relationships**:
- Has many `personal_access_tokens` (via Sanctum's `HasApiTokens` trait)

**Validation rules**:
- `name`: required, string, max:255 characters
- `email`: required, string, valid email format, unique in `users` table
- `password`: required, string, min:8 characters

**State transitions**:
```
[Not Registered] → Register → [Active]
[Active] → (no state changes in v1)
```

---

## Entity: PersonalAccessToken (Sanctum)

**Table**: `personal_access_tokens`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint, auto-increment | PK | Unique token identifier |
| `tokenable_type` | varchar(255) | NOT NULL | Morph type (always `App\Models\User`) |
| `tokenable_id` | bigint | NOT NULL, FK → users.id | The user who owns this token |
| `name` | varchar(255) | NOT NULL | Token name (e.g., "auth-token", "mobile") |
| `token` | varchar(64) | NOT NULL, UNIQUE | SHA-256 hash of the plain-text token |
| `abilities` | text | NULLABLE | JSON array of token abilities (null = all) |
| `last_used_at` | timestamp | NULLABLE | Timestamp of last token usage |
| `expires_at` | timestamp | NULLABLE | Token expiration (not used in v1 — null = no expiry) |
| `created_at` | timestamp | NOT NULL | Token creation time |
| `updated_at` | timestamp | NOT NULL | Last update time |

**Relationships**:
- Belongs to `User` (via morph `tokenable`)

**State transitions**:
```
[Created] → Revoked (DELETE) → [Deleted]
```

**Business rules**:
- Deleting a token effectively revokes it — Sanctum checks existence on each request
- Multiple active tokens per user are allowed (one per device/session)
- Plain-text token is returned only at creation time and cannot be retrieved later

---

## Auth Flow State Machine

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
            ┌──────────────┐  POST /api/register    ┌──────────────┐
            │              │  ──────────────────►   │              │
            │  Anonymous   │                        │  Authenticated│
            │              │  ◄───────────────────  │  (has token) │
            └──────────────┘   POST /api/logout      └──────────────┘
                    ▲                                      │
                    │                                      │
                    │         POST /api/login              │
                    └──────────────────────────────────────┘
```
