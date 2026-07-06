# Data Model: Fix Add Pensioner & Multi-Component Overpayment Computation

## Entity: Pensioner

**Table**: `pensioners` (existing, modified)

### New Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `crediting_agency_name` | `VARCHAR(50)` | Yes | `null` | The agency name of the first agency entry (crediting agency). Denormalized for fast querying without JSON extraction. |

### Modified Columns

| Column | Change | Description |
|--------|--------|-------------|
| `agency_deductions` (JSON) | Structure updated | Each entry now includes `crediting_agency` boolean. See structure below. |
| `agency_deduction` (DECIMAL) | Unchanged | Kept for backward compatibility with old records. Populated from first deduction entry for new records. |

### Existing Key Columns (unchanged)

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT PK | Auto-increment |
| `rank` | VARCHAR(20) | Military rank abbreviation |
| `name` | VARCHAR(255) | Full name |
| `serial_number` | VARCHAR(50) | AFP serial number |
| `account_number` | VARCHAR(50) | Bank account number (nullable) |
| `date_of_death` | DATE | Date of death or due date (computation anchor) |
| `last_payment` | DATE | Last month pension was received |
| `cause_of_stoppage` | VARCHAR(255) | Reason for stoppage |
| `agency_name` | VARCHAR(50) | Primary agency name (legacy) |
| `monthly_pension` | DECIMAL(12,2) | Gross monthly pension amount |
| `fractional_days` | DECIMAL(5,3) | Computed fractional days |
| `whole_months` | INT | Computed whole months |
| `amount_collected` | DECIMAL(12,2) | Amount already collected |
| `date_collected` | DATE | Date of last collection (nullable) |
| `status` | VARCHAR(20) | Recovery status |

### `agency_deductions` JSON Structure

```json
[
  {
    "agency_name": "LBP",
    "amount": 2000.00,
    "crediting_agency": true
  },
  {
    "agency_name": "ALIP",
    "amount": 10000.00,
    "crediting_agency": false
  },
  {
    "agency_name": "PVB",
    "amount": 5000.00,
    "crediting_agency": false
  }
]
```

### Computed Accessors (Pensioner model)

| Accessor | Type | Formula |
|----------|------|---------|
| `net_monthly_pension` | float | `monthly_pension - sum(agency_deductions[*].amount)` |
| `start_date` | string | `date_of_death + 1 day` |
| `end_date` | string | `last day of last_payment month` |
| `whole_months` | int | `diffInMonths(start_date, end_date)` |
| `fractional_days` | int | `days between (start_date + whole_months) and end_date` |
| `daily_rate` | float | `monthly_amount / daysInMonth(start_date)` |
| `net_pension_overpayment` | float | `net_monthly_pension × whole_months + net_monthly_pension / daysInMonth(start_date) × fractional_days` |
| `agency_overpayments` | array | Map each deduction: `amount × whole_months + amount / daysInMonth(start_date) × fractional_days` |
| `grand_total_overpayment` | float | `net_pension_overpayment + sum(agency_overpayments)` |

### Entity Relationships

```
Pensioner N ── 1 UploadBatch (upload_batch_id)
Pensioner N ── 1 User (created_by)
Pensioner 1 ── N RecoveryInstallment
Pensioner 1 ── N Collection
```

### Validation Rules

| Field | Rule |
|-------|------|
| `date_of_death` | Required for new records. Must be a valid date. |
| `last_payment` | Required for new records. Must be `after_or_equal:date_of_death`. |
| `monthly_pension` | Required. Must be `gt:0`. |
| `agency_deductions` | Optional array. Max 10 entries. |
| `agency_deductions.*.agency_name` | Required per entry. Must be a valid agency from the predefined list. |
| `agency_deductions.*.amount` | Required per entry. Must be `gte:0`. |
| `crediting_agency_name` | Computed on save. Must match `agency_deductions[0].agency_name`. |
| Net pension check | Total deductions must not exceed gross monthly pension. |

### Edge Cases

- **Zero deductions**: `agency_deductions` is an empty array. Net pension = gross pension.
- **Single deduction**: That agency is both crediting agency and the only deduction.
- **Reordered rows**: The crediting agency flag stays with the original first entry. The `crediting_agency_name` column always reflects the actual first entry at submission time.
- **Old records without `agency_deductions`**: Treated as empty array. Backward compatible.
