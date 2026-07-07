# API Contracts: Fix Add User Functionality

## User Creation Endpoint

| Method | Endpoint | Auth | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/api/users` | Bearer token (Sanctum) | JSON body | 201 + user resource |

## Request Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret12345",
  "role_id": 1,
  "department": "Finance"
}
```

## Response - Success (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1,
    "role": { "id": 1, "name": "Administrator", "slug": "admin" },
    "department": "Finance",
    "is_active": true,
    "two_factor_enabled": false,
    "created_at": "2026-07-07T12:00:00.000000Z",
    "updated_at": "2026-07-07T12:00:00.000000Z"
  }
}
```

## Response - Unauthenticated (401)

```json
{
  "success": false,
  "error": {
    "message": "Unauthenticated.",
    "code": "UNAUTHENTICATED"
  }
}
```

## Response - Validation Error (422)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed.",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["The email has already been taken."],
      "role_id": ["The selected role_id is invalid."]
    }
  }
}
```

## Change from Current Behavior

The frontend Axios interceptor currently replaces ALL 401 error messages with the hardcoded "Invalid username or password." string. After the fix, the actual server response message will be displayed instead.
