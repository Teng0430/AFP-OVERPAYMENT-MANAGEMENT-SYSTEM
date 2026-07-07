# Implementation Plan: Fix Pensioner Computation & Connection Handling

**Branch**: `` | **Date**: 2026-07-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-pension-computation-fix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Update the crediting agency amount to auto-compute as Gross Monthly Pension minus only non-crediting agency deductions (not all deductions), simplify the Pension Summary to three rows (Gross, Total Agency, Net), remove the "Deductions" field, and fix the frontend error handling so that "Unable to connect" only appears for actual network failures — not server errors, validation errors, or API misconfigurations.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), PHP 8.2+ (backend)

**Primary Dependencies**: Laravel 12 (backend), React 19 + react-hook-form + zod + shadcn/ui (frontend), axios 1.18.x (HTTP client)

**Storage**: MySQL 8.x — no schema changes required. Computation is formula-based (no new columns).

**Testing**: Pest 4.x (backend — in-memory SQLite), Vitest 4.x (frontend)

**Target Platform**: Web (desktop browser)

**Project Type**: Full-stack web application (Laravel API + React SPA)

**Performance Goals**: All computed values update within 500ms of any input change; form submission under 2s

**Constraints**: Backward compatible with existing records; existing `net_monthly_pension` computed value will change for records with crediting-agency deductions (previously all deductions were subtracted, now only non-crediting ones); existing error handling in `api.ts` already distinguishes some error types but the "Unable to connect" message shows on any network error without distinguishing CORS/configuration issues

**Scale/Scope**: ~10K pensioner records; form used by ~5-10 encoders daily

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status |
|------|------------|--------|
| I. Code Quality | PSR-12 (PHP), ESLint+Prettier (TS), PHPStan level 6, TS strict | ✅ Standard |
| II. Testing Standards | Pest with in-memory SQLite (backend), Vitest (frontend); 80% backend / 70% frontend coverage min | ✅ Standard |
| III. UX Consistency | shadcn/ui components, responsive, WCAG 2.1 AA | ✅ Standard |
| IV. Performance | API <200ms p95, bundle <500KB gzipped | ✅ Standard |
| V. Security & Data Integrity | Sanctum auth, input validation, no secrets committed | ✅ Standard |
| VI. Schema Changes | Migration scripts required; backward compat with existing records | ✅ No schema changes needed |
| VII. Payload Alignment | Frontend must send snake_case to match backend form requests | ✅ Already aligned from 008 |

## Project Structure

### Documentation (this feature)

```text
specs/009-pension-computation-fix/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Models/
│   │   └── Pensioner.php              # [MODIFY] net_monthly_pension accessor: only subtract non-crediting deductions
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── PensionerController.php # [MODIFY] computeAndMergeOverpayment: only non-crediting deductions for net
│   │   ├── Requests/
│   │   │   ├── StorePensionerRequest.php   # [MODIFY] after() validation: check non-crediting deductions ≤ gross
│   │   │   └── UpdatePensionerRequest.php  # [MODIFY] Same validation update
│   │   └── Resources/
│   │       └── PensionerResource.php   # [MODIFY] Remove "deductions" from summary, add total_non_crediting
│   └── Services/
│       └── OverpaymentCalculationService.php # [MODIFY] netMonthlyPension: exclude crediting agency deduction
├── routes/
│   └── api.php                 # [NO CHANGE]
├── config/
│   └── cors.php                # [VERIFY] CORS origins include frontend dev/prod URLs
└── tests/
    └── Feature/
        └── Api/
            └── Pensioner/
                ├── OverpaymentComputationTest.php  # [MODIFY] Update expected values for new formula
                └── PensionerValidationTest.php     # [MODIFY] Test non-crediting deduction validation

apps/frontend/
├── src/
│   ├── types/
│   │   └── index.ts               # [MODIFY] Update interfaces if needed
│   ├── lib/
│   │   └── financial-calculations.ts  # [MODIFY] computeFullBreakdown: only non-crediting deductions for net
│   ├── services/
│   │   ├── pensioners.ts          # [NO CHANGE] Payload structure already correct
│   │   └── api.ts                 # [MODIFY] Enhanced error interceptor: distinguish CORS, DNS, timeout from generic
│   ├── pages/
│   │   ├── AddPensionerPage.tsx   # [MODIFY] Remove "Deductions" from summary display, update computation display
│   │   └── PensionersPage.tsx     # [MODIFY] Update summary columns if "Deductions" was shown
│   └── components/
│       └── pensioner/
│           ├── AgencyDeductionRepeater.tsx         # [NO CHANGE or MINOR] Ensure crediting badge works
│           └── OverpaymentComputationBreakdown.tsx # [MODIFY] Remove "Deductions" section, adjust summary rows
└── tests/
    ├── lib/
    │   └── overpayment-computation.test.ts  # [MODIFY] Update expected values for new formula
    └── components/
        └── OverpaymentComputationBreakdown.test.ts # [MODIFY] Test new three-row summary
```

**Structure Decision**: Dual-project monorepo with `apps/backend` (Laravel API) and `apps/frontend` (React SPA). All changes are in the pensioner domain — no cross-cutting changes needed.

## Complexity Tracking

> All gates pass — no violations to justify.
