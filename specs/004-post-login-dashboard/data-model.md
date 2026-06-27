# Data Model: Post-Login Dashboard

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

This document defines the frontend data model for the post-login dashboard feature. Entities represent frontend state and types, not database models — the backend data model is defined in feature 003 (Laravel Sanctum Authentication).

---

## Entity: UserProfile

Represents the authenticated user's profile information as returned by the API.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | yes | Unique user identifier |
| `name` | string | yes | User's display name |
| `email` | string | yes | User's email address |
| `profile_image_url` | string | no | URL to user's avatar image; null/undefined if not set |

**State transitions**: Immutable during a session — only updated on login/register or page refresh.

**Validation**: `name` is non-empty string; `email` is valid email format; `profile_image_url` is valid URL or null.

---

## Entity: AuthState

Represents the authentication state of the current user session in the frontend.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | UserProfile \| null | yes | The authenticated user, or null if not authenticated |
| `isAuthenticated` | boolean | yes | Derived from `user !== null` |
| `isLoading` | boolean | yes | True while verifying existing token on app mount |
| `error` | string \| null | no | Error message from last auth operation |

**State transitions**:

```
[Initial] → isLoading=true
  ├─ Token found in localStorage → GET /api/user → user=UserProfile, isLoading=false
  ├─ Token not found → user=null, isLoading=false
  └─ Token invalid/expired → clear token, user=null, isLoading=false

[Unauthenticated] → Login successful → user=UserProfile, token in localStorage
[Authenticated] → Logout → clear token + user, redirect to /login
[Authenticated] → Token revoked on server → clear token + user, redirect to /login
```

**Validation rules**:
- Only one auth session can exist at a time
- Token presence in localStorage does not guarantee authentication — must be validated against the API
- On any 401 response from the API, auth state should reset to unauthenticated

---

## Behavior State Machine

### Page Access Control

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
            ┌──────────────┐         login         ┌──────────────┐
            │              │  ──────────────────►   │              │
            │  Login Page  │                       │  Dashboard   │
            │              │  ◄──────────────────   │  (Nav Bar)   │
            └──────────────┘       logout           └──────────────┘
                    ▲                                      │
                    │                                      │
                    │         unauthenticated              │
                    │         access attempt               │
                    └──────────────────────────────────────┘
```

### Nav Bar User Dropdown

```
                    ┌──────────────────────┐
                    │   Profile Image +     │  ← click
                    │   Name (trigger)      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  ┌──────────────┐    │
                    │  │ User Name     │    │  ← non-interactive
                    │  │ ──────────── │    │
                    │  │ Logout       │    │  ← click → logout flow
                    │  └──────────────┘    │
                    └──────────────────────┘
                               │
                    click outside / Escape
                               │
                               ▼
                         (closed)
```
