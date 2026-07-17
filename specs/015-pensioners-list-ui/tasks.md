# Tasks: Pensioners List UI & Actions

**Branch**: `015-pensioners-list-ui` | **Date**: 2026-07-10 | **Plan**: plan.md

## Implementation Strategy

**MVP scope**: Phase 3 only (Story 1 — Fix Layout & Responsiveness). This delivers the core layout fix and column optimization.

**Incremental delivery**: Each phase is independently testable and can be shipped without later phases:
- Phase 3: Viewport fix + responsive filters + column optimization + sticky column polish + date format
- Phase 4: Actions dropdown + print route + View modal sections + print view route params
- Phase 5: Toast notifications + hover effects + empty state + mobile card layout
- Phase 6: Final verification

---

## Phase 1: Setup

No project initialization tasks required. All dependencies (lucide-react, shadcn/ui DropdownMenu, @tanstack/react-table, react-router-dom) are already installed.

---

## Phase 2: Foundational

- [x] T001 [P] Update `formatDisplayDate` in `apps/frontend/src/lib/financial-calculations.ts` to output short month format ("Mar 31, 2026") by changing `month: 'long'` to `month: 'short'`

---

## Phase 3: Story 1 — Fix Layout & Responsiveness (P1) [US1][US4]

**Goal**: Eliminate page-level horizontal scrolling, optimize column widths, improve sticky columns, and make filters responsive.

**Independent test**: Load the Pensioners List page at 1366×768 — no page-level horizontal scrollbar appears. Filters display in a responsive grid. Sticky columns stay in place during horizontal scroll with visible shadows.

- [x] T002 Fix page-level horizontal scrolling in `apps/frontend/src/pages/PensionersPage.tsx`: Add `w-full max-w-full` to root `<div className="space-y-6">`, ensure Card containers and all wrappers are viewport-constrained
- [x] T003 [P] Replace filter layout in `apps/frontend/src/pages/PensionersPage.tsx`: Change `flex flex-wrap items-end gap-3` to `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3`, remove fixed pixel widths on filter Select components (use `w-full`), make Apply button full-width on mobile
- [x] T004 [P] Optimize column widths in `apps/frontend/src/pages/PensionersPage.tsx`: Adjust `max-w` on Cause (150→180px) and Agency (120→180px); ensure financial columns keep `whitespace-nowrap`; add `truncate` with `title` tooltip where missing; set `min-w` on name and serial_number columns for visibility
- [x] T005 [P] Improve sticky column implementation in `apps/frontend/src/pages/PensionersPage.tsx`: Add `z-20` on sticky header cells; add `shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]` on left-sticky columns; add `shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]` on right-sticky (actions) column; ensure `bg-background` on all sticky cells

---

## Phase 4: Story 2 — Actions Menu & Record Management (P1) [US2]

**Goal**: Replace four inline action buttons with a compact dropdown menu; wire up View, Edit, Print, Delete actions; add missing Print route; complete View modal sections.

**Independent test**: Click the three-dot icon on any row — dropdown menu opens with View, Edit, Print, Delete. Each action executes correctly.

- [x] T006 [P] [US2] Create `PensionerActionsMenu` component at `apps/frontend/src/components/pensioner/PensionerActionsMenu.tsx`: Use shadcn/ui `DropdownMenu` with `MoreHorizontal` trigger, four items (View/Eye, Edit/Pencil, Print/Printer, Delete/Trash2), keyboard navigation, accessible ARIA labels
- [x] T007 [US2] Integrate `PensionerActionsMenu` into `apps/frontend/src/pages/PensionersPage.tsx`: Replace the four icon buttons in the `actions` column cell renderer with the new component; pass existing handlers (`setViewModalId`, `navigate`, `handlePrint`, `initiateDelete`) as props
- [x] T008 [P] [US2] Add Print route in `apps/frontend/src/App.tsx`: Add `<Route path="pensioners/:id/print" element={<PensionerPrintViewPage />} />` with lazy loading; create a wrapper function `PensionerPrintViewPage` that extracts `id` from `useParams` and renders `PensionerPrintView`
- [x] T009 [P] [US2] Enhance `PensionerViewModal` at `apps/frontend/src/components/pensioner/PensionerViewModal.tsx`: Add missing sections — Recovery Timeline, Supporting Documents (if available), Audit Information (created_at, updated_at, created_by)
- [x] T010 [P] [US2] Update `PensionerPrintView` at `apps/frontend/src/components/pensioner/PensionerPrintView.tsx` to accept pensioner ID from URL params; ensure all FR-013 sections are present; fix confirmation dialog text in PensionersPage to match spec ("Are you sure you want to delete this pensioner?")

---

## Phase 5: Story 3 — UX Enhancements & Responsive Mobile Layout (P2) [US3]

**Goal**: Toast notifications, hover effects, empty state, mobile card layout, keyboard accessibility improvements.

**Independent test**: Delete a pensioner — success toast appears. Hover over any row — background changes. Resize to <768px — cards display instead of table.

- [x] T011 [P] [US3] Create `Toaster` component at `apps/frontend/src/components/ui/toaster.tsx`: Render toast notifications using `useToast()` hook; position at bottom-right; support default/destructive variants; auto-dismiss after 5 seconds; manual dismiss button
- [x] T012 [P] [US3] Wire up toast notifications in `apps/frontend/src/pages/PensionersPage.tsx`: Replace inline error div with toast calls; add success toast after delete; add error toast on failed delete/network failures; import `toast()` from `@/hooks/use-toast`
- [x] T013 [US3] Add `<Toaster />` component in `apps/frontend/src/App.tsx` inside the main layout (within `<AppShell>` or `<ProtectedRoute>`)
- [x] T014 [P] [US3] Add hover effects on table rows in `apps/frontend/src/pages/PensionersPage.tsx`: Add `hover:bg-muted/50 transition-colors` className to all `TableRow` elements
- [x] T015 [P] [US3] Implement mobile card layout in `apps/frontend/src/pages/PensionersPage.tsx`: Add a card-style view rendered below 768px (`hidden md:table` / `block md:hidden`); each card shows Name, Serial#, Rank, Status, Balance, and the Actions menu

---

## Phase 6: Verification & Polish

- [x] T016 Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles with zero errors
- [x] T017 Run `cd apps/frontend && npm run lint` — no lint violations
- [x] T018 Run `cd apps/frontend && npm run build` — TypeScript compiles clean for modified files (pre-existing errors in other files remain) — production build succeeds
- [x] T019 Run `cd apps/frontend && npm test` — all existing tests pass (no regressions)
- [x] T020 Manual validation per quickstart.md: layout, responsiveness, actions, print, delete, filters at viewport widths 375px, 768px, 1366px, 1920px

---

## Dependency Graph

```
Phase 2 (Foundational)
    └── T001
            │
            ▼
Phase 3 (Story 1 — Layout & Filters) [US1][US4]
    ├── T002 (viewport constraint)
    ├── T003 [P] (filter grid)
    ├── T004 [P] (column widths)
    └── T005 [P] (sticky columns)
            │
            ▼
Phase 4 (Story 2 — Actions Menu) [US2]
    ├── T006 [P] (PensionerActionsMenu component)
    ├── T007 (integrate into PensionersPage)  ← depends on T006
    ├── T008 [P] (print route)
    ├── T009 [P] (view modal sections)
    └── T010 [P] (print view params)
            │
            ▼
Phase 5 (Story 3 — UX & Mobile) [US3]
    ├── T011 [P] (Toaster component)
    ├── T012 [P] (wire toasts)  ← depends on T011
    ├── T013 (Toaster in App.tsx)  ← depends on T011
    ├── T014 [P] (hover effects)
    └── T015 [P] (mobile card layout)
            │
            ▼
Phase 6 (Verification)
    ├── T016 (TypeScript check)
    ├── T017 (lint)
    ├── T018 (build)
    ├── T019 (tests)
    └── T020 (manual validation)
```

## Parallel Execution Examples

**Phase 3 (Story 1)**:
- T002 (viewport fix) can run alone
- T003, T004, T005 are all independent edits to different sections of PensionersPage.tsx, but touch the same file — run sequentially to avoid merge conflicts

**Phase 4 (Story 2)**:
- T006 (new component file) + T008 (App.tsx edit) + T009 (PensionerViewModal edit) + T010 (PensionerPrintView edit) can all run in parallel (different files)
- T007 depends on T006 (needs the component to import)

**Phase 5 (Story 3)**:
- T011 (new Toaster component) + T014 (hover on PensionersPage) + T015 (mobile cards) can run in parallel
- T012 depends on T011 (needs Toaster wired to work)
- T013 depends on T011 (needs Toaster to exist)

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 20 |
| **Setup (Phase 1)** | 0 |
| **Foundational (Phase 2)** | 1 |
| **Story 1 — Layout & Filters [US1][US4]** | 4 |
| **Story 2 — Actions Menu [US2]** | 5 |
| **Story 3 — UX & Mobile [US3]** | 5 |
| **Verification (Phase 6)** | 5 |
| **Parallel [P] tasks** | 11 |
| **MVP scope** | Phase 3 (T001–T005) |
| **Independent test per story** | Yes — each phase has its own verification scenario |
