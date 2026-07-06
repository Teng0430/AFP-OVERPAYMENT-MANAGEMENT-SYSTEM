# Implementation Plan: Pensioner Form & Overpayment Computation Update

**Branch**: `007-pensioner-form-overpayment-computation` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-pensioner-form-overpayment-computation/spec.md`

## Summary

Update the Add Pensioner form with new rank/agency dropdown values, dynamic agency deduction repeater (1-10 entries), new Last Payment date field, and replace "Fraction Days" label with "Fractional Days in Month". Implement an automated pension overpayment computation engine that derives Whole Months, Fractional Days, Total Days, Daily Pension Rate, and Overpayment Amount from Date of Death, Last Payment, and Monthly Pension inputs — using timezone-safe date arithmetic with leap year support.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), PHP 8.2+ (backend)

**Primary Dependencies**: Laravel 12 (backend), React 19 + react-hook-form + zod + shadcn/ui (frontend), @tanstack/react-table (pensioner list)

**Storage**: MySQL 8.x — updated `pensioners` table with new columns: `last_payment` (date), `agency_deductions` (JSON), `date_of_death` made required for new records

**Testing**: Pest 4.x (backend — in-memory SQLite), Vitest 4.x (frontend)

**Target Platform**: Web (desktop browser, responsive mobile-friendly)

**Project Type**: Full-stack web application (Laravel API + React SPA)

**Performance Goals**: Overpayment computations update within 500ms of any input change; form submission under 2s

**Constraints**: Backward compatible with existing pensioner records (old `agency_deduction` single value, no `last_payment`); all date arithmetic must be timezone-safe and correctly handle leap years and month lengths

**Scale/Scope**: ~10K pensioner records; form used by ~5-10 encoders daily

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status |
|------|------------|--------|
| I. Code Quality | PSR-12 (PHP), ESLint+Prettier (TS), PHPStan level 6, TS strict | ✅ Standard |
| II. Testing Standards | Pest with in-memory SQLite (backend), Vitest (frontend); 80% backend / 70% frontend coverage min | ✅ Standard |
| III. UX Consistency | shadcn/ui components, responsive, WCAG 2.1 AA | ✅ Standard |
| IV. Performance | API <200ms p95, bundle <500KB gzipped | ✅ Standard |
| V. Security & Integrity | Sanctum auth, input validation, no secrets committed | ✅ Standard |
| VI. Schema Changes | Migration scripts required; backward compat with existing records | ⚠️ Needs care — old `agency_deduction` must coexist with new `agency_deductions` JSON |

**Post-Design Re-evaluation**: All gates remain green. Schema change (VI) is handled via additive migration (new JSON column `agency_deductions`, new DATE column `last_payment`, old `agency_deduction` preserved). No constitutional violations introduced.

**Gates not violated.**

## Project Structure

### Documentation (this feature)

```text
specs/007-pensioner-form-overpayment-computation/
├── plan.md              # This file
├── research.md          # Phase 0 output — technical decisions
├── data-model.md        # Phase 1 output — entity design
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Models/
│   │   └── Pensioner.php              # [MODIFY] Add last_payment, agency_deductions (JSON)
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── PensionerController.php # [MODIFY] Handle new fields
│   │   ├── Requests/
│   │   │   ├── StorePensionerRequest.php   # [MODIFY] New validation rules
│   │   │   └── UpdatePensionerRequest.php  # [MODIFY] New validation rules
│   │   └── Resources/
│   │       └── PensionerResource.php   # [MODIFY] Include new fields
│   └── Services/
│       └── OverpaymentCalculationService.php # [REWRITE] New formula
├── database/
│   └── migrations/
│       └── [NEW] 2026_07_06_XXXXXX_update_pensioners_table.php
└── tests/
    └── Feature/
        └── Api/
            └── Pensioner/
                └── OverpaymentComputationTest.php  # [NEW]

apps/frontend/
├── src/
│   ├── types/
│   │   └── index.ts               # [MODIFY] New rank/agency constants, interfaces
│   ├── lib/
│   │   └── financial-calculations.ts  # [REWRITE] New computation engine
│   ├── services/
│   │   └── pensioners.ts          # [MODIFY] Support new fields
│   ├── pages/
│   │   └── AddPensionerPage.tsx   # [REWRITE] New form with repeater, auto-computation
│   └── components/
│       └── pensioner/             # [NEW] Shared form components (deduction repeater, computation display)
└── tests/
    └── lib/
        └── overpayment-computation.test.ts  # [NEW] Unit tests for computation
```

**Structure Decision**: Dual-project monorepo with `apps/backend` (Laravel API) and `apps/frontend` (React SPA). New/changed files are limited to the pensioner domain. Reused shadcn/ui components from existing library.

## Complexity Tracking

No constitution violations — feature fits within existing project structure.
