# Implementation Plan: Fix Pensioners List

**Branch**: `012-fix-pensioners-list` | **Date**: 2026-07-10 | **Spec**: spec.md

**Input**: Feature specification from `specs/012-fix-pensioners-list/spec.md`

## Summary

Redesign the Pensioners List page to fix 10 identified issues: incorrect data display (raw timestamps, incomplete agency info), computation errors (frontend recalculation of balance/overpayment), poor table layout (no responsive overflow, no frozen columns, cramped cells), and missing record management actions (View, Edit, Print, Delete). The fix ensures all displayed values come from the authoritative backend source with no frontend recalculation, adds a responsive table with horizontal scroll and frozen key columns, adds full CRUD actions per row, and implements a detailed View modal, Edit form, printable Pensioner Summary, and confirmation-based Delete.

**Research Complete** (Phase 0): Root cause analysis in `research.md`. All 10 issues investigated. No backend computation bugs found — issues are entirely frontend display and UX. Table is missing: date formatting, agency name display, responsive scroll wrapper, frozen columns, View action, Print action, proper Edit routing, confirmation dialog component.

**Design Complete** (Phase 1): Data model documented in `data-model.md`. API contracts documented in `contracts/README.md`. Validation guide in `quickstart.md`. No new API endpoints needed. No database schema changes required. All formatting handled on frontend.

## Technical Context

**Language/Version**: PHP 8.2+ (backend), TypeScript strict (frontend)

**Primary Dependencies**: Laravel 11.x (backend), React 19 + Vite (frontend), @tanstack/react-table (table library), zod (form validation), lucide-react (icons), axios 1.18.x (HTTP client)

**Storage**: MySQL 8.4 (primary), SQLite in-memory (tests)

**Testing**: Pest 4.x (backend), Vitest 4.1.x (frontend)

**Target Platform**: Web application (Laravel API + React SPA)

**Project Type**: Web application (monorepo with `apps/backend` + `apps/frontend`)

**Performance Goals**: Table renders <500ms for 100 records; search/filter/sort response <200ms p95; pagination transitions instant

**Constraints**: All financial values must come from backend (no frontend recalculation); existing API contract must be preserved for backward compatibility; responsive across 375px-1920px viewports

**Scale/Scope**: ~15 files modified across backend and frontend; ~1,500 lines of new/modified code

## Constitution Check

| Gate | Pre-Research | Post-Design | Notes |
|------|:---:|:---:|-------|
| PSR-12 / ESLint + Prettier | ✅ | ✅ | New files follow project patterns |
| PHPStan 6 / TypeScript strict | ✅ | ✅ | Use strict types throughout |
| Test suite passes | ✅ | ✅ | Write new tests for new endpoints/components |
| 80% backend / 70% frontend coverage | ✅ | ✅ | New code covered by new tests |
| WCAG 2.1 AA | ✅ | ✅ | Responsive table with accessible frozen columns |
| No dead code / debug artifacts | ✅ | ✅ | |
| API JSON envelope consistency | ✅ | ✅ | Maintain `{success, data, error}` |
| Sanctum + bcrypt auth | ✅ | ✅ | Auth mechanism unchanged |
| N+1 prevention | ✅ | ✅ | Eager load on index query |
| Mobile-first responsive | ✅ | ✅ | Horizontal scroll + responsive design |

*Pre-Research*: All gates passed. *Post-Design*: No new violations introduced. Design artifacts confirm no schema changes, no new API endpoints, and no auth changes.

## Project Structure

### Documentation (this feature)

```text
specs/012-fix-pensioners-list/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - root cause analysis
├── data-model.md        # Phase 1 output - entity and field analysis
├── quickstart.md        # Phase 1 output - validation guide
├── contracts/           # Phase 1 output - API contract notes
│   └── README.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Http/
│   │   ├── Resources/
│   │   │   └── PensionerResource.php       # Add last_payment_formatted, ensure all fields
│   │   └── Controllers/Api/
│   │       └── PensionerController.php     # Verify index returns all needed data
│   └── Models/
│       └── Pensioner.php                   # Verify balance/overpayment computed attributes
└── tests/
    └── Feature/Api/Pensioner/
        ├── PensionerListTest.php           # New tests for formatted dates, agency display
        └── PensionerViewTest.php           # New tests for show endpoint with all relations

apps/frontend/
├── src/
│   ├── pages/
│   │   ├── PensionersPage.tsx              # Major rewrite: responsive table, frozen columns, actions, formatting
│   │   ├── AddPensionerPage.tsx            # Minor: ensure it supports edit mode prepopulation
│   │   └── EditPensionerPage.tsx           # NEW: edit form reusing Add layout
│   ├── components/
│   │   └── pensioner/
│   │       ├── PensionerViewModal.tsx      # NEW: detailed view modal
│   │       └── PensionerPrintView.tsx      # NEW: printable summary component
│   ├── services/
│   │   └── pensioners.ts                   # Minor: add print endpoint if needed
│   └── lib/
│       └── financial-calculations.ts       # Add consistent date formatting utility
└── tests/
    ├── components/                         # NEW: tests for new components
    └── pages/                              # NEW: tests for updated page
```

**Structure Decision**: Monorepo with `apps/backend` + `apps/frontend`. All modifications respect existing conventions. New components created under existing directory patterns.

## Complexity Tracking

No constitution violations. All changes follow established patterns.

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Identify root causes for each of the 10 issues in the Pensioners List
- [x] Research task: Verify backend computation formulas match expected business rules
- [x] Research task: Audit frontend column definitions for proper field mappings
- [x] Research task: Review @tanstack/react-table frozen column API and responsive patterns
- [x] Research task: Define consistent date formatting approach

**Output**: `research.md` — Root cause analysis complete. All 10 issues traced to frontend display/UX (no backend computation bugs).

### Phase 1: Design & Contracts (±0 points)

- [x] Document data model analysis → `data-model.md`
- [x] Document API contracts → `contracts/README.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

**Output**: `data-model.md`, `contracts/README.md`, `quickstart.md`, updated AGENTS.md

### Phase 2: Implementation (Story Order: P1 -> P2 -> P3)

**Story 1 - View Accurate Pensioner Records (P1)**

*File 1*: `apps/frontend/src/pages/PensionersPage.tsx`
- Fix Issue 1: Add date formatting to `last_payment` column using a `formatDate` helper
- Fix Issue 2: Ensure `overpayment_total` is displayed exactly from API (already is, verify no frontend override)
- Fix Issue 3: Ensure `balance` is displayed exactly from API (already is, verify no frontend override)
- Fix Issue 5: Replace agency count with agency names in agencies column, add tooltip for full list
- Fix Issue 10: Remove any traces of frontend recalculation for displayed values

*File 2*: `apps/frontend/src/lib/financial-calculations.ts`
- Add `formatDisplayDate(dateString: string | null): string` helper that handles null, raw timestamps, and produces consistent output

**Story 2 - Manage Individual Records (P1)**

*File 3*: `apps/frontend/src/pages/PensionersPage.tsx`
- Add View action button (eye icon) that opens PensionerViewModal
- Fix Edit action: route to EditPensionerPage
- Add Print action button (printer icon) that opens PensionerPrintView in new window
- Replace `window.confirm` with proper confirmation Dialog component for Delete
- Add all missing action icons

*File 4*: `apps/frontend/src/components/pensioner/PensionerViewModal.tsx` (NEW)
- Modal showing: Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status
- Load data via `get(id)` API call for full relations
- Loading, error, empty states

*File 5*: `apps/frontend/src/pages/EditPensionerPage.tsx` (NEW)
- Reuse AddPensionerPage layout with edit mode
- Fetch existing data via `get(id)`, prepopulate form
- Submit via `update(id, payload)` API call
- Navigate back to list on success

*File 6*: `apps/frontend/src/components/pensioner/PensionerPrintView.tsx` (NEW)
- Printable component with: Header "AFP Pension Overpayment Monitoring System", Pensioner Details, Agency Summary, Financial Summary, Generated Date
- Use `window.print()` via useEffect on mount
- Print-specific CSS styles

*File 7*: `apps/frontend/src/App.tsx`
- Add route for `/pensioners/:id/edit` → EditPensionerPage
- Add route for `/pensioners/:id/view` → PensionerViewPage (or use modal instead)

*File 8*: `apps/backend/app/Http/Resources/PensionerResource.php`
- Ensure all fields from spec are in the API response (add any missing computed fields)
- Add `last_payment_formatted` field for convenience

**Story 3 - Navigate and Find Records Efficiently (P2)**

*File 9*: `apps/frontend/src/pages/PensionersPage.tsx`
- Fix Issue 8: Add frozen columns for Selection, Name, Serial Number, Actions using `sticky` CSS
- Add column visibility selector (optional dropdown)
- Improve pagination with page numbers (not just Previous/Next)

**Story 4 - Use the Table on Any Device (P3)**

*File 10*: `apps/frontend/src/pages/PensionersPage.tsx`
- Fix Issue 6: Wrap table in horizontal scroll container (`overflow-x-auto`)
- Fix Issue 9: Add responsive breakpoints for tablet/mobile
- Add text overflow handling: `text-ellipsis`, `whitespace-nowrap`, `overflow-hidden` with tooltips
- Add compact mode option

### Phase 3: Verification (±0 points)

1. Run `cd apps/backend && php artisan test` — all tests pass
2. Run `cd apps/backend && vendor/bin/phpstan analyse --level=6` — zero errors
3. Run `cd apps/backend && ./vendor/bin/pint` — no style violations
4. Run `cd apps/frontend && npm test` — all tests pass
5. Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles
6. Run `cd apps/frontend && npm run lint` — no lint violations

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/frontend/src/pages/PensionersPage.tsx` | Rewrite: date formatting, agency display, View/Print actions, frozen columns, responsive table, proper delete dialog | Edit |
| `apps/frontend/src/pages/EditPensionerPage.tsx` | New: edit form reusing Add layout | New |
| `apps/frontend/src/components/pensioner/PensionerViewModal.tsx` | New: detailed view modal | New |
| `apps/frontend/src/components/pensioner/PensionerPrintView.tsx` | New: printable summary component | New |
| `apps/frontend/src/lib/financial-calculations.ts` | Add: formatDisplayDate helper | Edit |
| `apps/frontend/src/App.tsx` | Add: edit route | Edit |
| `apps/backend/app/Http/Resources/PensionerResource.php` | Add: last_payment_formatted field | Edit |
| `AGENTS.md` | Update plan reference | Edit |
