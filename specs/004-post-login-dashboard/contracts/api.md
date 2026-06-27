# API Contracts: Post-Login Dashboard

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

These contracts define the API surface that the frontend expects from the backend authentication feature (003). They serve as the agreement between frontend and backend implementation.

**Base URL**: `/api`

**Envelope**: All responses follow the `{ success: bool, data: ..., error: ... }` format as configured in the backend scaffold.

**Authentication**: Token-based via `Authorization: Bearer <token>` header.

---

## Endpoint: POST /api/register

Create a new user account.

### Request

```json
{
  "name": "string (required)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 8 characters)"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profile_image_url": null
    },
    "token": "1|abc123..."
  },
  "error": null
}
```

### Error Responses

| Status | Condition | Error Message |
|--------|-----------|---------------|
| 422 | Validation failure | "The email has already been taken." / "The password must be at least 8 characters." |
| 422 | Invalid email | "The email must be a valid email address." |
| 429 | Rate limited | "Too many attempts." |

---

## Endpoint: POST /api/login

Authenticate an existing user.

### Request

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profile_image_url": null
    },
    "token": "1|abc123..."
  },
  "error": null
}
```

### Error Responses

| Status | Condition | Error Message |
|--------|-----------|---------------|
| 401 | Invalid credentials | "Invalid credentials." |
| 422 | Missing fields | "The email field is required." |
| 429 | Rate limited | "Too many attempts." |

**Security note**: Error message is identical for invalid email and incorrect password to prevent user enumeration.

---

## Endpoint: POST /api/logout

Revoke the current authentication token. Requires `Authorization: Bearer` header.

### Request

```
Authorization: Bearer <token>
Body: (none)
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  },
  "error": null
}
```

### Error Responses

| Status | Condition | Error Message |
|--------|-----------|---------------|
| 401 | No token / invalid token | "Unauthenticated." |

---

## Endpoint: GET /api/user

Fetch the authenticated user's profile. Requires `Authorization: Bearer` header.

### Request

```
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profile_image_url": null
    }
  },
  "error": null
}
```

### Error Responses

| Status | Condition | Error Message |
|--------|-----------|---------------|
| 401 | No token / invalid token | "Unauthenticated." |

---

## Endpoint: GET /api/tokens

List all active tokens for the authenticated user. Requires `Authorization: Bearer` header.

### Request

```
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": 1,
        "name": "web",
        "created_at": "2026-06-27T12:00:00Z",
        "last_used_at": "2026-06-27T12:30:00Z"
      }
    ]
  },
  "error": null
}
```

---

## Endpoint: DELETE /api/tokens/{id}

Revoke a specific token by ID. Requires `Authorization: Bearer` header.

### Request

```
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Token revoked."
  },
  "error": null
}
```

---

## Frontend <-> Backend Binding

| Frontend Action | API Call | Storage |
|-----------------|----------|---------|
| App mount | `GET /api/user` (if token exists) | Token read from localStorage |
| Login | `POST /api/login` | Token written to localStorage |
| Register | `POST /api/register` | Token written to localStorage |
| Logout | `POST /api/logout` | Token removed from localStorage |
| Token management | `GET /api/tokens`, `DELETE /api/tokens/{id}` | Token read from localStorage |
| Any API call | (token injected by axios interceptor) | Token read from localStorage |
