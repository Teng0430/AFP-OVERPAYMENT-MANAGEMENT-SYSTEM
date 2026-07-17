# Implementation Plan: Redesign Pensioners List

**Branch**: `014-redesign-pensioners-list` | **Date**: 2026-07-10 | **Spec**: spec.md

**Input**: Feature specification from `specs/014-redesign-pensioners-list/spec.md`

## Summary

Redesign the Pensioners List page to fix critical data integrity bugs, improve table layout, and enhance record management. The most critical finding is a **backend computation bug** in `Pensioner.php:getOverpaymentTotalAttribute()` that uses name-based grouping (summing `overpayment_subtotal` across all pensioners with the same name) instead of returning the individual record's value. This bug inflates both `overpayment_total` and `balance` when multiple pensioners share names. All other issues are frontend display/UX improvements.

**Research Complete** (Phase 0): Root cause analysis in `research.md`. Critical backend bug identified in `overpayment_total` computation. Frontend issues include missing responsive scroll wrapper, alert dialog pattern for single-record delete, frozen columns, and improved pagination.

**Design Complete** (Phase 1): Data model documented in `data-model.md` with corrected computation formulas. API contracts unchanged. Validation guide in `quickstart.md`.

## Technical Context

**Language/Version**: PHP 8.2+ (backend), TypeScript strict (frontend)

**Primary Dependencies**: Laravel 12.x (backend), React 19 + Vite + @tanstack/react-table (frontend), lucide-react (icons), shadcn/ui components

**Storage**: MySQL 8.4 (primary), SQLite in-memory (tests)

**Testing**: Pest 3.x (backend), Vitest 4.1.x (frontend)

**Target Platform**: Web application (Laravel API + React SPA)

**Project Type**: Monorepo with `apps/backend` + `apps/frontend`

**Performance Goals**: Table renders <500ms for 100 records; search/filter/sort response <200ms p95; pagination transitions instant

**Constraints**: All financial values must come from backend (no frontend recalculation); existing API contract must be preserved; responsive across 375px-1920px viewports

**Scale/Scope**: ~10 files modified across backend and frontend; ~300 lines of new/modified code

## Constitution Check

| Gate | Pre-Research | Post-Design | Notes |
|------|:---:|:---:|-------|
| PSR-12 / ESLint + Prettier | ✅ | ✅ | New/modified files follow project patterns |
| PHPStan 6 / TypeScript strict | ✅ | ✅ | Use strict types throughout |
| Test suite passes | ✅ | ✅ | Fix existing tests for corrected `overpayment_total` |
| 80% backend / 70% frontend coverage | ✅ | ✅ | New code covered by tests |
| WCAG 2.1 AA | ✅ | ✅ | Frozen columns with accessible labels, responsive design |
| No dead code / debug artifacts | ✅ | ✅ | |
| API JSON envelope consistency | ✅ | ✅ | Maintain `{success, data, error}` |
| Sanctum + bcrypt auth | ✅ | ✅ | Auth mechanism unchanged |
| N+1 prevention | ✅ | ✅ | Eager loading already implemented |
| Mobile-first responsive | ✅ | ✅ | Horizontal scroll + responsive design |

*Pre-Research*: All gates passed. *Post-Design*: No new violations introduced. Backend bug fix changes `overpayment_total` computation to use individual record value instead of name-based grouping — no API contract change, no schema change.

## Project Structure

### Documentation (this feature)

```text
specs/014-redesign-pensioners-list/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - root cause analysis
├── data-model.md        # Phase 1 output - entity and field analysis
├── quickstart.md        # Phase 1 output - validation guide
├── contracts/
│   └── README.md        # Phase 1 output - API contract notes
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
apps/backend/
├── app/Models/
│   └── Pensioner.php                     # Fix getOverpaymentTotalAttribute()
└── tests/
    └── Feature/Api/Pensioner/
        ├── OverpaymentComputationTest.php # New tests for corrected computation
        └── PensionerListTest.php          # Verify list returns correct values

apps/frontend/
└── src/
    ├── pages/
    │   └── PensionersPage.tsx            # Fix: responsive scroll, sticky columns, AlertDialog pattern, pagination
    └── lib/
        └── financial-calculations.ts     # Update formatDisplayDate if needed
```

**Structure Decision**: Minimal changes. The core backend bug fix is in one file (`Pensioner.php`). Frontend changes are mostly in one file (`PensionersPage.tsx`).

## Complexity Tracking

No constitution violations. Bug fix in backend model attribute. Frontend improvements in existing page component.

## Implementation Plan

### Phase 0: Research & Analysis (±0 points)

- [x] Research task: Identify root causes for all 10 issues
- [x] Research task: Verify backend computation formulas — discovered name-based grouping bug in `getOverpaymentTotalAttribute()`
- [x] Research task: Audit frontend column definitions and data flow
- [x] Research task: Verify all action components exist and work (View, Edit, Print, Delete)
- [x] Research task: Review AlertDialog pattern for single-record delete

**Output**: `research.md` — Root cause analysis complete. One critical backend bug found. All other issues are frontend improvements.

### Phase 1: Design & Contracts (±0 points)

- [x] Document data model with corrected formulas → `data-model.md`
- [x] Document API contracts → `contracts/README.md`
- [x] Create validation guide → `quickstart.md`
- [x] Update AGENTS.md with plan reference

**Output**: `data-model.md`, `contracts/README.md`, `quickstart.md`, updated AGENTS.md

### Phase 2: Implementation (Story Order: P1 -> P2 -> P3)

**Story 1 - Fix Data Integrity (P1)**

*File 1*: `apps/backend/app/Models/Pensioner.php`
- Fix `getOverpaymentTotalAttribute()`: Change from `static::where('name', $this->name)->get()->sum(...)` to return `$this->overpayment_subtotal` (individual record value, no name grouping)
- Ensure `overpayment_total` uses the individual pensioner's computed subtotal
- Both `overpayment_total` and `balance` will automatically correct since `balance` uses `$this->overpayment_total - $this->amount_collected`

**Before**:
```php
public function getOverpaymentTotalAttribute(): float
{
    return (float) static::where('name', $this->name)
        ->get()
        ->sum(fn (self $p) => $p->overpayment_subtotal);
}
```

**After**:
```php
public function getOverpaymentTotalAttribute(): float
{
    return $this->overpayment_subtotal;
}
```

*File 2*: `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php`
- Add test: "overpayment_total matches individual record overpayment_subtotal, not name-based aggregate"
- Add test: "balance equals overpayment_total minus amount_collected"
- Add test: "pensioners with same name have independent overpayment_totals"

*File 3*: `apps/backend/tests/Feature/Api/Pensioner/PensionerListTest.php`
- Add test: "list response shows correct overpayment_total for each pensioner"
- Add test: "list response shows correct balance for each pensioner"

**Story 2 - Fix Frontend Table + Actions (P2)**

*File 4*: `apps/frontend/src/pages/PensionersPage.tsx`
- Fix Issue 1: Update `formatDisplayDate` usage or switch to `last_payment_formatted` from API
- Fix Issue 6: Wrap `<Table>` in `<div className="overflow-x-auto">` for horizontal scroll
- Fix Issue 7: Refactor AlertDialog for single-record delete — move confirmation dialog state to a single instance outside the table rows, or fix the `onClick` handler on AlertDialogTrigger
- Fix Issue 8:
  - Add sticky columns: Add `className="sticky left-0 bg-background z-10"` to Selection, Name, Serial Number column headers/cells; add `className="sticky right-0 bg-background z-10"` to Actions column
  - Add page number navigation between Previous/Next buttons
- Fix Issue 9: Make filter card responsive; ensure table has horizontal scroll at all viewports

*File 5*: `apps/frontend/src/lib/financial-calculations.ts`
- Update `formatDisplayDate` to use application's standard date format if needed (e.g., "Month DD, YYYY" → `toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })`)
- Or switch list page to use `last_payment_formatted` from API response

**Story 3 - Verification (P3)**

1. Run `cd apps/backend && php artisan test` — all tests pass (existing + new)
2. Run `cd apps/backend && vendor/bin/phpstan analyse --level=6` — zero errors
3. Run `cd apps/backend && ./vendor/bin/pint` — no style violations
4. Run `cd apps/frontend && npm test` — all tests pass
5. Run `cd apps/frontend && npx tsc --noEmit` — TypeScript compiles
6. Run `cd apps/frontend && npm run lint` — no lint violations
7. Manual validation per quickstart.md: date format, overpayment, balance, agencies, actions, responsiveness

## Files Changed

| File | Change | Type |
|------|--------|------|
| `apps/backend/app/Models/Pensioner.php` | Fix `getOverpaymentTotalAttribute()` — remove name-based grouping | Edit |
| `apps/backend/tests/Feature/Api/Pensioner/OverpaymentComputationTest.php` | Add tests for corrected overpayment_total and balance | Edit |
| `apps/backend/tests/Feature/Api/Pensioner/PensionerListTest.php` | Add tests for list response data integrity | Edit |
| `apps/frontend/src/pages/PensionersPage.tsx` | Add responsive scroll wrapper, sticky columns, fix AlertDialog pattern, improve pagination | Edit |
| `apps/frontend/src/lib/financial-calculations.ts` | Update formatDisplayDate if needed | Edit |
| `AGENTS.md` | Update plan reference | Edit |
