# Quickstart: Post-Login Dashboard

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-27

## Overview

Validation scenarios to prove the post-login dashboard feature works end-to-end.

---

## Prerequisites

- Backend server running: `cd apps/backend && php artisan serve`
- Frontend dev server running: `cd apps/frontend && npm run dev`
- Backend migrations run: `cd apps/backend && php artisan migrate`
- Auth endpoints implemented (feature 003)

---

## Validation Scenario 1: Full Auth Lifecycle

**Goal**: Verify a user can register, login, view dashboard, and logout.

**Steps**:
1. Open `http://localhost:5173` — should see login page
2. Navigate to register page — should see registration form
3. Enter name, email, password — submit
4. Verify redirect to dashboard with welcome message showing user's name
5. Verify navigation bar visible at top with user's name and default avatar
6. Click user profile area in nav bar — dropdown menu appears
7. Click "Logout"
8. Verify redirect to login page with success message "Logged out successfully."
9. Try navigating to `http://localhost:5173/dashboard` — should redirect back to login

---

## Validation Scenario 2: Protected Route Guard

**Goal**: Verify unauthenticated users cannot access the dashboard.

**Steps**:
1. Open a private/incognito browser window
2. Navigate to `http://localhost:5173/dashboard`
3. Verify redirect to login page
4. Verify no navigation bar shown

---

## Validation Scenario 3: Nav Bar Profile Display

**Goal**: Verify nav bar shows user profile information correctly.

**Steps**:
1. Login as a registered user with a name
2. Verify nav bar shows user's name and default avatar
3. Navigate between pages (if multiple pages exist) — nav bar persists
4. Hover over/click profile area — dropdown appears with "Logout" option

---

## Validation Scenario 4: Token Expiry / Invalid Token

**Goal**: Verify the app handles an expired or invalidated token gracefully.

**Steps**:
1. Login as a registered user — arrives at dashboard
2. Manually clear the auth token from localStorage (via browser dev tools)
3. Refresh the page
4. Verify redirect to login page

---

## Quick Verification (Automated)

```bash
# Run frontend tests
cd apps/frontend && npm test

# Run type check
cd apps/frontend && npx tsc --noEmit

# Run lint
cd apps/frontend && npm run lint
```

**Expected**: All tests pass, type check passes with zero errors, lint passes with zero violations.
