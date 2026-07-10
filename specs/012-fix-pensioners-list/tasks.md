---

description: "Task list for Fix Pensioners List feature implementation"
---

# Tasks: Fix Pensioners List

**Input**: Design documents from `specs/012-fix-pensioners-list/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/src/` → mapped to `apps/backend/app/`
- **Frontend**: `apps/frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shadcn/ui components and utility functions needed by multiple user stories

- [x] T001 [P] Add shadcn/ui AlertDialog component (for delete confirmation dialog) via `npx shadcn@latest add alert-dialog`
- [x] T002 [P] Add `formatDisplayDate` utility function in `apps/frontend/src/lib/financial-calculations.ts` that formats date strings (handles null, ISO timestamps, returns "DD-MM-YYYY" format)
- [x] T003 Add `last_payment_formatted` computed field to `apps/backend/app/Http/Resources/PensionerResource.php` that returns a human-readable date string using Carbon formatting ("F d, Y")

---

## Phase 2: User Story 1 - View Accurate Pensioner Records (Priority: P1)

**Goal**: Fix date formatting in Last Payment column, display agency names instead of count, ensure Overpayment and Balance display exactly from backend with no recalculations

**Independent Test**: Compare every field in the Pensioners List against the corresponding Add Pensioner form data and database records.

### Implementation for User Story 1

- [x] T004 [P] [US1] Add cell formatters for `last_payment`, `monthly_pension`, `amount_collected`, `overpayment_total`, and `balance` columns in `apps/frontend/src/pages/PensionersPage.tsx` — use `formatDisplayDate` for dates, `formatCurrency` for monetary values
- [x] T005 [P] [US1] Replace agency count display with agency name badges/list in the `agency_deductions` column cell renderer in `apps/frontend/src/pages/PensionersPage.tsx` — show comma-separated names with a tooltip on hover for full breakdown (name + amount)
- [x] T006 [US1] Ensure all 12 spec fields (Rank, Name, Serial Number, Agency, Last Payment, Monthly Pension, Cause, Agencies, Overpayment, Collected, Balance, Status) display exactly as entered in Add Pensioner form — added missing "Cause" column

**Checkpoint**: Pensioners List shows correct date format, agency names, and accurate financial values from backend.

---

## Phase 3: User Story 2 - Manage Individual Pensioner Records (Priority: P1)

**Goal**: Add View, Edit, Print, and Delete actions for each pensioner row

**Independent Test**: Perform each action (View, Edit, Print, Delete) on a single record and verify the expected outcome.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Create `PensionerViewModal` component in `apps/frontend/src/components/pensioner/PensionerViewModal.tsx` — Dialog-based modal that fetches full pensioner data via `get(id)` and displays: Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status. Include loading, error, and empty states.
- [ ] T008 [P] [US2] Create `EditPensionerPage` in `apps/frontend/src/pages/EditPensionerPage.tsx` — Reuse the same form layout as `AddPensionerPage.tsx`, fetch existing data via `get(id)` to prepopulate all fields, submit via `update(id, payload)`, navigate back to list on success. Add route validation (404 handling for invalid IDs).
- [ ] T009 [P] [US2] Create `PensionerPrintView` component in `apps/frontend/src/components/pensioner/PensionerPrintView.tsx` — Print-optimized component showing: "AFP Pension Overpayment Monitoring System" header, Pensioner Details, Agency Summary, Financial Summary (Overpayment, Collected, Remaining Balance, Status), Generated Date. Trigger `window.print()` on mount. Include print-specific CSS via `@media print`.
- [ ] T010 [US2] Update actions column in `apps/frontend/src/pages/PensionersPage.tsx` — Add View (Eye icon → opens PensionerViewModal), Print (Printer icon → opens PensionerPrintView in new window), fix Edit (Pencil icon → navigate to `/pensioners/{id}/edit`), replace `window.confirm` with AlertDialog for Delete
- [ ] T011 [US2] Add edit route in `apps/frontend/src/App.tsx` — Add `<Route path="pensioners/:id/edit" element={<EditPensionerPage />} />` inside the protected route group

**Checkpoint**: Each pensioner row has working View, Edit, Print, and Delete actions. All modals/pages render correctly.

---

## Phase 4: User Story 3 - Navigate and Find Records Efficiently (Priority: P2)

**Goal**: Add frozen columns, improve pagination with page numbers, add column visibility toggle

**Independent Test**: Verify frozen columns stay visible when scrolling horizontally, sorting reorders correctly, pagination shows correct pages.

### Implementation for User Story 3

- [ ] T012 [US3] Add frozen/sticky columns in `apps/frontend/src/pages/PensionersPage.tsx` — Apply CSS `position: sticky; left: 0; z-index: 10; background-color: inherit` to Selection checkbox, Name, Serial Number, and Actions columns. Ensure frozen columns maintain proper background color when scrolling over other columns.
- [ ] T013 [US3] Improve pagination in `apps/frontend/src/pages/PensionersPage.tsx` — Replace Previous/Next buttons with page number buttons showing all pages (with ellipsis for large page counts). Add page size selector (10, 25, 50, 100).

**Checkpoint**: Table has frozen key columns and page-number-based pagination.

---

## Phase 5: User Story 4 - Use the Table on Any Device (Priority: P3)

**Goal**: Make table responsive with horizontal scroll, text overflow handling, and compact mode

**Independent Test**: Load the page at various screen widths (1920px, 1366px, 768px, 375px) — verify no overlapping, clipped, or hidden content.

### Implementation for User Story 4

- [ ] T014 [US4] Add responsive table wrapper in `apps/frontend/src/pages/PensionersPage.tsx` — Wrap `<Table>` in `<div className="overflow-x-auto">` for horizontal scroll. Ensure filter card uses responsive widths (`flex-wrap`, responsive `min-w`/`w-full` classes).
- [ ] T015 [US4] Add text overflow handling in `apps/frontend/src/pages/PensionersPage.tsx` — Apply `className="max-w-[200px] truncate"` with title tooltip to long-text columns (name, serial number, cause). Ensure financial columns use `text-right` alignment and `whitespace-nowrap`.

**Checkpoint**: Table is usable at all viewport widths with no content overflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, testing, and cleanup

- [ ] T016 [P] Add backend tests in `apps/backend/tests/Feature/Api/Pensioner/PensionerListTest.php` — Verify `last_payment` date is formatted, `overpayment_total` matches expected computation, `balance` equals `overpayment_total - amount_collected`, agency names are returned in `agency_deductions`
- [ ] T017 [P] Add backend test in `apps/backend/tests/Feature/Api/Pensioner/PensionerViewTest.php` — Test `GET /api/pensioners/{id}` returns all relations (collections, recovery_installments, upload_batch, creator)
- [ ] T018 [P] Add frontend component tests — Test `PensionerViewModal` rendering with loading/error/success states, test `PensionerPrintView` renders all required sections
- [ ] T019 Run quickstart.md validation — Execute all 13 validation scenarios from `specs/012-fix-pensioners-list/quickstart.md`
- [ ] T020 Run full test suite: `cd apps/backend && php artisan test && vendor/bin/phpstan analyse --level=6 && ./vendor/bin/pint`
- [ ] T021 Run full frontend checks: `cd apps/frontend && npm test && npx tsc --noEmit && npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 2)**: Depends on T002 (formatDisplayDate helper), T003 (backend formatted field)
- **User Story 2 (Phase 3)**: Depends on T001 (AlertDialog component), T004/T005 (updated PensionersPage with formatters)
- **User Story 3 (Phase 4)**: Modifies PensionersPage.tsx — must run AFTER Phase 2 (avoids merge conflicts)
- **User Story 4 (Phase 5)**: Modifies PensionersPage.tsx — must run AFTER Phase 3, but can run IN PARALLEL with Phase 4 (different sections of the same file, but preferably sequential on same file)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — can start first
- **User Story 2 (P1)**: Light dependency on US1 (formatted PensionersPage) but can be developed in parallel if PensionersPage is marked with TODO sections
- **User Story 3 (P2)**: Modifies same file as US1 (PensionersPage.tsx) — should be implemented after US1
- **User Story 4 (P3)**: Modifies same file as US1/3 (PensionersPage.tsx) — should be implemented after US3

### Within Each User Story

- New components before integration (PensionerViewModal, EditPensionerPage, PensionerPrintView before wiring into PensionersPage)
- Integration tasks (T010, T011) depend on new components being created

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel (AlertDialog install, financial-calculations.ts edit, PensionerResource.php edit)
- **Phase 2**: T004 and T005 can run in parallel (different column definitions in same file — edit both in one session)
- **Phase 3**: T007, T008, T009 can run in parallel (three new independent files). T010 depends on all three. T011 is independent.
- **Phase 6**: T016, T017, T018 can run in parallel (different test files)

---

## Parallel Example: User Story 2

```bash
# Launch all new components for User Story 2 together:
Task: "Create PensionerViewModal in apps/frontend/src/components/pensioner/PensionerViewModal.tsx"
Task: "Create EditPensionerPage in apps/frontend/src/pages/EditPensionerPage.tsx"
Task: "Create PensionerPrintView in apps/frontend/src/components/pensioner/PensionerPrintView.tsx"

# Then integrate into PensionersPage:
Task: "Update actions column in apps/frontend/src/pages/PensionersPage.tsx (View, Print, Edit, Delete)"
Task: "Add edit route in apps/frontend/src/App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 1 (T004-T006)
3. **STOP and VALIDATE**: Last Payment date formatted, agency names displayed, Overpayment/Balance accurate
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + US1 → **MVP**: Accurate data display with formatted dates and agency names
2. Add US2 → Full record management (View, Edit, Print, Delete)
3. Add US3 → Frozen columns, paginated navigation
4. Add US4 → Responsive design, overflow handling
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With two developers:
1. Developer A: Phase 1 setup, Phase 2 (US1), Phase 3 (US2 new components)
2. Developer B: Phase 3 integration (T010/T011), Phase 4 (US3), Phase 5 (US4)
3. Developer A handles backend tests, Developer B handles frontend tests

---

## Notes

- T004 and T005 both modify `PensionersPage.tsx` — run in single session or sequential commits to avoid merge conflicts
- T010, T012, T014 also modify `PensionersPage.tsx` — each should be a separate focused commit
- All new components should follow existing code patterns (see `AgencyDeductionRepeater.tsx` and `OverpaymentComputationBreakdown.tsx` for style reference)
- No database migrations or schema changes required per research.md
- No new API endpoints required per contracts/README.md
- All financial values displayed in list must come from backend API per FR-004
