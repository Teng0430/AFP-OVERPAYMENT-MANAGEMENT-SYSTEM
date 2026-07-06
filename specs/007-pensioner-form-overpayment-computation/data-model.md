# Data Model: Pensioner Form & Overpayment Computation Update

## Entity: Pensioner

### Updated Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `rank` | string(20) | No | — | Searchable dropdown — new rank abbreviations list |
| `agency_name` | string(50) | No | — | Renamed to "Agency Name (AGDB's / FI's)" — new agency list |
| `agency_deduction` | decimal(12,2) | Yes | null | **Deprecated** — kept for backward compat; populated from first agency_deductions entry |
| `agency_deductions` | JSON | Yes | null | **[NEW]** Array of `{agency_name: string, amount: number}` — 1 to 10 entries |
| `date_of_death` | date | No (for new) | null | Now required for new records; existing nulls preserved |
| `last_payment` | date | No | — | **[NEW]** Required — last month pension was received |
| `monthly_pension` | decimal(12,2) | No | — | Must be > 0 |
| `fractional_days` | decimal(5,3) | No | 0 | Now **auto-computed** from date arithmetic (was manual input) |
| `whole_months` | integer | No | 0 | Now **auto-computed** from date arithmetic (was manual input) |
| `computation_of_days` | decimal(12,2) | computed | — | **Alias** → `fractional_days * daily_rate` (new formula) |
| `computation_in_months` | decimal(12,2) | computed | — | **Alias** → `whole_months * monthly_pension` (unchanged semantics) |
| `overpayment_subtotal` | decimal(12,2) | computed | — | **Alias** → `computation_of_days + computation_in_months` |
| `overpayment_total` | decimal(12,2) | computed | — | **Alias** → sum of all same-name pensioner subtotals |
| `balance` | decimal(12,2) | computed | — | **Alias** → `overpayment_total - amount_collected` |

### New Fields Summary

```
last_payment        DATE            NOT NULL
agency_deductions   JSON            NULL       [{"agency_name":"LBP","amount":500.00}, ...]
```

### Computed Fields (new formula)

```
start_date          = date_of_death + 1 day
end_date            = last day of last_payment month
whole_months        = number of complete calendar months between start_date and end_date
fractional_days     = remaining days after subtracting whole months
total_days          = end_date - start_date + 1
daily_rate          = monthly_pension / days_in_month(start_date)
overpayment_amount  = (whole_months * monthly_pension) + (fractional_days * daily_rate)
```

### Validation Rules

| Field | Rule |
|-------|------|
| `last_payment` | Required, date, cannot be earlier than `date_of_death` |
| `monthly_pension` | Required, numeric, > 0 |
| `agency_deductions` | JSON array, 1-10 items, each with agency_name (string, required) and amount (numeric, >= 0) |
| `rank` | Required, must be one of the new rank abbreviations |
| `agency_name` | Required, must be one of the new agency values |
| `date_of_death` | Required for new records, date |

## Entity: AgencyDeduction (embedded JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agency_name` | string | Yes | Must match one of the agency dropdown values |
| `amount` | number | Yes | Deduction amount (PHP), must be >= 0 |

### Maximum 10 entries per pensioner.
