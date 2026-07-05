# API Contracts: Enterprise Login Redesign

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-05

## Overview

The login page uses existing backend API endpoints unchanged. No new API contracts are introduced.

## Endpoints

### POST /api/login

Public endpoint. Existing contract — no changes.

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "string (Sanctum bearer token)",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role_id": "number"
    }
  }
}
```

**Response (401)**:
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

### POST /api/logout

Authenticated endpoint. Existing contract — no changes.

### GET /api/user

Authenticated endpoint. Existing contract — no changes.

## Implementation Notes

- The login form uses `email` field for the username input (matches existing backend expectation)
- The existing `AuthService.login()` in `apps/frontend/src/services/auth.ts` handles the API call — no changes needed
- Error responses from the backend use the JSON envelope `{ success: false, error: { message, code } }` which maps directly to the frontend error display
