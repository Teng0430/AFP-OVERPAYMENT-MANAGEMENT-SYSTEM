# Research: Fix Add User Functionality

## Root Cause Analysis

### Decision: Axios error interceptor hardcodes "Invalid username or password" for all 401 responses

**Decision**: The primary bug is in `apps/frontend/src/services/api.ts` lines 40-42, which converts EVERY 401 response to `"Invalid username or password."` regardless of what the backend actually returned.

**Rationale**:
- The backend `bootstrap/app.php` correctly returns `{"success":false,"error":{"message":"Unauthenticated.","code":"UNAUTHENTICATED"}}` with HTTP 401 when Sanctum middleware rejects an invalid/missing token.
- The frontend interceptor discards this actual error message and replaces it with a hardcoded login-specific message.
- When a user creation request is made with an invalid token (e.g., from the dev credentials bypass in `auth.ts`), the 401 response gets the generic login error text.

**Alternatives considered**: The interceptor could redirect to login page on 401 without changing the error message, but the simplest fix is to let the actual backend error pass through.

### Decision: Dev credentials bypass stores non-functional token

**Decision**: `apps/frontend/src/services/auth.ts` stores `'dev-token-afp-admin'` in localStorage without ever calling the real login API. This token is then sent with all API requests and rejected by Sanctum middleware.

**Rationale**: This bypass allows development without a running backend, but when the backend IS running, the fake token causes every protected API call to fail with 401.

**Fix**: Update the dev auth flow to call the real login API when the backend is available, or skip token attachment for dev credentials.

### Decision: User routes are correctly protected by Sanctum

**Decision**: The `auth:sanctum` middleware on user routes is correct behavior. Protected routes should require authentication. The bug is that the frontend sends a fake token, not that the middleware is misconfigured.

**Rationale**: No changes needed to backend route protection.

### Decision: UserResource returns limited fields

**Decision**: `UserResource` only returns `id`, `name`, `email`. While this may cause display issues on the user list page, it does NOT affect the user creation bug. This is a secondary display issue, not a creation failure cause.

**Rationale**: Out of scope for the immediate fix per the task restrictions.

## Impacted Files

| File | Issue | Fix |
|------|-------|-----|
| `apps/frontend/src/services/api.ts:40-42` | Hardcodes "Invalid username or password" for all 401s | Remove hardcoded message; pass through actual server error |
| `apps/frontend/src/services/auth.ts:7-35` | Dev credentials store fake token, causing 401 | Use real login API when backend is running |
