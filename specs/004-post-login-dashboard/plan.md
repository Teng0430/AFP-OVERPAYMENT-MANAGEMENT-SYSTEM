# Implementation Plan: Post-Login Dashboard

**Branch**: `004-post-login-dashboard` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-post-login-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a post-login dashboard page with a persistent navigation bar showing the user's profile image and name, plus a logout action. This is a frontend-only feature that depends on the existing auth API (backend feature 003) and the existing React + Vite scaffold (feature 002).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / React 19.2.x

**Primary Dependencies**: react-router-dom 7.x (routing), axios 1.18.x (HTTP client)

**Storage**: N/A — no persistent local data store for this feature; auth token managed in localStorage by existing api.ts service

**Testing**: Vitest 4.1.x with coverage reporting (min 70%)

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — last 2 major versions)

**Project Type**: Web application frontend (single-page application)

**Performance Goals**: Initial production bundle <500KB gzipped; dashboard page load <2s; nav bar render <1s

**Constraints**: All code under `apps/frontend/`; TypeScript strict mode enabled; bundle size must stay under 500KB gzipped; lint/type-check must pass before build; WCAG 2.1 AA compliance; existing auth token managed in localStorage

**Scale/Scope**: Single dashboard page with persistent nav bar; serves as authenticated app shell for future features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Gates** (from `.specify/memory/constitution.md`):

| Gate | Criteria | Status |
|------|----------|--------|
| **I - Code Quality** | ESLint + Prettier configured; TypeScript strict mode | ✅ (from scaffold 002) |
| **II - Testing** | Vitest for frontend testing; min 70% coverage | ✅ (from scaffold 002) |
| **III - UX Consistency** | Consistent design system; error/loading/empty states; responsive mobile-first; WCAG 2.1 AA | ⚠️ Requires auth state management for protected routes |
| **IV - Performance** | Bundle size <500KB gzipped | ✅ (dashboard + nav bar are small additions) |
| **V - Security** | Input validation; no secrets in code; Sanctum token handling via existing api.ts | ✅ (existing token management reused) |

**Note on UX Consistency (Gate III)**: The nav bar and dashboard must handle loading, error, and unauthenticated states. Responsive design is expected via existing scaffold patterns. WCAG 2.1 AA compliance for nav bar (keyboard navigation, focus management, ARIA labels) must be verified during implementation.

**Complexity Justification**: Single frontend feature within existing `apps/frontend/` — standard structure, no complexity violation.

## Project Structure

### Documentation (this feature)

```text
specs/004-post-login-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/frontend/
├── src/
│   ├── components/
│   │   ├── App.tsx                    # Updated with auth-aware routing
│   │   ├── NavBar.tsx                 # [NEW] Navigation bar with profile + logout
│   │   └── ProtectedRoute.tsx         # [NEW] Route guard for authenticated pages
│   ├── pages/
│   │   ├── DashboardPage.tsx          # [NEW] Post-login dashboard
│   │   ├── HomePage.tsx               # Updated (or replaced by DashboardPage)
│   │   ├── LoginPage.tsx              # [NEW] Login form
│   │   ├── RegisterPage.tsx           # [NEW] Registration form
│   │   └── NotFoundPage.tsx           # Existing
│   ├── services/
│   │   ├── api.ts                     # Existing (used as-is)
│   │   └── auth.ts                    # [NEW] Auth service (login, register, logout, getUser)
│   ├── hooks/
│   │   └── useAuth.ts                 # [NEW] Auth state hook
│   ├── types/
│   │   └── user.ts                    # [NEW] User type definitions
│   ├── assets/
│   │   └── default-avatar.svg         # [NEW] Placeholder avatar
│   ├── main.tsx                       # Existing
│   └── vite-env.d.ts                  # Existing
└── tests/
    ├── setup.ts                       # Existing
    ├── components/
    │   ├── NavBar.test.tsx            # [NEW]
    │   └── ProtectedRoute.test.tsx    # [NEW]
    ├── pages/
    │   ├── DashboardPage.test.tsx     # [NEW]
    │   ├── LoginPage.test.tsx         # [NEW]
    │   └── RegisterPage.test.tsx      # [NEW]
    └── hooks/
        └── useAuth.test.ts            # [NEW]
```

**Structure Decision**: Follows the existing `apps/frontend/` scaffold conventions. New components go in `src/components/`, new pages in `src/pages/`, new services in `src/services/`, new hooks in `src/hooks/`, and new types in `src/types/`. Tests are co-located in `tests/` mirroring the source structure per existing Vitest conventions.

## Complexity Tracking

No complexity violations identified. Single frontend feature within the existing `apps/frontend/` project.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
