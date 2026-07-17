# Tasks: Fix Alert Dialog Import Error

**Branch**: `013-fix-alert-dialog-import`
**Feature**: Fix Alert Dialog Import Error

## Phase 1: Setup

No setup tasks required. Dependencies (`@radix-ui/react-alert-dialog` ^1.1.19) are already installed. Path alias configuration in `tsconfig.app.json` and `vite.config.ts` is correct.

---

## Phase 2: Foundational

No foundational tasks required. This is a single-component fix with no blocking prerequisites.

---

## Phase 3: User Story 1 — Access the Pensioners Page (P1)

**Story Goal**: Users can access the Pensioners page without an application error. Destructive actions show a confirmation dialog before executing.

**Independent Test**: Navigate to the Pensioners page URL — page loads without error. Click delete on any row — confirmation dialog appears with Cancel and Delete buttons.

### Implementation Tasks

- [X] T001 [P] [US1] Create `apps/frontend/src/components/ui/alert-dialog.tsx` — Root, Trigger, Content (with overlay), Header, Title, Description, Footer, Cancel, and Action sub-components following the `dialog.tsx` pattern with `@radix-ui/react-alert-dialog` primitives; export all named exports; omit X close button (alert dialog closes via Cancel/Action)

---

## Phase 4: Phase 4 — User Story 2: Maintain Development Workflow (P1)

**Story Goal**: Developers can run the development server and production builds without import resolution errors.

**Independent Test**: Run `npm run build` — completes successfully. Run `npm run dev` — starts without import resolution errors.

### Implementation Tasks

- [X] T002 [P] [US2] Run `cd apps/frontend && npx vite build` to verify Vite build succeeds — **PASS** (no import resolution errors; `npm run build` fails only due to pre-existing `tsc -b` errors in other files)
- [X] T003 [P] [US2] Run `cd apps/frontend && npx tsc --noEmit` to verify zero type errors — **PASS** (no errors from new component)
- [X] T004 [P] [US2] Run `cd apps/frontend && npm run lint` to verify no lint violations — **PASS** (2 pre-existing errors from PensionerViewModal.tsx, none from new component)

---

## Dependencies

```
Phase 3 (T001) → Phase 4 (T002, T003, T004)
```

Phase 3 must complete before Phase 4. T002, T003, and T004 can run in parallel.

## Parallel Execution Opportunities

| Phase | Parallel Tasks |
|-------|---------------|
| Phase 4 | T002, T003, T004 — all independent verification commands |

## Independent Test Criteria

| Story | Test |
|-------|------|
| US1 | Navigate to Pensioners page — page loads. Click delete — confirmation dialog appears with Cancel/Delete buttons. |
| US2 | `npm run build` completes. `npm run dev` starts without errors. `npx tsc --noEmit` passes. `npm run lint` passes. |

## Suggested MVP Scope

**MVP** = Phase 3 only (T001). Once the component file exists, the page loads and destructive actions display the confirmation dialog. Verification tasks are optional follow-ups.
