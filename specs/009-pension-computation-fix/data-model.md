# Data Model: Fix Pensioner Computation & Connection Handling

## Pensioner (Existing Entity — No Schema Changes)

No database migration required. All changes are computational (formula logic) and frontend display.

### Modified Computed Fields

| Field | Previous Formula | New Formula |
|-------|-----------------|-------------|
| `net_monthly_pension` | `max(0, monthly_pension - sum(all deductions.amount))` | `max(0, monthly_pension - sum(non-crediting deductions.amount))` |
| `total_non_crediting_deductions` | N/A (not exposed) | `sum(deductions where crediting_agency != true)` |

### Unchanged Fields

| Field | Type | Notes |
|-------|------|-------|
| `monthly_pension` | decimal | Gross monthly pension — unchanged |
| `agency_deductions` | JSON array | `[{agency_name, amount, crediting_agency}]` — unchanged structure |
| `crediting_agency_name` | varchar | Denormalized first deduction name — unchanged |
| `date_of_death` | date | Computation anchor — unchanged |
| `last_payment` | date | Computation endpoint — unchanged |
| `overpayment_total` | decimal | Gross pension overpayment — unchanged |
| `agency_overpayments` | computed | Per-agency overpayments — unchanged |
| `grand_total_overpayment` | computed | Sum of all components — unchanged |

### Validation Rules

| Rule | Previous | New |
|------|----------|-----|
| Deductions ≤ Gross | `sum(all deductions) > monthly_pension` | `sum(non-crediting deductions) > monthly_pension` |

### API Contract Changes

**Response `PensionerResource`** — Remove/rename:
- Remove the standalone `deductions` field from the summary section
- Add `total_non_crediting` field for the new Pension Summary display
- `net_monthly_pension` now reflects the new formula (only non-crediting deductions subtracted)
