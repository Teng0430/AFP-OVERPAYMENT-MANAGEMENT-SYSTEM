# Implementation Plan: Pensioners List UI & Actions

**Branch**: `015-pensioners-list-ui` | **Date**: 2026-07-10 | **Spec**: spec.md

**Input**: Feature specification from `specs/015-pensioners-list-ui/spec.md`

## Summary

Redesign the Pensioners List page to eliminate horizontal page-level scrolling, add a compact Actions dropdown menu (View, Edit, Print, Delete), improve responsive behavior across all viewports, optimize column widths, add sticky columns and headers, fix the missing Print route, wire up the toast notification system, and improve overall UX. All changes are frontend-only — no backend modifications are required.

**Research Complete** (Phase 0): Root cause analysis in `research.md`. The page-width issue stems from a fixed min-width on the Card container, flex-wrap not triggering on filter elements, and the table having no container-level overflow-x-auto wrapper. Actions are currently rendered as individual icon buttons consuming excessive horizontal space. Print route is missing. Toast system exists but is not wired to a visible Toaster component.

**Design Complete** (Phase 1): Data model documented in `data-model.md`. UI contracts in `contracts/README.md`. Validation guide in `quickstart.md`.

## Technical Context

**Language/Version**: TypeScript strict (React 19 + Vite)

**Primary Dependencies**: @tanstack/react-table (table), lucide-react (icons), shadcn/ui components (DropdownMenu, Dialog, AlertDialog, Badge, Button, Card, Select), react-router-dom (routing), use-toast hook (notifications)

**Storage**: None (frontend only — data from backend API)

**Testing**: Vitest 4.1.x

**Target Platform**: Web application (React SPA)

**Project Type**: Monorepo with `apps/frontend`

**Performance Goals**: Table renders <500ms for 100 records; dropdown menu opens <100ms; scroll interactions smooth at 60fps; filter changes respond in <200ms

**Constraints**: All pensioner data comes from existing backend API (no schema changes); existing API contract must be preserved; responsive across 375px-1920px viewports; sticky columns must work in Chrome, Edge, Firefox; no backend changes

**Scale/Scope**: ~8 files modified, all frontend; ~400 lines of new/modified code

## Constitution Check

| Gate | Pre-Research | Post-Design | Notes |
|------|:---:|:---:|-------|
| ESLint + Prettier | ✅ | ✅ | New/modified files follow project patterns |
| TypeScript strict | ✅ | ✅ | Use strict types throughout |
| Test suite passes | ✅ | ✅ | Existing tests continue to pass |
| WCAG 2.1 AA | ✅ | ✅ | Dropdown menu with keyboard nav, sticky columns with accessible labels, focus management |
| No dead code / debug artifacts | ✅ | ✅ | |
| API JSON envelope consistency | ✅ | ✅ | No API changes — data format unchanged |
| Sanctum + bcrypt auth | ✅ | ✅ | Auth mechanism unchanged |
| N+1 prevention | ✅ | ✅ | No new data fetching patterns |
| Mobile-first responsive | ✅ | ✅ | Card/expandable rows on mobile, stacked filters |

*Pre-Research*: All gates passed. *Post-Design*: No new violations introduced. All changes are frontend-only — no backend modifications, no API contract changes, no schema changes.

## Project Structure

### Documentation (this feature)

```text
specs/015-pensioners-list-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — root cause analysis
├── data-model.md        # Phase 1 output — entity and field analysis
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/
│   └── README.md        # Phase 1 output — UI contract notes
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
apps/frontend/src/
├── pages/
│   └── PensionersPage.tsx            # Main target — layout, actions menu, sticky columns, responsive filters
├── components/
│   ├── ui/
│   │   └── toaster.tsx               # NEW: Toaster component to render toast notifications
│   ├── pensioner/
│   │   ├── PensionerViewModal.tsx     # View modal (already exists, minor updates for completeness)
│   │   ├── PensionerPrintView.tsx     # Print view (already exists, add route)
│   │   └── PensionerActionsMenu.tsx   # NEW: Dropdown menu component for row actions
├── App.tsx                           # Add /pensioners/:id/print route
├── hooks/
│   └── use-toast.ts                  # Wire up Toaster (already exists, ensure export)
├── lib/
│   └── financial-calculations.ts     # Date formatting improvements if needed
```

## Complexity Tracking

No constitution violations. All changes are frontend-only. The most complex change is the PensionersPage.tsx refactor for layout, sticky columns, and the new Actions dropdown menu.

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Identify root cause of page-level horizontal scrolling
- [x] Research task: Audit current column widths and whitespace usage
- [x] Research task: Verify sticky column implementation and browser compatibility
- [x] Research task: Review existing Actions implementation (dropdown vs inline buttons)
- [x] Research task: Check routing for print view
- [x] Research task: Audit toast notification system

**Output**: `research.md` — Root cause analysis complete. Pure frontend layout issues identified. No backend bugs.

### Phase 1: Design & Contracts (±0 points)

- [x] Document data model → `data-model.md`
- [x] Document UI contracts → `contracts/README.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

**Output**: `data-model.md`, `contracts/README.md`, `quickstart.md`, updated AGENTS.md

### Phase 2: Implementation (Story Order: P1 -> P2 -> P3)

**Story 1 — Fix Layout & Responsiveness (P1)**

*File 1*: `apps/frontend/src/pages/PensionersPage.tsx`
- **Fix page-level horizontal scrolling**:
  - Replace fixed-width Card `min-w` with responsive layout using Tailwind's `w-full max-w-full`
  - Add `overflow-x-auto` container at the Card level for the table only (not page level)
  - Remove any hardcoded widths on parent containers
- **Fix filter layout**:
  - Change filter Card from `flex flex-wrap items-end gap-3` to a responsive grid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3`
  - Remove fixed pixel widths on filter inputs (use `w-full` instead of `w-[140px]` etc.)
  - Ensure Apply button spans full width on mobile, auto-width on desktop
- **Optimize column widths**:
  - Replace `whitespace-nowrap` with `whitespace-normal` on text columns that need wrapping
  - Set appropriate `max-w` values for each column based on data type
  - Use `min-w` for columns that must stay visible (name, serial_number, actions)
  - Add `className="truncate"` with `title` attribute for cells with truncation
- **Improve sticky columns**:
  - Add `z-20` for sticky header to ensure it stays above sticky columns
  - Add box-shadow to sticky columns (`shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]` for left, `shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]` for right)
  - Add `bg-background` to sticky cells to prevent content show-through on scroll
- **Responsive table on mobile**:
  - For viewports < 768px, render the table as a card layout with labeled rows
  - Each pensioner card shows key fields (Name, Serial #, Status, Balance) and the Actions menu
  - Use `useMediaQuery` or Tailwind's `hidden md:table` / `block md:hidden` approach

*File 2*: `apps/frontend/src/lib/financial-calculations.ts`
- Ensure `formatDisplayDate` outputs "Mar 31, 2026" format (short month abbreviation)
- Current implementation uses `toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` which gives "March 31, 2026" — update to short month: `month: 'short'`

**Story 2 — Add Actions Menu & Complete Record Management (P1)**

*File 3*: `apps/frontend/src/components/pensioner/PensionerActionsMenu.tsx` (NEW)
- Create a new `PensionerActionsMenu` component using shadcn/ui `DropdownMenu`
- Props: `pensioner: Pensioner, onView, onEdit, onPrint, onDelete`
- Menu items:
  - **View** (Eye icon): Calls `onView(pensioner.id)`
  - **Edit** (Pencil icon): Calls `onEdit(pensioner.id)` — navigates to edit page
  - **Print** (Printer icon): Calls `onPrint(pensioner.id)` — opens print view
  - **Delete** (Trash2 icon): Calls `onDelete(pensioner.id)` — opens confirmation dialog
- Keyboard navigation: Arrow keys to navigate, Enter to select, Escape to close
- Accessible ARIA labels on all items
- The trigger is a `MoreHorizontal` (three-dot) icon button

*File 4*: `apps/frontend/src/pages/PensionersPage.tsx`
- Replace the inline action buttons (Eye, Pencil, Printer, Trash2) with the new `PensionerActionsMenu` component
- Pass the same handlers: `handleView`, `handleEdit`, `handlePrint`, `initiateDelete`
- Remove the individual icon buttons from the actions column cell renderer

*File 5*: `apps/frontend/src/App.tsx`
- Add route: `<Route path="pensioners/:id/print" element={<PensionerPrintView />} />`
- Wrap in React.lazy for consistent code-splitting
- Add page title support for the print view

*File 6*: `apps/frontend/src/components/pensioner/PensionerViewModal.tsx`
- Review and enhance the View modal sections:
  - Personal Information
  - Pension Details
  - Agency Information
  - Monthly Pension
  - Overpayment Details
  - Collection History
  - Balance
  - Status
  - Recovery Timeline
  - Supporting Documents (if available)
  - Audit Information (created_at, updated_at, created_by)
- Add missing sections (Recovery Timeline, Supporting Documents, Audit Information)
- Ensure all fields listed in FR-011 are displayed

*File 7*: `apps/frontend/src/components/pensioner/PensionerPrintView.tsx`
- Accept pensioner ID from URL params (react-router)
- Ensure all sections from FR-013 are present:
  - AFP Pension Overpayment Monitoring System header
  - Pensioner Information
  - Agency Summary
  - Monthly Pension
  - Overpayment
  - Amount Collected
  - Remaining Balance
  - Status
  - Date Printed
- Ensure CSS `@media print` styles produce proper PDF layout
- Auto-trigger `window.print()` on load

**Story 3 — UX Enhancements & Verification (P2)**

*File 8*: `apps/frontend/src/components/ui/toaster.tsx` (NEW)
- Create a Toaster component that renders toast notifications using the existing `use-toast` hook
- Position: bottom-right corner
- Support `default` (success/info) and `destructive` (error) variants
- Auto-dismiss after 5 seconds
- Manual dismiss button

*File 9*: `apps/frontend/src/pages/PensionersPage.tsx`
- Wire up toast notifications:
  - Success toast after successful edit redirect (via navigation state or callback)
  - Success toast after successful deletion
  - Error toast on failed delete (blocked by related records)
  - Error toast on network failures
  - Loading state indicator during data fetch
- Add empty state component when no pensioners match filters
- Add hover effects on table rows: `hover:bg-muted/50`
- Add focus styles on action menu items for accessibility

*File 10*: `apps/frontend/src/App.tsx`
- Add `<Toaster />` component inside the main layout to render toast notifications globally

**Verification (Final)**

1. Run `cd apps/frontend && npm test` — all tests pass
2. Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles
3. Run `cd apps/frontend && npm run lint` — no lint violations
4. Run `cd apps/frontend && npm run build` — production build succeeds
5. Manual validation per quickstart.md: layout, responsiveness, actions, print, delete, filters

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/frontend/src/pages/PensionersPage.tsx` | Fix layout horizontal scroll, responsive filters, optimize column widths, replace inline actions with dropdown, wire toasts, add hover effects, mobile card layout | Edit |
| `apps/frontend/src/components/pensioner/PensionerActionsMenu.tsx` | NEW: Dropdown menu for View, Edit, Print, Delete | Create |
| `apps/frontend/src/components/ui/toaster.tsx` | NEW: Toast notification renderer | Create |
| `apps/frontend/src/components/pensioner/PensionerViewModal.tsx` | Add missing sections (Recovery Timeline, Supporting Documents, Audit Information) | Edit |
| `apps/frontend/src/components/pensioner/PensionerPrintView.tsx` | Ensure all FR-013 sections present, use URL params | Edit |
| `apps/frontend/src/lib/financial-calculations.ts` | Update date format to short month (e.g., "Mar 31, 2026") | Edit |
| `apps/frontend/src/App.tsx` | Add print route, add Toaster component | Edit |
| `AGENTS.md` | Update plan reference | Edit |
