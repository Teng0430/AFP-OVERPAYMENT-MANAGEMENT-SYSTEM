# Implementation Plan: Update Computation Logic for Breakdown and Summary

**Branch**: `010-update-computation-logic` | **Date**: 2026-07-07 | **Spec**: spec.md

**Input**: Feature specification from `specs/010-update-computation-logic/spec.md`

## Summary

Update the Computation Breakdown display to ensure Total Agency correctly excludes "Crediting Agency" (already implemented — verification only), and simplify the Final Summary to show only Grand Total Overpayment (remove Net Pension Overpayment and Total Agency Overpayments rows from the frontend component).

## Technical Context

**Language/Version**: PHP 8.2+ (backend), TypeScript strict (frontend)

**Primary Dependencies**: Laravel 12.x (backend), React 19 + Vite (frontend)

**Storage**: MySQL 8.4 (primary), SQLite in-memory (tests)

**Testing**: Pest 4.x (backend), Vitest 4.1.x (frontend)

**Target Platform**: Web application (Laravel API + React SPA)

**Project Type**: Web application (monorepo with `apps/backend` + `apps/frontend`)

**Performance Goals**: No performance impact — change is display-only

**Constraints**: No new dependencies, no schema changes, no API changes

**Scale/Scope**: Single frontend component change (`OverpaymentComputationBreakdown.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| PSR-12 / ESLint + Prettier | ✅ No new code — existing conventions followed | No new files to style-check |
| PHPStan 6 / TypeScript strict | ✅ No new types or logic errors introduced | No backend changes |
| Test suite passes | ✅ All existing tests continue to pass | No computation logic changed |
| 80% backend / 70% frontend coverage | ✅ No impact | Coverage unaffected |
| WCAG 2.1 AA | ✅ Existing component maintains accessibility | No structural DOM changes |
| No dead code / debug artifacts | ✅ | Only removes display lines |
| API JSON envelope consistency | ✅ | No API changes |
| Database index requirements | ✅ | No schema changes |
| N+1 query prevention | ✅ | No query changes |

## Project Structure

### Documentation (this feature)

```text
specs/010-update-computation-logic/
├── plan.md              # This file
├── research.md          # Phase 0 — research findings
├── data-model.md        # Phase 1 — no data model changes
├── quickstart.md        # Phase 1 — validation guide
├── contracts/           # Phase 1 — API contract notes
│   └── README.md
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

Only one file is modified:

```text
apps/frontend/src/components/pensioner/
└── OverpaymentComputationBreakdown.tsx  # Final Summary: remove 2 rows, keep 1
```

**Structure Decision**: Single frontend component modification. No new files. No backend changes.

## Complexity Tracking

No constitution violations. Complexity is minimal (single component edit).

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Analyze existing computation logic for Total Agency and Net Monthly Pension
- [x] Research task: Verify Total Agency correctly excludes "Crediting Agency"
- [x] Research task: Verify Net Monthly Pension formula matches spec
- [x] Research task: Identify exact lines in OverpaymentComputationBreakdown.tsx for Final Summary display change

**Output**: `research.md`

### Phase 1: Design & Contracts (±0 points)

- [x] Confirm no data model changes needed → `data-model.md`
- [x] Document API contract status → `contracts/README.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

**Output**: `data-model.md`, `contracts/README.md`, `quickstart.md`, updated AGENTS.md

### Phase 2: Implementation (1 point)

**File**: `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx`

**Changes**:

1. Remove the "Net Pension Overpayment" row from the Final Summary section (lines 98-101)
2. Remove the "Total Agency Overpayments" row from the Final Summary section (lines 102-105)
3. Keep the "Grand Total Overpayment" row (lines 106-109)

Additionally, the local `totalAgencyOverpayments` variable (line 15) is no longer used and should be removed to satisfy TypeScript strict mode:

```
- const totalAgencyOverpayments = breakdown.agencyOverpayments.reduce((s, a) => s + a.overpayment, 0);
```

**Result**: The Final Summary section (section D) will display only:

```
Final Summary
  Grand Total Overpayment    ₱XX,XXX.XX
```

### Phase 3: Verification (±0 points)

1. Run `cd apps/frontend && npm test` — all existing tests pass
2. Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles cleanly
3. Run `cd apps/frontend && npm run lint` — no lint violations
4. Run `cd apps/backend && php artisan test` — all backend tests pass
5. Manual validation per quickstart.md scenarios

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/frontend/src/components/pensioner/OverpaymentComputationBreakdown.tsx` | Remove 2 Final Summary rows + unused variable | Edit |
| `AGENTS.md` | Update plan reference from 009 to 010 | Edit |
