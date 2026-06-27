# Data Model: Laravel Backend Scaffold

**Created**: 2026-06-27 | **Plan**: [plan.md](plan.md)

## Overview

This document describes the database entities created by the default Laravel 11 migrations included in the scaffold. These entities provide the foundational data layer for user management, API authentication, and session handling.

## Entities

### User

The core entity representing registered users of the system. Created by the `create_users_table` migration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint (unsigned) | PK, auto-increment | Unique user identifier |
| name | varchar(255) | NOT NULL | User's display name |
| email | varchar(255) | NOT NULL, UNIQUE | User's email address (used for login) |
| email_verified_at | timestamp | NULLABLE | When the email was verified |
| password | varchar(255) | NOT NULL | Bcrypt-hashed password |
| remember_token | varchar(100) | NULLABLE | Token for "remember me" sessions |
| created_at | timestamp | NULLABLE | Record creation timestamp |
| updated_at | timestamp | NULLABLE | Record last update timestamp |

**Indexes**: `email` (unique)

**Relationships**:
- Has many `PersonalAccessToken` (API tokens)
- Has many `Session` (browser sessions)

---

### PersonalAccessToken

API tokens issued via Laravel Sanctum for authenticating API requests. Created by the `create_personal_access_tokens_table` migration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint (unsigned) | PK, auto-increment | Unique token identifier |
| tokenable_type | varchar(255) | NOT NULL | Model class (e.g., `App\Models\User`) |
| tokenable_id | bigint (unsigned) | NOT NULL | Foreign key to the owning model |
| name | varchar(255) | NOT NULL | Human-readable token name |
| token | varchar(64) | NOT NULL, UNIQUE | SHA-256 hash of the plain-text token |
| abilities | text | NULLABLE | JSON array of token scopes/abilities |
| last_used_at | timestamp | NULLABLE | Last usage timestamp |
| expires_at | timestamp | NULLABLE | Token expiration timestamp |
| created_at | timestamp | NULLABLE | Record creation timestamp |
| updated_at | timestamp | NULLABLE | Record last update timestamp |

**Indexes**: `tokenable_type + tokenable_id` (composite), `token` (unique)

**Relationships**:
- Belongs to `User` (via polymorphic `tokenable`)

---

### Session

Server-side session records for stateful interactions (SPA authentication, web routes). Created by the `create_sessions_table` migration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | varchar(255) | PK | Unique session identifier |
| user_id | bigint (unsigned) | NULLABLE, INDEX | Foreign key to the owning user |
| ip_address | varchar(45) | NULLABLE | Client IP address |
| user_agent | text | NULLABLE | Client user agent string |
| payload | text | NOT NULL | Serialized session data |
| last_activity | int | NOT NULL, INDEX | Unix timestamp of last activity |
| created_at | timestamp | NULLABLE | Record creation timestamp |
| updated_at | timestamp | NULLABLE | Record last update timestamp |

**Indexes**: `user_id`, `last_activity`

**Relationships**:
- Belongs to `User`

---

## Entity Relationship Diagram

```text
  ┌─────────┐       ┌──────────────────────┐
  │  User   │       │ PersonalAccessToken  │
  ├─────────┤       ├──────────────────────┤
  │ id      │──┐    │ id                   │
  │ name    │  │    │ tokenable_type       │
  │ email   │  │    │ tokenable_id         │──┐
  │ password│  │    │ token (hash)         │  │
  └─────────┘  │    │ abilities            │  │
               │    │ expires_at           │  │
               │    └──────────────────────┘  │
               │                              │
               │    ┌──────────────────────┐  │
               │    │      Session         │  │
               │    ├──────────────────────┤  │
               └────│ user_id              │  │
                    │ id                   │  │
                    │ last_activity        │  │
                    └──────────────────────┘  │
                                              │
         (User has many PersonalAccessTokens) │
         (User has many Sessions) ─────────────┘
```

## Validation Rules

These validation rules apply to user input for the User entity (when registration is implemented in a subsequent feature):

| Field | Rules |
|-------|-------|
| name | required, string, max:255 |
| email | required, string, email, max:255, unique:users |
| password | required, string, min:8, confirmed |

## State Transitions

### User Account States

```text
[Registered] ──email verified──> [Active]
     │                               │
     └──account deleted────────────> [Deleted]
```

- **Registered**: Initial state after sign-up. Cannot access features requiring email verification.
- **Active**: Email verified. Full access.
- **Deleted**: Soft-deleted or hard-deleted. Cannot authenticate.

*Note: Email verification and registration flows are out of scope for the scaffold feature and will be implemented separately.*
