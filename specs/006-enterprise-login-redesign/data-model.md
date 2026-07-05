# Data Model: Enterprise Login Redesign

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-05

## Login Form State

| Field | Type | Default | Constraints | Source |
|---|---|---|---|---|
| `username` | string | `''` | Required, min 1 char | User input |
| `password` | string | `''` | Required, min 1 char | User input |
| `rememberMe` | boolean | `false` | — | User toggle |
| `showPassword` | boolean | `false` | — | User toggle |
| `capsLockActive` | boolean | `false` | Detected via `KeyboardEvent.getModifierState('CapsLock')` | System detection |
| `isLoading` | boolean | `false` | Set true during API call | Auth flow |
| `error` | `string \| null` | `null` | Error message string | API response or network error |

## Authentication State (Existing — `useAuth` hook)

| Field | Type | Description |
|---|---|---|
| `user` | `User \| null` | Authenticated user object |
| `token` | `string \| null` | Sanctum bearer token |
| `loading` | boolean | True during initial auth check |
| `login(username, password)` | async function | POST to `/api/login`, store token |
| `logout()` | function | POST to `/api/logout`, clear token |

## Hero Statistics (Display/Mock Values)

| Field | Type | Display Format | Description |
|---|---|---|---|
| `totalPensioners` | number | Locale-formatted integer | Total monitored pensioners |
| `recoveredAccounts` | number | Locale-formatted integer | Fully recovered accounts |
| `outstandingBalance` | number | PHP currency format (###,###,###.##) | Total outstanding overpayment |
| `monthlyCollections` | number | PHP currency format (###,###,###.##) | Current month collections |
| `recoveryRate` | number | Percentage (XX.X%) | Recovery rate percentage |

## State Transitions

```
[Idle] ──user types──> [Filling Form]
                         │
                    submit click / Enter
                         │
                         v
                   [Loading / Authenticating]
                         │
                    ┌────┴────┐
                    │         │
                    v         v
              [Success]   [Error]
                    │         │
              redirect to    show alert
              /dashboard     return to [Filling Form]
                              (username preserved)
```

## Validation Rules (Zod Schema)

```typescript
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
```

## Error Types

| Error Type | Trigger | Message | User Action |
|---|---|---|---|
| Invalid credentials | 401 response | "Invalid username or password" | Retry with correct credentials |
| Network error | Network failure | "Unable to connect. Please check your internet connection and try again." | Check connection, retry |
| Server unavailable | 5xx response | "Service temporarily unavailable. Please try again in a few minutes." | Wait and retry |
| Account locked | 423/403 specific response | "Account locked. Please contact your system administrator." | Contact support |
| Session expired | 401 on existing session | "Your session has expired. Please log in again." | Re-enter credentials |
