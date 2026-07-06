# Implementation Plan: Fix Add Pensioner & Multi-Component Overpayment Computation

**Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-fix-pensioner-form/spec.md`

## Summary

Fix the Add Pensioner form submission failure (generic "Unable to connect" error caused by payload mismatch), implement the crediting agency business rule where the first agency entry is the net pension depository, and refactor the overpayment computation into a multi-component model: Net Pension Overpayment (on Net Monthly Pension) plus independent per-agency overpayments, summed into a Grand Total Overpayment.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), PHP 8.2+ (backend)

**Primary Dependencies**: Laravel 12 (backend), React 19 + react-hook-form + zod + shadcn/ui (frontend)

**Storage**: MySQL 8.x — new column `crediting_agency_name` on `pensioners` table; `agency_deductions` JSON structure updated to include `crediting_agency` boolean per entry

**Testing**: Pest 4.x (backend — in-memory SQLite), Vitest 4.x (frontend)

**Target Platform**: Web (desktop browser)

**Project Type**: Full-stack web application (Laravel API + React SPA)

**Performance Goals**: All computed values update within 500ms of any input change; form submission under 2s

**Constraints**: Backward compatible with existing records; existing `agency_deduction` single-value column preserved; all date arithmetic timezone-safe with leap year support

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
| VI. Schema Changes | Migration scripts required; backward compat with existing records | ⚠️ Needs care — additive migration (new column `crediting_agency_name`, no destructive changes) |
| VII. Payload Alignment | Frontend must send snake_case to match backend form requests | ⚠️ Needs care — fix is the root cause of the "Unable to connect" error |

**Post-Design Re-evaluation**: All gates remain green. Schema change (VI) is handled via additive migration. Payload alignment (VII) requires frontend serialization fix. No constitutional violations introduced.

**Gates not violated.**

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-pensioner-form/
├── plan.md              # This file
├── research.md          # Phase 0 — technical decisions
├── data-model.md        # Phase 1 — entity design
├── quickstart.md        # Phase 1 — validation guide
├── contracts/           # Phase 1 — API contracts
│   └── README.md
└── tasks.md             # Phase 2 — (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Models/
│   │   └── Pensioner.php              # [MODIFY] Add crediting_agency_name, update casts & accessors
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── PensionerController.php # [MODIFY] Compute all components, handle crediting agency
│   │   ├── Requests/
│   │   │   ├── StorePensionerRequest.php   # [MODIFY] Validate crediting_agency, net pension ≥ 0
│   │   │   └── UpdatePensionerRequest.php  # [MODIFY] Same validation
│   │   └── Resources/
│   │       └── PensionerResource.php   # [MODIFY] Include new computed fields
│   └── Services/
│       └── OverpaymentCalculationService.php # [MODIFY] Add multi-component methods
├── database/
│   └── migrations/
│       └── [NEW] 2026_07_06_XXXXXX_add_crediting_agency_to_pensioners.php
└── tests/
    └── Feature/
        └── Api/
            └── Pensioner/
                ├── OverpaymentComputationTest.php  # [MODIFY] Add multi-component tests
                └── PensionerValidationTest.php     # [MODIFY] Add crediting agency validation tests

apps/frontend/
├── src/
│   ├── types/
│   │   └── index.ts               # [MODIFY] Add AgencyDeduction.creditingAgency, new interfaces
│   ├── lib/
│   │   └── financial-calculations.ts  # [MODIFY] Add multi-component compute functions
│   ├── services/
│   │   └── pensioners.ts          # [MODIFY] Fix payload structure (snake_case) + new fields
│   ├── pages/
│   │   ├── AddPensionerPage.tsx   # [MODIFY] Fix submission, add crediting agency, multi-component display
│   │   └── PensionersPage.tsx     # [MODIFY] Show crediting agency column
│   ├── components/
│   │   └── pensioner/
│   │       ├── AgencyDeductionRepeater.tsx         # [MODIFY] Add reordering, crediting badge
│   │       └── OverpaymentComputationBreakdown.tsx # [REWRITE] Multi-component breakdown
│   └── hooks/
│       └── usePensionerForm.ts    # [NEW] Extract form logic for testability
└── tests/
    ├── lib/
    │   ├── overpayment-computation.test.ts  # [MODIFY] Add multi-component tests
    │   └── agency-deductions.test.ts        # [MODIFY] Add crediting agency tests
    └── pages/
        └── AddPensionerPage.test.ts         # [NEW] Form submission tests
```

**Structure Decision**: Dual-project monorepo with `apps/backend` (Laravel API) and `apps/frontend` (React SPA). Changes are focused on the pensioner domain with minimal cross-cutting changes.

## Complexity Tracking

| Component | Change Type | Complexity | Risk |
|-----------|-------------|------------|------|
| Backend migration | New column | Low | Low — additive only |
| Pensioner model | Modify | Medium | Low — new accessors, no BC breaks |
| OverpaymentCalculationService | Modify | Medium | Low — existing methods kept, new methods added |
| PensionerController | Modify | Low | Low — orchestration only |
| StorePensionerRequest | Modify | Low | Low — new validation rules |
| Frontend financial-calculations | Modify | Medium | Medium — new multi-component functions must match backend |
| Frontend API service | Modify | Low | Medium — fixing payload is the critical path |
| AddPensionerPage | Modify | High | Medium — multiple new features merged |
| AgencyDeductionRepeater | Modify | Medium | Low — reordering feature |
| OverpaymentComputationBreakdown | Rewrite | Medium | Medium — new multi-component layout |
| Tests (backend + frontend) | Add/Modify | Medium | Medium — must cover all new scenarios |

## Research Artifacts

- `research.md` — Technical decisions for crediting agency storage, multi-component computation, reordering
- `data-model.md` — Updated entity definition with new column and JSON structure
- `contracts/README.md` — API request/response contracts with snake_case payload alignment
- `quickstart.md` — Validation scenarios and test commands
