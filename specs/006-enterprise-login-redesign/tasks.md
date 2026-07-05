---

description: "Task list for stabilizing authentication, routing, layouts, and UI theming"
---

# Tasks: Authentication, Routing, and UI Architecture Stabilization

**Input**: Design documents from `specs/006-enterprise-login-redesign/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included where needed to validate critical fixes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/frontend/src/`, `apps/frontend/tests/`
- **Backend**: `apps/backend/` (no backend changes expected)
- Paths reflect the monorepo structure

---

## Phase 1: Setup (Initial Assessment)

**Purpose**: Audit current state and create baseline for fixes

- [ ] T001 Audit the current authentication flow end-to-end (login form → API call → token storage → redirect → route resolution) in `apps/frontend/src/`
- [ ] T002 [P] Audit route definitions for missing entries (e.g., `/dashboard` not defined) in `apps/frontend/src/App.tsx`
- [ ] T003 [P] Audit import boundaries for auth/dashboard leakage in `apps/frontend/src/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix critical bugs that BLOCK all authentication and routing functionality

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Fix login form field name mismatch — change schema/field from `username` to `email` in `apps/frontend/src/components/login/loginSchema.ts` and update label in `apps/frontend/src/components/login/LoginCard.tsx`
- [ ] T005 Add `/dashboard` route pointing to DashboardPage in `apps/frontend/src/App.tsx` so login redirect target exists
- [ ] T006 Fix login redirect target from `/dashboard` to `/` (or the new `/dashboard`) in `apps/frontend/src/pages/LoginPage.tsx`
- [ ] T007 Verify RegisterPage also uses correct field names (`email`) in `apps/frontend/src/pages/RegisterPage.tsx` and `apps/frontend/src/components/register/RegisterForm.tsx`
- [ ] T008 Fix `apiClient` interceptor to properly handle error responses — prevent stack trace leaks, use user-friendly messages in `apps/frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — user can log in and reach dashboard without errors

---

## Phase 3: User Story 1 — Working Authentication + Dashboard Separation (Priority: P1) 🎯 MVP

**Goal**: A fully functional login flow where users authenticate with admin/admin123 and reach a clean dashboard. No dashboard components appear on the login page.

**Independent Test**: Navigate to `/login`, enter admin/admin123, submit → redirected to dashboard with no errors. Navigate to `/login` while authenticated → redirected away. Dashboard imports do not appear in login page bundle.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Implement hardcoded development credential check (`admin` / `admin123`) in `apps/frontend/src/services/auth.ts` as fallback when backend is unavailable
- [ ] T010 [P] [US1] Create `AuthLayout` component at `apps/frontend/src/components/layout/AuthLayout.tsx` for login/register pages only
- [ ] T011 [P] [US1] Create `DashboardLayout` component at `apps/frontend/src/components/layout/DashboardLayout.tsx` for authenticated pages (extract from `AppShell`)
- [ ] T012 [P] [US1] Refactor `AppShell` to use `DashboardLayout` in `apps/frontend/src/components/layout/AppShell.tsx`
- [ ] T013 [US1] Refactor route definitions in `apps/frontend/src/App.tsx` to use `AuthLayout` for `/login` and `/register`, and `DashboardLayout` for all protected routes
- [ ] T014 [US1] Remove all dashboard-component imports from `apps/frontend/src/pages/LoginPage.tsx` and related login components
- [ ] T015 [US1] Lazy-load DashboardPage and all protected route components via `React.lazy()` in `apps/frontend/src/App.tsx` to ensure they are not in the login page bundle
- [ ] T016 [US1] Add dev credentials (`admin` / `admin123`) to seeder or mark as test user in `apps/backend/database/seeders/DatabaseSeeder.php`

**Checkpoint**: At this point, User Story 1 should be fully functional — login works, dashboard is clean, no layout leakage

---

## Phase 4: User Story 2 — Protected Routes + Auth Guards (Priority: P2)

**Goal**: All routes are properly protected. Unauthenticated users can only access `/login`. Authenticated users cannot access `/login`. Redirects work correctly.

**Independent Test**: Access any protected route (e.g., `/dashboard`, `/pensioners`) while unauthenticated → redirected to `/login`. Access `/login` while authenticated → redirected to `/dashboard`. Logout → redirected to `/login?logout=...`.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Fix `ProtectedRoute` component at `apps/frontend/src/components/ProtectedRoute.tsx` — redirect unauthenticated users to `/login`, allow authenticated users to pass through
- [ ] T018 [P] [US2] Add redirect logic to prevent authenticated users from accessing `/login` (redirect to `/dashboard`) in `apps/frontend/src/pages/LoginPage.tsx`
- [ ] T019 [US2] Integrate `ProtectedRoute` into route definitions in `apps/frontend/src/App.tsx` for all dashboard routes
- [ ] T020 [US2] Fix `useAuth` redirect behavior — ensure `navigate` calls use correct paths (`/dashboard` exists now from T005) in `apps/frontend/src/hooks/useAuth.tsx`
- [ ] T021 [US2] Add session restoration logic — on page refresh, check localStorage for token, validate via `GET /api/user`, and restore auth state in `apps/frontend/src/hooks/useAuth.tsx`
- [ ] T022 [US2] Update `NavBar` component at `apps/frontend/src/components/NavBar.tsx` to show logout only when authenticated and integrate with DashboardLayout

**Checkpoint**: At this point, routes are fully protected, auth state persists on refresh, and redirect logic is correct

---

## Phase 5: User Story 3 — Global UI Theme + Military Finance Design System (Priority: P3)

**Goal**: Consistent AFP military financial theme across all pages. TailwindCSS properly loaded. shadcn/ui ThemeProvider configured. No inline styling conflicts.

**Independent Test**: Navigate to any page — all pages share the same color palette (navy #0B1F3A, blue #102A43, green #556B2F, gold #C9A227, background #F5F7FA), typography, spacing, and component styles. Dark mode toggle works.

### Implementation for User Story 3

- [ ] T023 [P] [US3] Ensure `globals.css` (or `index.css`) is imported at the app entry point in `apps/frontend/src/main.tsx` with correct Tailwind directives
- [ ] T024 [P] [US3] Verify and fix `tailwind.config.ts` in `apps/frontend/` — ensure custom AFP color palette, dark mode class strategy, and CSS variable mappings are correct
- [ ] T025 [P] [US3] Remove any inline `style={{}}` conflicting with Tailwind classes across all components in `apps/frontend/src/components/` and `apps/frontend/src/pages/`
- [ ] T026 [US3] Apply AFP color palette (navy, deep blue, military green, gold accent) consistently to all UI components in `apps/frontend/src/components/ui/`
- [ ] T027 [US3] Apply consistent typography (font sizes, heading hierarchy, spacing) across all pages in `apps/frontend/src/pages/`
- [ ] T028 [US3] Unify button, card, and input styles across the application to match enterprise banking-grade design in `apps/frontend/src/components/ui/`

**Checkpoint**: At this point, the application has a consistent enterprise military finance theme across all pages

---

## Phase 6: User Story 4 — Error Handling UX + Session Management (Priority: P3)

**Goal**: User-friendly error messages for all auth failures. Session persists on refresh. Logout clears session cleanly. No stack traces in UI.

**Independent Test**: Submit invalid credentials → "Invalid username or password" alert (not a stack trace). Stop backend → "Unable to connect" alert. Refresh page while logged in → session restored, still on dashboard. Logout → logged out, redirected to login.

### Implementation for User Story 4

- [ ] T029 [P] [US4] Replace raw error throwing with user-friendly messages in `apps/frontend/src/services/auth.ts` — handle network errors, 401, 500, account locked
- [ ] T030 [P] [US4] Add session expiry detection — decode Sanctum token or check `expires_at` in `apps/frontend/src/hooks/useAuth.tsx`
- [ ] T031 [US4] Implement auto-redirect: authenticated user on `/login` → `/dashboard`; unauthenticated user on protected route → `/login` in `apps/frontend/src/App.tsx`
- [ ] T032 [US4] Ensure `EnterpriseAlert` component at `apps/frontend/src/components/login/EnterpriseAlert.tsx` handles all 5 error types with correct messages and icons
- [ ] T033 [US4] Fix error state display in `LoginPage` — preserve entered email on failed attempt, clear password field in `apps/frontend/src/pages/LoginPage.tsx`
- [ ] T034 [US4] Add session cleanup on logout — clear localStorage token, reset user state, redirect to `/login` in `apps/frontend/src/hooks/useAuth.tsx`
- [ ] T035 [US4] Verify no stack traces appear in UI for any error scenario — test by forcing 401, 500, and network errors in `apps/frontend/src/services/auth.ts`

**Checkpoint**: All error states are handled gracefully, session persists on refresh, logout is clean

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, testing, and verification

- [ ] T036 [P] Remove orphaned `ProtectedRoute` component in `apps/frontend/src/components/ProtectedRoute.tsx` if fully replaced by layout-based guards
- [ ] T037 [P] Consolidate `EnterpriseAlert` imports into a single line in `apps/frontend/src/pages/LoginPage.tsx`
- [ ] T038 Run full test suite: `cd apps/backend && php artisan test` and `cd apps/frontend && npm test -- --run`
- [ ] T039 Run lint and typecheck: `cd apps/frontend && npm run lint` and `npx tsc --noEmit`
- [ ] T040 Run quickstart.md validation scenarios from `specs/006-enterprise-login-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 — builds on fixed auth flow
- **User Story 3 (P3)**: Can start after User Story 2 — applies theme to working routes
- **User Story 4 (P3)**: Can start after User Story 2 — requires working auth for session testing

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001, T002, T003)
- Foundational T004/T005/T006/T007 can run in parallel (different files)
- Within US1: T009, T010, T011, T012 can run in parallel
- Within US2: T017, T018 can run in parallel
- Within US3: T023, T024, T025 can run in parallel
- Within US4: T029, T030 can run in parallel
- Polish tasks T036, T037 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tasks together:
Task: "Implement hardcoded dev credentials in auth.ts"
Task: "Create AuthLayout component"
Task: "Create DashboardLayout component"
Task: "Refactor AppShell to use DashboardLayout"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test authentication flow end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Login works, no /dashboard 404
2. Add User Story 1 (Auth + Dashboard separation) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Protected routes) → Test independently → Deploy/Demo
4. Add User Story 3 (UI Theme) → Test independently → Deploy/Demo
5. Add User Story 4 (Error handling + Session) → Test independently → Deploy/Demo
6. Polish → Final verification

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth + Dashboard separation)
   - Developer B: User Story 2 (Protected routes + Layout)
3. Developer A continues to User Story 3 after US1
4. Developer B continues to User Story 4 after US2
5. Stories integrate and test independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify critical bugs (field name mismatch, missing route) in Foundational phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
