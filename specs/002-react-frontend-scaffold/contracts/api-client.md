# API Client Contract

**Date**: 2026-06-27

## Base Configuration

- **Base URL**: Configurable via `VITE_API_BASE_URL` env var (default: `http://localhost:8000/api`)
- **Default headers**: `Content-Type: application/json`
- **Response envelope**: All responses follow `{ success: bool, data: ..., error: ... }` per constitution

## Request Interceptor

Injects `Authorization: Bearer <token>` header when a token is available in local storage keyspace.

## Response Interceptor

Unwraps the JSON envelope:
- If `success === true`: return `response.data` to the caller
- If `success === false`: throw or reject with `response.error`

HTTP errors (4xx/5xx) are caught and surfaced as structured errors.

## Endpoint Methods

```
GET    /{resource}         → list resources
GET    /{resource}/{id}    → get single resource
POST   /{resource}         → create resource
PUT    /{resource}/{id}    → update resource
DELETE /{resource}/{id}    → delete resource
```

All methods return `Promise<T>` where `T` is the expected response shape (typed per feature).
