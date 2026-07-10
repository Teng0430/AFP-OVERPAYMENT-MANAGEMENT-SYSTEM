# Data Model: Fix Pensioners List

**Date**: 2026-07-10 | **Plan**: plan.md | **Spec**: spec.md

## Entities

### Pensioner

The central entity representing an AFP pensioner with overpayment records.

| Field | Type | Source | Displayed In List | Notes |
|-------|------|--------|-------------------|-------|
| `id` | integer (PK) | DB auto-increment | No (used internally) | |
| `rank` | string (20) | DB column | Yes | From `RANK_OPTIONS` enum |
| `name` | string (255) | DB column | Yes | |
| `serial_number` | string (50) | DB column | Yes | Unique |
| `account_number` | string (50) | DB column | No (detail view) | Nullable |
| `date_of_death` | date | DB column | No (detail view) | Nullable |
| `last_payment` | date | DB column | **Yes (needs formatting)** | Nullable |
| `cause_of_stoppage` | string (255) | DB column | Yes | From `CAUSE_OF_STOPPAGE_OPTIONS` |
| `agency_name` | string (50) | DB column | Yes | Primary agency |
| `monthly_pension` | decimal(12,2) | DB column | Yes | |
| `agency_deduction` | decimal(12,2) | DB column | No (legacy) | Replaced by `agency_deductions` |
| `agency_deductions` | JSON array | DB column | **Yes (needs display fix)** | Array of `{agency_name, amount, crediting_agency}` |
| `crediting_agency_name` | string (50) | DB column | No (detail view) | First crediting deduction agency |
| `fractional_days` | decimal(5,3) | DB / computed | No | Computed from date_of_death + last_payment |
| `whole_months` | integer | DB / computed | No | Computed from date_of_death + last_payment |
| `amount_collected` | decimal(12,2) | DB column | Yes | |
| `date_collected` | date | DB column | No (detail view) | Nullable |
| `status` | enum | DB column | Yes | `recovered`, `not-yet-recovered`, `recovered-but-inc` |
| `created_at` | timestamp | DB | No | |
| `updated_at` | timestamp | DB | No | |

### Computed Attributes (from Pensioner model)

| Attribute | Formula | Displayed In List | Notes |
|-----------|---------|-------------------|-------|
| `start_date` | `date_of_death + 1 day` | No (detail view) | |
| `end_date` | `last_payment → end of month` | No (detail view) | |
| `daily_rate` | `monthly_pension / daysInMonth(start_date)` | No (detail view) | Rounded to 2 decimals |
| `total_overpayment_days` | `start_date → end_date diff in days` | No (detail view) | |
| `overpayment_amount` | `(wholeMonths * monthlyPension) + (fractionalDays * dailyRate)` | No (detail view) | |
| `computation_of_days` | `monthly_pension * fractional_days` | No (detail view) | |
| `computation_in_months` | `monthly_pension * whole_months` | No (detail view) | |
| `overpayment_subtotal` | `computation_of_days + computation_in_months` | No (detail view) | |
| **`overpayment_total`** | `SUM(overpayment_subtotal) WHERE name = same` | **Yes** | Sum across same-name pensioners |
| **`balance`** | `overpayment_total - amount_collected` | **Yes** | |
| `net_monthly_pension` | `gross - SUM(nonCreditingDeductions)` | No (detail view) | |
| `net_pension_overpayment` | `componentOverpayment(netMonthlyPension)` | No (detail view) | |
| `agency_overpayments` | Per-agency overpayment array | No (detail view) | |
| `grand_total_overpayment` | `netPensionOverpayment + SUM(agencyOverpayments)` | No (detail view) | |

### Agency Deduction (embedded in Pensioner.agency_deductions)

| Field | Type | Description |
|-------|------|-------------|
| `agency_name` | string | Agency name from `AGENCY_OPTIONS` |
| `amount` | float | Deduction amount |
| `crediting_agency` | boolean | Whether this is the crediting (first) agency |

### Collection

Records of payments collected toward the overpayment.

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer (PK) | |
| `pensioner_id` | integer (FK) | References `pensioners.id` |
| `amount` | decimal(12,2) | Payment amount |
| `collection_date` | date | When collected |
| `collection_type` | string | Optional classification |
| `reference` | string | Payment reference number |
| `collector` | string | Who collected |
| `remarks` | text | Optional notes |

### Recovery Installment

Monthly installment tracking for recovery plans.

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer (PK) | |
| `pensioner_id` | integer (FK) | References `pensioners.id` |
| `installment_no` | integer | Installment sequence number |
| `date_paid` | date | When paid |
| `amount_paid` | decimal(12,2) | Amount paid in this installment |
| `running_balance` | decimal(12,2) | Balance after this installment |
| `collector` | string | Who collected |

## Validation Rules

From `StorePensionerRequest.php` and `UpdatePensionerRequest.php`:

- `serial_number` must be unique (ignores current record on update)
- `monthly_pension` must be > 0
- `last_payment` must be after `date_of_death`
- `agency_deductions` max 10 entries
- Total non-crediting deductions must not exceed `monthly_pension`
- `status` must be one of: `recovered`, `not-yet-recovered`, `recovered-but-inc`

## State Transitions

**Status**: `not-yet-recovered` → `recovered` (when balance reaches 0) or `recovered-but-inc` (when partially recovered but incomplete)
