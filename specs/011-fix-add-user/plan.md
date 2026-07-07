# Implementation Plan: Fix Add User Functionality

**Branch**: `011-fix-add-user` | **Date**: 2026-07-07 | **Spec**: spec.md

**Input**: Feature specification from `specs/011-fix-add-user/spec.md`

## Summary

Fix the "Add User" functionality that fails with the misleading error "Invalid username or password." Root cause: the frontend Axios interceptor hardcodes that message for all 401 responses, and the dev credentials bypass stores a fake token that Sanctum rejects. Fix involves removing the hardcoded error mapping and updating the dev auth flow to use the real login API.

## Technical Context

**Language/Version**: PHP 8.2+ (backend), TypeScript strict (frontend)

**Primary Dependencies**: Laravel 12.x (backend), React 19 + Vite (frontend), Laravel Sanctum (auth), axios 1.18.x (HTTP client)

**Storage**: MySQL 8.4 (primary), SQLite in-memory (tests)

**Testing**: Pest 4.x (backend), Vitest 4.1.x (frontend)

**Target Platform**: Web application (Laravel API + React SPA)

**Project Type**: Web application (monorepo with `apps/backend` + `apps/frontend`)

**Performance Goals**: No performance impact — change is error handling and auth flow only

**Constraints**: No database changes, no route changes, no model changes

**Scale/Scope**: 2 frontend files — `api.ts` (error interceptor) and `auth.ts` (dev credentials flow)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| PSR-12 / ESLint + Prettier | ✅ Existing conventions followed | No new files |
| PHPStan 6 / TypeScript strict | ✅ No new type errors | Minimal TypeScript changes |
| Test suite passes | ✅ All existing tests continue to pass | No logic changes that affect tests |
| 80% backend / 70% frontend coverage | ✅ No impact | Coverage unaffected |
| WCAG 2.1 AA | ✅ No UI structural changes | Error message text only |
| No dead code / debug artifacts | ✅ | |
| API JSON envelope consistency | ✅ | No API changes |
| Sanctum + bcrypt auth | ✅ | Auth mechanism unchanged |

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-add-user/
├── plan.md              # This file
├── research.md          # Phase 0 — root cause analysis
├── data-model.md        # Phase 1 — no data model changes
├── quickstart.md        # Phase 1 — validation guide
├── contracts/           # Phase 1 — API contract notes
│   └── README.md
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

Two frontend files are modified:

```text
apps/frontend/src/services/
├── api.ts               # Fix error interceptor — remove hardcoded 401 message
└── auth.ts              # Fix dev credentials — use real login API
```

**Structure Decision**: Frontend service layer only. No backend changes needed.

## Complexity Tracking

No constitution violations. Complexity is minimal (two-file edit).

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Trace user creation flow from frontend to backend
- [x] Research task: Identify root cause (Axios interceptor 401 hardcoding + fake dev token)
- [x] Research task: Verify backend is correct (routes, controller, auth middleware)

**Output**: `research.md`

### Phase 1: Design & Contracts (±0 points)

- [x] Confirm no data model changes needed → `data-model.md`
- [x] Document API contracts → `contracts/README.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

**Output**: `data-model.md`, `contracts/README.md`, `quickstart.md`, updated AGENTS.md

### Phase 2: Implementation (2 points)

**File 1**: `apps/frontend/src/services/api.ts`

**Change**: Remove the hardcoded 401 error message mapping (lines 40-42). Let the actual server error message pass through to the caller.

```typescript
// BEFORE:
if (status === 401) {
  return Promise.reject(new Error('Invalid username or password.'));
}

// AFTER:
// Remove this block entirely — let the generic error handler pass through the actual server message
```

**File 2**: `apps/frontend/src/services/auth.ts`

**Change**: Update the dev credentials `login()` flow to call the real API instead of storing a fake token. This ensures the token stored in localStorage is a valid Sanctum token that the backend will accept.

### Phase 3: Verification (±0 points)

1. Run `cd apps/frontend && npm test` — all tests pass
2. Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles
3. Run `cd apps/frontend && npm run lint` — no lint violations
4. Manual validation per quickstart.md scenarios

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/frontend/src/services/api.ts` | Remove hardcoded 401 error "Invalid username or password." | Edit |
| `apps/frontend/src/services/auth.ts` | Update dev credentials to call real login API | Edit |
| `AGENTS.md` | Update plan reference from 010 to 011 | Edit |
