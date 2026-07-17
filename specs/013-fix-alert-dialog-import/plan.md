# Implementation Plan: Fix Alert Dialog Import Error

**Branch**: `013-fix-alert-dialog-import` | **Date**: 2026-07-10 | **Spec**: spec.md

**Input**: Feature specification from `specs/013-fix-alert-dialog-import/spec.md`

## Summary

The Pensioners page fails to load because `PensionersPage.tsx` imports from `@/components/ui/alert-dialog` but the file does not exist. The Radix primitive (`@radix-ui/react-alert-dialog`) is already installed. The fix is to create the missing component file following existing `dialog.tsx` conventions. No alias, config, or dependency changes are needed.

**Research Complete** (Phase 0): Root cause analysis in `research.md`. The missing file `src/components/ui/alert-dialog.tsx` is the sole cause. All path aliases are correctly configured, the Radix dependency is installed, and no other files need modification.

**Design Complete** (Phase 1): Data model documented in `data-model.md`. No new API endpoints, database changes, or external interfaces required.

## Technical Context

**Language/Version**: TypeScript strict (React 19)

**Primary Dependencies**: `@radix-ui/react-alert-dialog` ^1.1.19 (already installed), `clsx` + `tailwind-merge` via `cn()` utility

**Testing**: Vitest 4.x (frontend) — verify component renders

**Target Platform**: Web application (React SPA)

**Project Type**: Monorepo with `apps/backend` + `apps/frontend`

**Performance Goals**: Alert dialog renders in <50ms; no impact on page load time

**Constraints**: Must follow shadcn/ui pattern matching existing `dialog.tsx`; all 9 imported sub-components must be present and functional

**Scale/Scope**: 1 new UI component file (~90 lines); no other file changes

## Constitution Check

| Gate | Pre-Research | Post-Design | Notes |
|------|:---:|:---:|-------|
| ESLint + Prettier | ✅ | ✅ | Follows existing component patterns |
| TypeScript strict | ✅ | ✅ | Proper types from Radix primitives |
| Test suite passes | ✅ | ✅ | Existing tests unaffected |
| WCAG 2.1 AA | ✅ | ✅ | Radix AlertDialog provides ARIA alertdialog role |
| No dead code / debug artifacts | ✅ | ✅ | |
| Mobile-first responsive | ✅ | ✅ | Modal dialog pattern already responsive |

No constitution violations. New component follows established shadcn/ui patterns.

## Project Structure

### Documentation (this feature)

```text
specs/013-fix-alert-dialog-import/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - root cause analysis
├── data-model.md        # Phase 1 output - component API specification
├── quickstart.md        # Phase 1 output - validation guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
apps/frontend/src/components/ui/
└── alert-dialog.tsx     # NEW: Alert Dialog component (shadcn/ui pattern)
```

**Structure Decision**: Single new file follows the existing `src/components/ui/` convention. No imports need changing — the component file creates the resolution target for the existing import.

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Identify why `@/components/ui/alert-dialog` fails to resolve
- [x] Research task: Verify path alias configuration (tsconfig.app.json, vite.config.ts)
- [x] Research task: Verify `@radix-ui/react-alert-dialog` dependency is installed
- [x] Research task: Analyze `dialog.tsx` as reference pattern
- [x] Research task: Audit all AlertDialog imports in PensionersPage.tsx for usage

**Output**: `research.md` — Missing component file is the sole root cause.

### Phase 1: Design & Contracts (±0 points)

- [x] Document component API → `data-model.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

### Phase 2: Implementation

**Story 1 - Create Alert Dialog Component (P1)**

*File 1*: `apps/frontend/src/components/ui/alert-dialog.tsx` (NEW, ~90 lines)
- Import `@radix-ui/react-alert-dialog` primitives
- Create `AlertDialog` = `AlertDialogPrimitive.Root`
- Create `AlertDialogTrigger` = `AlertDialogPrimitive.Trigger`
- Create `AlertDialogCancel` = `AlertDialogPrimitive.Cancel`
- Create `AlertDialogAction` = `AlertDialogPrimitive.Action`
- Create `AlertDialogContent` with overlay and content wrapper (no close X button — alert dialog closes via Cancel/Action)
- Create `AlertDialogHeader` (flex-col, space-y-1.5, text-center sm:text-left)
- Create `AlertDialogTitle` wrapping `AlertDialogPrimitive.Title`
- Create `AlertDialogDescription` wrapping `AlertDialogPrimitive.Description`
- Create `AlertDialogFooter` (flex-col-reverse sm:flex-row)
- Export all components

### Phase 3: Verification

1. Run `cd apps/frontend && npm run build` — builds successfully with no module resolution errors
2. Run `cd apps/frontend && npm run dev` — no import resolution errors
3. Run `cd apps/frontend && npx tsc --noEmit` — zero type errors
4. Run `cd apps/frontend && npm run lint` — no lint violations

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/frontend/src/components/ui/alert-dialog.tsx` | New Alert Dialog component following dialog.tsx pattern | New |
