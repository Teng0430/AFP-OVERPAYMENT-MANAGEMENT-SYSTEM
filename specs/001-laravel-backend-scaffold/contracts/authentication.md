# API Authentication

**Created**: 2026-06-27 | **Plan**: [plan.md](../plan.md)

## Authentication Method

API requests are authenticated using Laravel Sanctum token-based authentication. Clients include a Bearer token in the `Authorization` header.

## Request Header

```
Authorization: Bearer <plain-text-token>
Accept: application/json
Content-Type: application/json
```

## Token Management Endpoints

*Note: These endpoints are scaffold configuration only. Token issuance endpoints will be implemented in a subsequent feature.*

### Token Format

Sanctum issues tokens with a plain-text prefix (`<token-id>|<plain-text-token>`). The plain-text token is shown once at creation. The database stores a SHA-256 hash of the token.

### Token Abilities (Scopes)

Tokens can be scoped to specific abilities. The scaffold configures Sanctum to support ability-based authorization:

```json
// Example token with abilities
{
  "abilities": ["read", "write"]
}
```

Route middleware can check abilities:

```php
// Check if token has specific ability
$user->tokenCan('read');
```

### Protected Routes

All routes defined in `routes/api.php` are protected by the `auth:sanctum` middleware by default. Individual routes can be marked as public by excluding them from the middleware group.

## SPA Authentication (Future)

Sanctum also supports cookie-based SPA authentication using `EnsureFrontendRequestsAreStateful` middleware. This is pre-configured in the scaffold for future frontend integration.
