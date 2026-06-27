# Research: Post-Login Dashboard

**Phase**: 0 — Outline & Research
**Date**: 2026-06-27

## Overview

This document consolidates research findings for the Post-Login Dashboard feature. No NEEDS CLARIFICATION markers were present in the spec or plan, so this document confirms existing decisions and documents best practices.

---

## 1. Authentication State Management

**Decision**: React Context + custom hook (`useAuth`) for auth state management

**Rationale**:
- The existing scaffold uses localStorage for token storage (see `apps/frontend/src/services/api.ts`)
- React Context provides a lightweight, framework-idiomatic way to share auth state across the component tree
- A `useAuth` hook abstracts token verification, user fetching, and state management
- No external auth library needed — the existing axios interceptor already handles token injection

**Alternatives considered**:
- Redux: Overkill for auth-only state; adds unnecessary bundle weight
- Zustand: Viable but introduces a new dependency for a single concern
- Prop drilling: Unmaintainable as the app grows

**Best practices**:
- Auth state initialized on app mount by checking localStorage for existing token and validating with `/api/user`
- Login stores token in localStorage and updates context state
- Logout removes token from localStorage, resets context state, and redirects to login
- ProtectedRoute component wraps authenticated routes and redirects unauthenticated users

---

## 2. Route Protection Pattern

**Decision**: Route-level protection via a `ProtectedRoute` wrapper component

**Rationale**:
- React Router 7.x supports wrapper/layout routes elegantly
- A single `<ProtectedRoute>` component can wrap all authenticated routes
- On mount, `ProtectedRoute` checks auth state; if unauthenticated, it redirects to `/login`
- If authenticated, it renders the child route (dashboard) including the nav bar

**Best practices**:
- Protected route checks happen before the child component renders
- A brief loading state is shown while verifying the token on page refresh
- After logout, the redirect uses `replace: true` to prevent back-button navigation to the dashboard

---

## 3. Navigation Bar UX Pattern

**Decision**: Fixed top navigation bar with user dropdown menu

**Rationale**:
- Standard web application pattern — users expect the nav bar at the top
- Profile image + name in the nav bar matches common patterns (GitHub, Gmail, Slack)
- Dropdown menu on click (not hover) is more accessible (WCAG 2.1 AA compliant — hover-only menus fail for keyboard users)
- Default avatar placeholder for users without a profile image

**Best practices**:
- Nav bar is rendered once in the app layout, outside of individual page components
- Dropdown includes: user name (non-interactive), "Logout" action
- Dropdown closes on click outside, Escape key, or selecting an option
- Focus management: focus moves to the first menu item when dropdown opens
- ARIA attributes: `role="navigation"` on nav, `aria-label="User menu"` on dropdown button

---

## 4. Logout Flow

**Decision**: Call backend logout endpoint, clear local state, redirect to login

**Rationale**:
- Backend (`POST /api/logout`) revokes the Sanctum token as specified in feature 003
- Frontend must also clear the token from localStorage and reset React context
- Redirect to `/login` with a success flash message

**Best practices**:
- Logout API call should not block the UI — optimistically clear local state for instant response
- If the API call fails, still clear local state (the token can be revoked on next server interaction)
- After logout, the browser history entry should be replaced so the back button doesn't return to the dashboard

---

## 5. API Integration Points

**Decision**: Reuse existing `api.ts` axios client; create `auth.ts` service module

The existing `api.ts` already:
- Sets `Authorization: Bearer <token>` from localStorage on every request
- Unwraps the `{ success, data, error }` JSON envelope
- Rejects with a meaningful error message

New auth service (`auth.ts`) will provide:
- `login(email, password)` → stores token, returns user
- `register(name, email, password)` → stores token, returns user
- `logout()` → calls `/api/logout`, removes token
- `getUser()` → calls `/api/user`, returns current user profile

---

## 6. Existing Frontend Structure

The scaffold at `apps/frontend/` currently has:
- React Router with `/` (HomePage) and `*` (NotFoundPage) routes
- axios API client at `src/services/api.ts` with token injection and JSON envelope unwrapping
- Empty `src/hooks/` directory
- Basic HomePage with static welcome text
- Vitest testing infrastructure with setup.ts
- ESLint flat config + Prettier

This feature will:
- Replace HomePage with a login-aware routing structure
- Add LoginPage, RegisterPage, and DashboardPage
- Add NavBar component with profile display and logout
- Add ProtectedRoute component for route guarding
- Add useAuth hook and auth context for state management
- Add auth service module for API calls
