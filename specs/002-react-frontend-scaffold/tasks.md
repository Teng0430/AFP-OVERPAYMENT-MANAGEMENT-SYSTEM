# Tasks: React Frontend Scaffold

**Input**: Design documents from `/specs/002-react-frontend-scaffold/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec — skip test-specific task generation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/` under `apps/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — scaffold the Vite + React + TypeScript project under `apps/frontend/`

- [X] T001 Create `apps/frontend/` directory and scaffold project using Vite React+TypeScript template
- [X] T002 [P] Install core dependencies (react-router-dom 7.x, axios 1.18.x) in `apps/frontend/package.json`
- [X] T003 [P] Configure `apps/frontend/.gitignore` for Vite/Node project (node_modules, dist, .env, coverage)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript strict mode, build configuration, app shell, and environment setup — MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Configure TypeScript strict mode in `apps/frontend/tsconfig.json`, `apps/frontend/tsconfig.app.json` (with `"strict": true`, `"noUncheckedIndexedAccess": true`), and `apps/frontend/tsconfig.node.json`
- [X] T005 [P] Create `apps/frontend/index.html` with `<html lang="en">`, `<meta charset>`, `<meta viewport>`, `<title>IDS</title>`, and `<div id="root">`
- [X] T006 [P] Create entry point `apps/frontend/src/main.tsx` that mounts `<App />` to `#root`
- [X] T007 [P] Create `apps/frontend/src/App.tsx` with `<BrowserRouter>` and `<Routes>` structure
- [X] T008 [P] Create `apps/frontend/.env.example` with `VITE_API_BASE_URL=http://localhost:8000/api` and `VITE_APP_NAME=IDS`
- [X] T009 [P] Create `apps/frontend/src/vite-env.d.ts` with Vite client type references

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Initializes Frontend Project (Priority: P1) 🎯 MVP

**Goal**: Developer can install dependencies, start a dev server with hot-reload, and produce a production build

**Independent Test**: Run `npm install` then `npm run dev` — dev server starts on `localhost`, browser displays the app. Run `npm run build` — optimized files appear in `apps/frontend/dist/`.

### Implementation for User Story 1

- [X] T010 [P] [US1] Configure Vite in `apps/frontend/vite.config.ts` with React plugin, path alias (`@/` → `src/`), dev server proxy for `/api` to `VITE_API_BASE_URL`, and configurable port
- [X] T011 [P] [US1] Create `apps/frontend/src/pages/HomePage.tsx` as a simple landing page component with semantic HTML (`<main>`, `<h1>`, responsive layout)
- [X] T012 [P] [US1] Create `apps/frontend/src/pages/NotFoundPage.tsx` as a 404 catch-all component with semantic HTML and link back to home
- [X] T013 [P] [US1] Create `apps/frontend/public/vite.svg` placeholder favicon
- [X] T014 [US1] Wire up routing in `apps/frontend/src/App.tsx` — `<Route path="/" element={<HomePage />} />` and `<Route path="*" element={<NotFoundPage />} />`
- [X] T015 [US1] Add npm scripts to `apps/frontend/package.json`: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`
- [X] T016 [US1] Create `apps/frontend/src/services/api.ts` with axios instance, base URL from `import.meta.env.VITE_API_BASE_URL`, request interceptor (auth token), and response interceptor (JSON envelope unwrapping per contracts/api-client.md)

**Checkpoint**: At this point, US1 should be fully functional — `npm install && npm run dev` serves the app with hot-reload, `npm run build` produces <500KB gzipped output

---

## Phase 4: User Story 2 - Developer Writes and Runs Tests (Priority: P2)

**Goal**: Developer can run automated tests with Vitest, see results with coverage, and use watch mode

**Independent Test**: Run `npm test` — Vitest executes, reports results with coverage. Run `npm test -- --watch` — tests re-run on file changes.

### Implementation for User Story 2

- [X] T017 [P] [US2] Install Vitest, @testing-library/react, @testing-library/jest-dom, jsdom, and @vitejs/plugin-react as dev dependencies in `apps/frontend/package.json`
- [X] T018 [P] [US2] Add Vitest configuration block in `apps/frontend/vite.config.ts`: jsdom environment, `**/*.test.{ts,tsx}` include pattern, coverage via v8, setup file path
- [X] T019 [P] [US2] Create test setup file `apps/frontend/tests/setup.ts` with `@testing-library/jest-dom` import
- [X] T020 [US2] Add npm scripts to `apps/frontend/package.json`: `"test": "vitest run --coverage"`, `"test:watch": "vitest"`

**Checkpoint**: At this point, US2 should work independently — `npm test` runs Vitest with coverage reported, watch mode re-runs on changes

---

## Phase 5: User Story 3 - Developer Maintains Code Quality (Priority: P3)

**Goal**: Developer can lint source code, auto-fix violations, and run TypeScript type-checking

**Independent Test**: Introduce a deliberate lint violation — `npm run lint` reports it. Run `npm run lint -- --fix` — violation auto-corrected. Run `npx tsc --noEmit` — zero errors on clean scaffold.

### Implementation for User Story 3

- [X] T021 [P] [US3] Configure ESLint flat config in `apps/frontend/eslint.config.js` with typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, and Prettier integration
- [X] T022 [P] [US3] Configure Prettier in `apps/frontend/.prettierrc` with single quotes, trailing commas, print width 100, tab width 2
- [X] T023 [US3] Add npm scripts to `apps/frontend/package.json`: `"lint": "eslint . --max-warnings 0"`, `"lint:fix": "eslint . --fix"`, `"typecheck": "tsc --noEmit"`

**Checkpoint**: All three user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates

- [X] T024 Validate all quality commands pass on clean scaffold — run `npm run build`, `npm test`, `npm run lint`, `npx tsc --noEmit` — all return exit code 0
- [X] T025 [P] Create `apps/frontend/README.md` with project overview, prerequisites (Node 22.x, npm 11.x), setup instructions (npm install, npm run dev), available scripts, and environment configuration reference
- [X] T026 Update `AGENTS.md` with frontend scaffold entry under Completed Features including dev/test/build/lint commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (US1 not required — independently testable)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion (US1, US2 not required — independently testable)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 — No dependencies on US1. Creates test files referencing components from US1 as sample, but testing infrastructure itself is independent.
- **User Story 3 (P3)**: Can start after Phase 2 — No dependencies on US1 or US2. Linting and type-checking configs are independent.

### Within Each User Story

- Configuration before source files
- Source files before wiring/integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- All Phase 2 tasks marked [P] can run in parallel
- All user stories can start in parallel after Phase 2 completes (no cross-story data coupling)
- All tasks within each story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallel configuration tasks together:
Task: "Configure Vite in apps/frontend/vite.config.ts"
Task: "Create HomePage component in apps/frontend/src/pages/HomePage.tsx"
Task: "Create NotFoundPage in apps/frontend/src/pages/NotFoundPage.tsx"
Task: "Create favicon in apps/frontend/public/vite.svg"

# After parallel tasks complete:
Task: "Wire up routing in apps/frontend/src/App.tsx"
Task: "Add npm scripts to apps/frontend/package.json"
Task: "Create API service in apps/frontend/src/services/api.ts"
```

## Parallel Example: User Story 2

```bash
# All US2 tasks can run in parallel:
Task: "Install Vitest and testing devDependencies"
Task: "Add Vitest config in vite.config.ts"
Task: "Create test setup file in tests/setup.ts"
Task: "Add test npm scripts in package.json"
```

## Parallel Example: User Story 3

```bash
# All US3 tasks can run in parallel:
Task: "Configure ESLint flat config in eslint.config.js"
Task: "Configure Prettier in .prettierrc"
Task: "Add lint/typecheck npm scripts in package.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `npm install && npm run dev` serves app; `npm run build` produces output
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → `npm run dev` works → **MVP!**
3. Add User Story 2 → `npm test` works → Deploy/Demo
4. Add User Story 3 → `npm run lint` works → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Vite config, pages, routing, API service)
   - Developer B: User Story 2 (Vitest setup, test files, coverage)
   - Developer C: User Story 3 (ESLint, Prettier, typecheck)
3. Stories complete and integrate independently (no file conflicts)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All commands operate from `apps/frontend/` directory
- The scaffold does not include application-specific features (state management, authentication UI, data fetching) — those come in future feature work
