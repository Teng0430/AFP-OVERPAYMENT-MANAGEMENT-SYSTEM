# API Contracts: Laravel Sanctum Authentication

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

These contracts define the API surface that the backend exposes for authentication. They serve as the contract between the backend implementation and frontend consumers.

**Base URL**: `/api`

**Envelope**: All responses follow the `{ success: bool, data: ..., error: ... }` format.

**Authentication**: Token-based via `Authorization: Bearer <token>` header (for protected endpoints).

---

## Endpoint: POST /api/register

Create a new user account and return an authentication token.

### Request

```json
{
  "name": "string (required, max:255)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min:8)",
  "password_confirmation": "string (required, must match password)"
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
      "email": "jane@example.com"
    },
    "token": "1|abc123..."
  },
  "error": null
}
```

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 422 | VALIDATION_ERROR | Invalid input (missing fields, duplicate email, weak password) |
| 429 | RATE_LIMITED | Too many registration attempts |

---

## Endpoint: POST /api/login

Authenticate an existing user and return a new token.

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
      "email": "jane@example.com"
    },
    "token": "1|abc123..."
  },
  "error": null
}
```

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 401 | AUTHENTICATION_ERROR | Invalid credentials (generic, no user enumeration) |
| 422 | VALIDATION_ERROR | Missing email or password |
| 429 | RATE_LIMITED | Too many login attempts |

---

## Endpoint: POST /api/logout

Revoke the current authentication token.

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

| Status | Error Code | Description |
|--------|-----------|-------------|
| 401 | UNAUTHENTICATED | No valid token provided |

---

## Endpoint: GET /api/user

Fetch the authenticated user's profile (already exists from scaffold 001).

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
      "email": "jane@example.com"
    }
  },
  "error": null
}
```

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 401 | UNAUTHENTICATED | No valid token provided |

---

## Endpoint: GET /api/tokens

List all active tokens for the authenticated user.

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
        "name": "auth-token",
        "created_at": "2026-06-27T12:00:00.000000Z",
        "last_used_at": "2026-06-27T12:30:00.000000Z"
      }
    ]
  },
  "error": null
}
```

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 401 | UNAUTHENTICATED | No valid token provided |

---

## Endpoint: DELETE /api/tokens/{id}

Revoke a specific token by its ID.

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

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 401 | UNAUTHENTICATED | No valid token provided |
| 403 | FORBIDDEN | Attempting to revoke a token that belongs to another user |
| 404 | NOT_FOUND | Token ID does not exist |

---

## Route Summary

| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| POST | `/api/register` | No | Create account |
| POST | `/api/login` | No | Authenticate |
| POST | `/api/logout` | Yes | Revoke current token |
| GET | `/api/user` | Yes | Get profile (existing) |
| GET | `/api/tokens` | Yes | List active tokens |
| DELETE | `/api/tokens/{id}` | Yes | Revoke specific token |
