# API Response Envelope

**Created**: 2026-06-27 | **Plan**: [plan.md](../plan.md)

All API responses MUST follow this consistent JSON envelope structure.

## Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

## Error Response

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE_STRING",
    "details": {}
  }
}
```

## Validation Error Response

```json
{
  "success": false,
  "error": {
    "message": "The given data was invalid.",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["The email field is required."],
      "password": ["The password must be at least 8 characters."]
    }
  }
}
```

## Authentication Error Response

```json
{
  "success": false,
  "error": {
    "message": "Unauthenticated.",
    "code": "UNAUTHENTICATED"
  }
}
```

## Not Found Response

```json
{
  "success": false,
  "error": {
    "message": "Resource not found.",
    "code": "NOT_FOUND"
  }
}
```

## HTTP Status Codes

| Status | Usage |
|--------|-------|
| 200 | Successful GET, PUT, PATCH requests |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error or bad request |
| 401 | Unauthenticated (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 422 | Unprocessable entity (validation failure) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
