# Implementation Plan: Enterprise Login Redesign

**Branch**: `` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-enterprise-login-redesign/spec.md`

## Summary

Redesign the AFP POMS login page from a basic form into a production-ready, enterprise-grade authentication interface with military command center aesthetics. The page features a two-column layout (glassmorphism login card + animated hero section with statistics overlays), security indicator badges, AFP branding, full responsive design, WCAG 2.1 AA accessibility, and error state handling. Authentication continues to use the existing Laravel Sanctum backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19.2.x

**Primary Dependencies**: react-router-dom 7.x, Framer Motion, shadcn/ui, Lucide React, Tailwind CSS v3, axios 1.18.x

**Storage**: N/A (login page is stateless; auth token stored in localStorage via existing `useAuth` hook)

**Testing**: Vitest 4.1.x + @testing-library/react

**Target Platform**: Modern browsers (Chrome, Firefox, Edge, Safari — last 2 major versions)

**Project Type**: Web application frontend (React SPA via Vite)

**Performance Goals**: Login page loads in <2s, form submission to dashboard redirect <3s (p95)

**Constraints**: Bundle size <500KB gzipped; WCAG 2.1 AA compliance; responsive at 3 breakpoints; prefers-reduced-motion fallbacks

**Scale/Scope**: Single page redesign (only `/login` route); no backend changes required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Passed Checks

| Gate | Status | Notes |
|---|---|---|
| PSR-12 / ESLint + Prettier | ✅ | Frontend-only feature; follows existing ESLint config |
| TypeScript strict mode | ✅ | All new code in strict mode |
| PHPStan level 6 | ✅ | No backend changes |
| Pest tests for backend | ✅ | No backend changes |
| Vitest tests for frontend | ✅ | Login page test exists; will be updated and expanded |
| Minimum coverage (backend 80%, frontend 70%) | ✅ | Existing login page test coverage will be maintained |
| WCAG 2.1 AA accessibility | ✅ | Required by spec: ARIA labels, keyboard nav, high contrast, screen reader support |
| Consistent JSON envelope | ✅ | No API changes needed |
| N+1 query prevention | ✅ | No new queries |
| Bundle size <500KB gzipped | ✅ | New components are lightweight (no heavy dependencies added) |
| Sanctum auth + bcrypt | ✅ | Reuses existing auth backend |
| Input validation | ✅ | RHF + Zod validation for form inputs |
| No .env/secret commits | ✅ | No env changes |

### Potential Complexity

| Item | Assessment |
|---|---|
| Framer Motion animations | Adds ~20KB to bundle; acceptable for enterprise UX |
| Glassmorphism + animated background | Pure CSS + canvas; no extra dependencies |
| Floating statistics cards | Animated via Framer Motion; minimal perf impact |
| AFP logo SVG | Need to create or source; no licensing issues |

## Project Structure

### Documentation (this feature)

```text
specs/006-enterprise-login-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/frontend/
├── src/
│   ├── components/
│   │   ├── login/               # NEW: Login page components
│   │   │   ├── LoginCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SecurityBadges.tsx
│   │   │   ├── LoginFooter.tsx
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── StatisticsOverlay.tsx
│   │   │   ├── LiveClock.tsx
│   │   │   └── EnterpriseAlert.tsx
│   │   └── ui/                  # Existing shadcn/ui components
│   ├── pages/
│   │   └── LoginPage.tsx        # MODIFIED: Complete redesign
│   └── hooks/
│       └── useAuth.tsx          # Existing (unchanged)
│
├── tests/
│   └── pages/
│       └── LoginPage.test.tsx   # MODIFIED: Updated tests
```

**Structure Decision**: Single frontend application within the existing monorepo. All new components go under `apps/frontend/src/components/login/`. No changes to backend, hooks, or services.

## Complexity Tracking

No constitution violations detected. Complexity is appropriate for the scope.

## Phase 0: Research

No NEEDS CLARIFICATION markers remain in the spec. Technical Context is fully resolved from existing project knowledge. Brief research tasks:

1. Confirm Framer Motion patterns used elsewhere in the project (existing dashboard charts)
2. Verify Tailwind CSS v3 supports glassmorphism utilities (backdrop-blur, bg-opacity)
3. Confirm the AFP logo representation strategy

## Phase 1: Design & Contracts

### Data Model

Login form state:
- `username: string`
- `password: string`
- `rememberMe: boolean`
- `showPassword: boolean`
- `capsLockActive: boolean`

Authentication state (existing `useAuth` hook):
- `user: User | null`
- `token: string | null`
- `loading: boolean`
- `login(username, password): Promise<void>`
- `logout(): void`

Hero statistics (mock/animated display values):
- `totalPensioners: number`
- `recoveredAccounts: number`
- `outstandingBalance: number`
- `monthlyCollections: number`
- `recoveryRate: number`

### Contracts

- `POST /api/login` — existing endpoint, unchanged
- `POST /api/logout` — existing endpoint, unchanged
- `GET /api/user` — existing endpoint, unchanged

### Quickstart

Covered in [quickstart.md](quickstart.md).
