# Quickstart: Enterprise Login Redesign

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-05

## Prerequisites

- Node.js 22.x LTS
- npm 11.x
- Backend server running at `http://localhost:8000` (or configured API URL)

## Setup

```bash
# Install dependencies (if not already done)
cd apps/frontend
npm install
```

## Running the Dev Server

```bash
cd apps/frontend
npm run dev
```

Opens at `http://localhost:5173/login`

## Validation Scenarios

### Scenario 1: Login page renders correctly

1. Navigate to `http://localhost:5173/login`
2. **Expected**: Two-column layout on desktop (>=1024px)
   - Left column: Glassmorphism card with AFP logo, system title, username/password fields, login button, security badges
   - Right column: Hero section with animated background and statistics overlays
3. **Expected**: Single-column layout on mobile (<768px)
   - Centered login card fills viewport width
   - Hero section hidden
4. **Expected**: Footer visible with AFP branding and links

### Scenario 2: Form interaction

1. Focus username field and type a username
2. Tab to password field and type a password
3. **Expected**: Password visibility toggle works (eye icon)
4. **Expected**: Enter key submits the form
5. **Expected**: Caps Lock indicator appears when Caps Lock is active

### Scenario 3: Authentication flow

1. Enter valid credentials (existing user from backend)
2. Click Login button
3. **Expected**: Loading state appears with spinner + "Authenticating..." text
4. **Expected**: On success, animated transition to `/dashboard`
5. **Expected**: On failure, enterprise alert appears with error message

### Scenario 4: Error states

1. Submit with empty fields → validation errors on username/password
2. Submit with invalid credentials → enterprise alert "Invalid username or password"
3. Stop the backend server, submit → "Unable to connect" network error alert

### Scenario 5: Accessibility

1. Tab through the page → all elements receive visible focus rings
2. Use screen reader (NVDA/VoiceOver) → all elements have ARIA labels
3. Toggle high contrast mode → all text remains readable
4. Enable `prefers-reduced-motion` → animations are disabled

### Scenario 6: Dark/Light mode

1. Toggle system theme or app theme to dark mode
2. **Expected**: Login page adapts with appropriate dark mode colors
3. Toggle back to light mode → reverts to light theme

## Running Tests

```bash
cd apps/frontend
npm test -- --run
```

Expected: Login page test and all other frontend tests pass.

## Related Documents

- [Specification](spec.md)
- [Data Model](data-model.md)
- [API Contracts](contracts/api.md)
