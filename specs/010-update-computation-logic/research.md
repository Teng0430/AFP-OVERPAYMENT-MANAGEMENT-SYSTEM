# Research: Update Computation Logic for Breakdown and Summary

## 1. Total Agency Computation

**Decision**: No change needed — already correctly excludes "Crediting Agency"

**Rationale**: Current implementation in both backend and frontend filters out `crediting_agency === true` entries:

- **Backend** (`OverpaymentCalculationService::netMonthlyPension()` line 142-143): Uses `array_filter($deductions, fn($d) => empty($d['crediting_agency']))` to exclude crediting agency from the sum.
- **Frontend** (`financial-calculations.ts::computeFullBreakdown()` line 176): `agencyDeductions.filter((d) => !d.crediting_agency)` — same logic.
- **PensionerResource** (`total_non_crediting` line 43-44): Same filter applied.

**Alternatives considered**: N/A — current implementation already matches the spec formula `SUM(Agency Overpayments) WHERE Agency Name != "Crediting Agency"`.

## 2. Net Monthly Pension Computation

**Decision**: No change needed — already correctly computed as `Gross Monthly Pension − Total Agency`

**Rationale**:
- **Backend** (line 148): `return round(max(0, $gross - $totalDeductions), 2)` where `$totalDeductions` = sum of non-crediting deduction amounts.
- **Frontend** (line 179): `Math.max(0, grossMonthlyPension - totalDeductions)`.

**Alternatives considered**: N/A.

## 3. Final Summary Display

**Decision**: Frontend-only changes to `OverpaymentComputationBreakdown.tsx`

**Changes needed**:
- Remove lines 98-101: the "Net Pension Overpayment" row
- Remove lines 102-105: the "Total Agency Overpayments" row
- Keep lines 106-109: the "Grand Total Overpayment" row

**Alternatives considered**: Could also stop computing `netPensionOverpayment` at the backend/API level, but the spec says to only change the display. Keeping the backend field available supports backward compatibility and potential future use.

## 4. API Contract

**Decision**: No API changes needed

The `PensionerResource` already returns `net_pension_overpayment`, `agency_overpayments`, `grand_total_overpayment`. The frontend simply stops displaying `netPensionOverpayment` and the summed `totalAgencyOverpayments` in the Final Summary section. The `grand_total_overpayment` field continues to be returned and displayed.

## 5. Test Impact

**Backend tests** (`OverpaymentComputationTest.php`):
- Tests for `netPensionOverpayment()`, `grandTotalOverpayment()`, and `agencyOverpayments()` should continue passing since no computation logic changes are needed.
- The test for response structure (`includes multi-component fields in pensioner response`) verifies the API returns `net_pension_overpayment` and `agency_overpayments` — these should remain in the API response.

**Frontend tests** (`overpayment-computation.test.ts`):
- Tests for `computeFullBreakdown()` should continue passing since the computation function doesn't change.
- No test changes needed unless there are component-level tests that verify the Final Summary display structure.
