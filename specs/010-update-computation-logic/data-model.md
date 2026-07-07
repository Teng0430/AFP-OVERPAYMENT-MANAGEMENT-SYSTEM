# Data Model: Update Computation Logic for Breakdown and Summary

## Entity Impact Assessment

| Entity | Change Required | Reason |
|--------|----------------|--------|
| `pensioners` table | None | No schema changes needed |
| `Pensioner` model | None | Existing accessors/generated attributes remain unchanged |
| `AgencyDeduction` (JSON) | None | Structure remains `{agency_name, amount, crediting_agency}` |
| `AgencyOverpaymentItem` (frontend type) | None | `{agency_name, amount, overpayment}` remains unchanged |
| `FullBreakdownResult` (frontend type) | None | `netMonthlyPension`, `totalNonCrediting`, `netPensionOverpayment`, `agencyOverpayments`, `grandTotalOverpayment` fields remain in the interface; only the display changes |

## Key Attributes (unchanged)

All existing fields in `pensioners` table remain unchanged:
- `monthly_pension` (decimal 12,2)
- `agency_deductions` (JSON — array of `{agency_name, amount, crediting_agency}`)
- `crediting_agency_name` (varchar 50, nullable)
- `net_monthly_pension`, `net_pension_overpayment`, `grand_total_overpayment` (computed accessors, not stored)

## Conclusion

**No database migrations or model changes are required.** This feature is purely a frontend display change affecting only the `OverpaymentComputationBreakdown.tsx` component.
