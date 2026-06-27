# Implementation Plan: React Frontend Scaffold

**Branch**: `002-react-frontend-scaffold` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-react-frontend-scaffold/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Scaffold a React + Vite frontend project under `apps/frontend/` with development server (hot-reload), production build pipeline, Vitest testing infrastructure (unit + coverage), ESLint/Prettier code quality tooling, TypeScript strict mode, React Router for navigation, axios for HTTP communication, and environment configuration. This mirrors the existing backend scaffold in structure and quality standards.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / React 19.2.x

**Primary Dependencies**: Vite (build tool), Vitest 4.1.x (testing), axios 1.18.x (HTTP), react-router-dom 7.18.x (routing)

**Storage**: N/A — frontend-only scaffold with no persistent local data store

**Testing**: Vitest 4.1.x with coverage reporting

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — last 2 major versions)

**Project Type**: Web application frontend

**Performance Goals**: Initial production bundle <500KB gzipped; development server cold start <5s

**Constraints**: All code under `apps/frontend/`; TypeScript strict mode enabled; bundle size must stay under 500KB gzipped; lint/type-check must pass before build

**Scale/Scope**: Single-page application with client-side routing; initial scaffold serves as foundation for all future frontend feature work

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Gates** (from `.specify/memory/constitution.md`):

| Gate | Criteria | Status |
|------|----------|--------|
| **I - Code Quality** | ESLint + Prettier configured; TypeScript strict mode | ✅ |
| **II - Testing** | Vitest for frontend testing; min 70% coverage | ✅ |
| **III - UX Consistency** | Consistent design system; error/loading/empty states; responsive mobile-first; WCAG 2.1 AA | ⚠️ See note |
| **IV - Performance** | Bundle size <500KB gzipped | ✅ |
| **V - Security** | Input validation; no secrets in code | ✅ |

**Note on UX Consistency (Gate III)**: Full design system components and WCAG 2.1 AA compliance cannot be validated against the scaffold alone — these will be enforced during individual feature implementation and code review. The scaffold will establish the foundation (responsive setup, component structure) but the actual design tokens, shared component library, and accessibility audit are deferred to feature work.

**Complexity Justification**: Single frontend project under `apps/frontend/` — standard structure, no complexity violation.

## Project Structure

### Documentation (this feature)

```text
specs/002-react-frontend-scaffold/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── App.tsx
    │   ├── pages/
    │   ├── services/
    │   │   └── api.ts
    │   ├── hooks/
    │   ├── types/
    │   ├── assets/
    │   ├── main.tsx
    │   ├── App.tsx
    │   └── vite-env.d.ts
    ├── tests/
    │   ├── setup.ts
    │   └── App.test.tsx
    ├── public/
    │   └── favicon.svg
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── eslint.config.js
    ├── .prettierrc
    ├── .env.example
    ├── .gitignore
    └── README.md

docs/
└── [documentation files]
```

**Structure Decision**: Single frontend application under `apps/frontend/`, mirroring the existing `apps/backend/` convention. Standard Vite + React scaffold layout with `src/` for source, `tests/` for test files (co-located with source per Vitest conventions), and root-level configuration files.

## Complexity Tracking

No complexity violations identified. Single project, standard tooling, straightforward scaffold.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
