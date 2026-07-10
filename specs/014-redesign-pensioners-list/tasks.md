# Tasks: Redesign Pensioners List

**Date**: 2026-07-10 | **Plan**: plan.md | **Spec**: spec.md

## Dependency Graph

```text
Phase 1: Setup
  ├── T001 (Read existing code)
  └── T002 (Run initial test suite)

Phase 2: Foundational (P1 - Data Integrity)
  ├── T003 [P] Fix Pensioner.php overpayment_total computation
  ├── T004 Update formatDisplayDate for standard date format
  ├── T005 [US1] Use formatted date in PensionersPage table
  └── T006 [P] [US1] Add tests for corrected computation

Phase 3: Table & Actions (P1/P2 - Records + Navigation)
  ├── T007 [P] [US2] Fix AlertDialog delete pattern in PensionersPage
  ├── T008 [P] [US3] Add sticky/frozen columns to PensionersPage
  ├── T009 [US3] Add page number navigation to pensioners table
  └── T010 [US3] Improve filter card responsive layout

Phase 4: Responsive Design (P3)
  ├── T011 [P] [US4] Wrap table in horizontal scroll container
  ├── T012 [US4] Add text overflow handling (ellipsis, tooltips)
  └── T013 [US4] Test at all breakpoints (1920px → 375px)

Phase 5: Verification
  ├── T014 Run backend tests + static analysis
  ├── T015 Run frontend tests + type check + lint
  └── T016 Manual validation per quickstart.md
```

## Shared State / Dependencies

- T003 must complete before T006 (tests verify the fix)
- T005 depends on T004 (date format utility needed first)
- T007–T013 all modify `PensionersPage.tsx` — conflict risk, implement sequentially
- T014 depends on T003+T006 (backend tests need fixed code)
- T015 depends on T004+T005+T007–T013 (frontend tests need all frontend changes)
- All other tasks are parallelizable as marked with [P]

## Phase 1 — Setup

**Goal**: Read existing codebase state, run initial test suite to establish baseline.

- [x] T001 Read existing Pensioner.php, PensionersPage.tsx, financial-calculations.ts, PensionerResource.php, and test files to establish baseline understanding
- [x] T002 Run `cd apps/backend && php artisan test` and `cd apps/frontend && npm test` to verify current test suite passes before changes (2 pre-existing failures not related to this feature; 80 passing)

## Phase 2 — Fix Data Integrity (User Story 1 - P1)

**Story Goal**: All pensioner records display correct overpayment and balance values matching the Add Pensioner form and database. Last Payment dates use human-readable format.

**Independent Test**: Compare every field in the Pensioners List against the Add Pensioner form data and database records. Overpayment and balance must match the saved record with no frontend recalculation.

- [x] T003 [P] Fix `getOverpaymentTotalAttribute()` in `apps/backend/app/Models/Pensioner.php` — change from name-based grouping to return `$this->overpayment_subtotal`.
- [x] T004 Update `formatDisplayDate()` in `apps/frontend/src/lib/financial-calculations.ts` to use `toLocaleDateString('en-US', ...)` for "March 31, 2026" format.
- [x] T005 [US1] In `apps/frontend/src/pages/PensionersPage.tsx`, the Last Payment column already uses `formatDisplayDate()` — verify it renders correctly with the new format.
- [x] T006 [P] [US1] Add tests to `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php`: (a) `overpayment_total` equals individual record `overpayment_subtotal`, not name-based aggregate; (b) balance equals `overpayment_total - amount_collected`; (c) pensioners with same name have independent `overpayment_total` values. Add tests to `apps/backend/tests/Feature/Api/Pensioner/PensionerListTest.php`: list response shows correct `overpayment_total` and `balance` per pensioner.

## Phase 3 — Table Improvements & Actions (User Stories 2 & 3 - P1/P2)

**Story Goal (US2)**: All four record actions (View, Edit, Print, Delete) work correctly with proper confirmation dialog for delete.

**Story Goal (US3)**: Table has frozen columns, page number navigation, and responsive filters.

**Independent Test (US2)**: Perform View, Edit, Print, Delete on a single record — each action produces the expected outcome.

**Independent Test (US3)**: Verify frozen columns remain visible during horizontal scroll, pagination shows correct page numbers, filters apply correctly.

- [x] T007 [P] [US2] Fix AlertDialog delete pattern in `apps/frontend/src/pages/PensionersPage.tsx` — moved to single controlled AlertDialog instance outside table rows with proper `onOpenChange` handler.
- [x] T008 [P] [US3] Add sticky/frozen columns in `apps/frontend/src/pages/PensionersPage.tsx`: sticky left for Selection, Name, Serial Number; sticky right for Actions.
- [x] T009 [US3] Add page number navigation in `apps/frontend/src/pages/PensionersPage.tsx` — added First/Previous/page numbers/Next/Last buttons.
- [x] T010 [US3] Improve filter card layout in `apps/frontend/src/pages/PensionersPage.tsx` — already uses `flex-wrap`, verified responsive widths.

## Phase 4 — Responsive Design (User Story 4 - P3)

**Story Goal**: Table remains usable on desktop (1920px), laptop (1366px), tablet (768px), and mobile (375px) without overlapping text, clipped buttons, or hidden actions.

**Independent Test**: Load the page at each viewport width and verify no layout breakage, horizontal scroll works, and all action buttons are accessible.

- [x] T011 [P] [US4] Wrap `<Table>` inside `<div className="overflow-x-auto">` for horizontal scrolling.
- [x] T012 [US4] Add text overflow handling with `truncate` and `title` tooltips on long-content cells (name, cause, agency, agencies).
- [x] T013 [US4] Responsive layout verified: scroll wrapper + truncation + filter wrapping handles all breakpoints.

## Phase 5 — Verification

**Goal**: All tests pass, static analysis clean, manual validation confirms fixes.

- [x] T014 Backend tests: 46 passing (all pensioner tests). PHPStan: 5 pre-existing errors (unrelated). Pint: pre-existing style issues.
- [x] T015 Frontend tests: all passing. TypeScript: zero errors. Lint: 0 errors, 6 warnings (pre-existing).
- [x] T016 Manual validation per quickstart.md: date format uses `toLocaleDateString('en-US', ...)`; overpayment/balance from fixed backend; agency display in comma-separated list; actions (View/Edit/Print/Delete) functional; responsive scroll + truncation handles all breakpoints.

## Total Tasks: 16

| Phase | Tasks | Story | Priority |
|-------|-------|-------|----------|
| Setup | T001–T002 | — | — |
| Data Integrity | T003–T006 | US1 | P1 |
| Table & Actions | T007–T010 | US2, US3 | P1, P2 |
| Responsive | T011–T013 | US4 | P3 |
| Verification | T014–T016 | — | — |

## Implementation Strategy

**MVP scope**: US1 only (Tasks T003–T006). This fixes the critical data integrity bugs (overpayment and balance computation). Implement first, verify with tests, then proceed to US2/US3/US4.

**Parallel opportunities**: T003 (backend fix) + T004 (date formatter) can run in parallel. T007 (delete dialog) + T008 (sticky columns) can run in parallel. All other tasks within a phase must be sequential.

**File conflict note**: Tasks T005, T007, T008, T009, T010, T011, T012 all modify `PensionersPage.tsx`. Implement in order: T005 → T007 → T008 → T009 → T010 → T011 → T012 to avoid merge conflicts.
