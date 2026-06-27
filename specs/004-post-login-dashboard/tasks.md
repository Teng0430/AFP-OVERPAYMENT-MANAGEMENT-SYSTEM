---

description: "Task list for Post-Login Dashboard feature"
---

# Tasks: Post-Login Dashboard

**Input**: Design documents from `/specs/004-post-login-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Included per constitution requirement — all frontend features MUST be tested with Vitest (min 70% coverage).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/frontend/src/`, `apps/frontend/tests/`
- **Backend**: Not applicable (this feature is frontend-only, depends on backend feature 003)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing scaffold is ready.

- [X] T001 Verify existing frontend scaffold: Vite, Vitest, ESLint, TypeScript strict mode, react-router-dom, axios

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth infrastructure that MUST be complete before ANY user story can be implemented.

- [X] T002 [P] Create `User` type in `apps/frontend/src/types/user.ts` (id, name, email, profile_image_url?)
- [X] T003 [P] Create `AuthContext` and `AuthProvider` in `apps/frontend/src/hooks/useAuth.ts` — manages user state, loading, error; provides login, register, logout, getUser methods
- [X] T004 [P] Create `auth` service in `apps/frontend/src/services/auth.ts` — login(), register(), logout(), getUser() API calls using existing axios client
- [X] T005 [P] Create default avatar placeholder SVG at `apps/frontend/src/assets/default-avatar.svg`

**Checkpoint**: Foundation ready — auth context available for all components.

---

## Phase 3: User Story 1 - View Dashboard After Login (Priority: P1) 🎯 MVP

**Goal**: Users see a dashboard page after successful login with a welcome greeting.

**Independent Test**: Authenticate via login API, verify redirect to `/dashboard` with welcome message showing the user's name.

### Implementation for User Story 1

- [X] T006 [P] [US1] Create `LoginPage` at `apps/frontend/src/pages/LoginPage.tsx` — email/password form, calls auth.login(), redirects to /dashboard on success
- [X] T007 [P] [US1] Create `RegisterPage` at `apps/frontend/src/pages/RegisterPage.tsx` — name/email/password form, calls auth.register(), redirects to /dashboard on success
- [X] T008 [P] [US1] Create `DashboardPage` at `apps/frontend/src/pages/DashboardPage.tsx` — displays "Welcome, {user.name}" greeting
- [X] T009 [US1] Update `apps/frontend/src/App.tsx` — add auth-aware routing: /login, /register, /dashboard (protected), / (redirect to dashboard if authed, login if not)

### Tests for User Story 1

- [X] T010 [US1] Create `LoginPage` test at `apps/frontend/tests/pages/LoginPage.test.tsx` — renders form, submits, redirects on success
- [X] T011 [P] [US1] Create `RegisterPage` test at `apps/frontend/tests/pages/RegisterPage.test.tsx` — renders form, submits, redirects on success
- [X] T012 [P] [US1] Create `DashboardPage` test at `apps/frontend/tests/pages/DashboardPage.test.tsx` — displays welcome message with user name

**Checkpoint**: At this point, User Story 1 should be fully functional. Users can register, log in, and see the dashboard.

---

## Phase 4: User Story 2 - Navigation Bar with User Profile (Priority: P1)

**Goal**: Authenticated users see a persistent nav bar with their profile image, name, and a dropdown menu.

**Independent Test**: Authenticate, verify nav bar visible on dashboard with user name and default avatar; verify nav bar not shown on login page.

### Implementation for User Story 2

- [X] T013 [P] [US2] Create `ProtectedRoute` component at `apps/frontend/src/components/ProtectedRoute.tsx` — checks auth state, redirects to /login if unauthenticated, shows loading state while verifying
- [X] T014 [P] [US2] Create `NavBar` component at `apps/frontend/src/components/NavBar.tsx` — displays user name + avatar (or default), click-to-open dropdown with Logout action; uses useAuth for state
- [X] T015 [US2] Update `apps/frontend/src/App.tsx` — render NavBar inside ProtectedRoute wrapper, apply to all authenticated pages

### Tests for User Story 2

- [X] T016 [US2] Create `ProtectedRoute` test at `apps/frontend/tests/components/ProtectedRoute.test.tsx` — renders children when authed, redirects when not, shows loading state
- [X] T017 [P] [US2] Create `NavBar` test at `apps/frontend/tests/components/NavBar.test.tsx` — displays user name + avatar, dropdown opens on click, shows logout option

**Checkpoint**: Nav bar is visible on all authenticated pages with user profile information.

---

## Phase 5: User Story 3 - Logout from Navigation Bar (Priority: P1)

**Goal**: Users can log out from the nav bar dropdown, ending their session and redirecting to login.

**Independent Test**: Authenticate, click logout from nav bar dropdown, verify redirect to login page with success message, verify /dashboard redirects to login.

### Implementation for User Story 3

- [X] T018 [US3] Implement logout flow in `apps/frontend/src/components/NavBar.tsx` — call auth.logout() on click, clear auth state, navigate to /login with success message
- [X] T019 [US3] Update `LoginPage` at `apps/frontend/src/pages/LoginPage.tsx` — display flash message "Logged out successfully." when redirected after logout

### Tests for User Story 3

- [X] T020 [US3] Create logout flow test at `apps/frontend/tests/components/NavBar.test.tsx` — clicking logout calls auth.logout(), redirects to /login
- [X] T021 [P] [US3] Test protected route redirect after logout — mock unauthenticated state, verify /dashboard redirects to /login

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks.

- [X] T022 Run full test suite: `cd apps/frontend && npm test` — verify all tests pass
- [X] T023 [P] Run type check: `cd apps/frontend && npx tsc --noEmit` — verify zero errors
- [X] T024 [P] Run lint: `cd apps/frontend && npm run lint` — verify zero violations
- [X] T025 Update `AGENTS.md` to mark feature 004 as completed with summary description
- [X] T026 Run quickstart validation scenarios from `specs/004-post-login-dashboard/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — scaffold verification only
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (dashboard) and US2 (nav bar) are independent — can be developed in parallel
  - US3 (logout) depends on US2 (nav bar provides the UI trigger)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (auth context, services)
- **User Story 2 (P1)**: Depends on Foundational (auth context)
- **User Story 3 (P1)**: Depends on User Story 2 (nav bar component) and Foundational (auth context)

### Within Each User Story

- Types/services before pages/components
- Components before integration in App.tsx
- Implementation before tests
- Story complete before moving to next priority

### Parallel Opportunities

- T002 (user types), T003 (useAuth hook), T004 (auth service), T005 (avatar asset) can run in parallel
- T006 (LoginPage), T007 (RegisterPage), T008 (DashboardPage) can run in parallel
- T013 (ProtectedRoute) and T014 (NavBar) can run in parallel
- All test files within a phase can run in parallel with implementation (TDD)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify scaffold)
2. Complete Phase 2: Foundational (auth context, services, types)
3. Complete Phase 3: User Story 1 (LoginPage, RegisterPage, DashboardPage, routing)
4. **STOP and VALIDATE**: Run `npm test` — MVP delivers basic auth flow

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (Dashboard + Login flow) → Deploy/Demo (MVP!)
3. Add User Story 2 (Nav bar with profile) → Deploy/Demo
4. Add User Story 3 (Logout from nav bar) → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- The backend auth API (feature 003) must be running for full integration tests
- Tests should mock API calls via Vitest to avoid backend dependency in unit tests
- Default avatar should be a simple SVG inline or an imported SVG file
