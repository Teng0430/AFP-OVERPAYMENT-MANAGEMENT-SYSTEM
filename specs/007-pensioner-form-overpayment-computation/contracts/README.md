# Contract Documentation

## API Endpoints

### Pensioner CRUD (unchanged routes, updated payload)

All pensioner endpoints remain at `/api/pensioners` (apiResource). Request/response payloads are updated to include new fields.

### POST /api/pensioners — Store Pensioner

**Request Body** (new fields highlighted):

```json
{
  "rank": "LCDR",
  "name": "Juan Dela Cruz",
  "serial_number": "AFP-2026-001",
  "account_number": "123456789",
  "date_of_death": "2026-01-15",
  "cause_of_stoppage": "Late Death Reporting",
  "agency_name": "LBP",
  "monthly_pension": 30000.00,
  "agency_deductions": [
    { "agency_name": "LBP", "amount": 500.00 },
    { "agency_name": "AFPSLAI", "amount": 1200.00 }
  ],
  "last_payment": "2026-03-31",
  "amount_collected": 0.00,
  "date_collected": null,
  "status": "not-yet-recovered"
}
```

**Note**: `agency_deduction` (singular) is accepted for backward compat but mapped into `agency_deductions`. `fractional_days` and `whole_months` are no longer accepted as inputs — they are computed server-side.

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "rank": "LCDR",
    "name": "Juan Dela Cruz",
    "serial_number": "AFP-2026-001",
    "account_number": "123456789",
    "date_of_death": "2026-01-15",
    "cause_of_stoppage": "Late Death Reporting",
    "agency_name": "LBP",
    "monthly_pension": 30000.00,
    "agency_deduction": 500.00,
    "agency_deductions": [
      { "agency_name": "LBP", "amount": 500.00 },
      { "agency_name": "AFPSLAI", "amount": 1200.00 }
    ],
    "last_payment": "2026-03-31",
    "fractional_days": 16,
    "whole_months": 2,
    "start_date": "2026-01-16",
    "end_date": "2026-03-31",
    "daily_rate": 967.74,
    "total_overpayment_days": 75,
    "overpayment_amount": 75483.84,
    "computation_of_days": 15483.84,
    "computation_in_months": 60000.00,
    "overpayment_subtotal": 75483.84,
    "overpayment_total": 75483.84,
    "amount_collected": 0.00,
    "balance": 75483.84,
    "status": "not-yet-recovered",
    "created_at": "2026-07-06T12:00:00Z",
    "updated_at": "2026-07-06T12:00:00Z"
  },
  "error": null
}
```

### PUT/PATCH /api/pensioners/{id} — Update Pensioner

Same request body as POST. Existing records without `last_payment` or `agency_deductions` will receive computed values on first update.

### GET /api/pensioners — List Pensioners

**Response** includes all new fields listed above. Filtering by `last_payment` range and agency_deductions is not required initially.

### GET /api/pensioners/{id} — Show Pensioner

Returns full pensioner record including new fields and computation breakdown.

## Frontend Service Interface

### `services/pensioners.ts`

```typescript
interface CreatePensionerPayload {
  rank: string;
  name: string;
  serial_number: string;
  account_number?: string;
  date_of_death: string;        // YYYY-MM-DD
  cause_of_stoppage: string;
  agency_name: string;
  monthly_pension: number;
  agency_deductions: Array<{ agency_name: string; amount: number }>;
  last_payment: string;         // YYYY-MM-DD
  amount_collected: number;
  date_collected?: string;
  status: PensionerStatus;
}
```

### Computation Engine Interface

```typescript
interface OverpaymentInput {
  dateOfDeath: Date;
  lastPayment: Date;
  monthlyPension: number;
}

interface OverpaymentResult {
  startDate: Date;
  endDate: Date;
  wholeMonths: number;
  fractionalDays: number;
  totalDays: number;
  dailyRate: number;
  overpaymentAmount: number;
}
```
