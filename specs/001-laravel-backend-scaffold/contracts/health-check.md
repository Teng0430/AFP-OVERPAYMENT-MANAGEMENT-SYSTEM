# Health Check Endpoint

**Created**: 2026-06-27 | **Plan**: [plan.md](../plan.md)

## GET /api/health

Returns the application and database connectivity status.

### Request

No authentication required.

### Response

**Status**: 200 OK

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "app": "laravel",
    "version": "11.x",
    "database": "connected",
    "timestamp": "2026-06-27T14:00:00Z"
  }
}
```

### Failure Response (database unreachable)

**Status**: 200 OK (application still serves but reports database status)

```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "app": "laravel",
    "version": "11.x",
    "database": "disconnected",
    "timestamp": "2026-06-27T14:00:00Z"
  }
}
```
