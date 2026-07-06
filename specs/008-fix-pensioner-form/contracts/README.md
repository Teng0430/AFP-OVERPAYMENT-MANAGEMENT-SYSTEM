# API Contracts: Fix Add Pensioner & Multi-Component Overpayment

## Base URL

```
https://ids-backend.test/api
```

All endpoints use the consistent JSON envelope: `{ success: bool, data: ?, error: ? }`.

Authorization: `Bearer <sanctum-token>` via `Authorization` header.

---

## POST /api/pensioners (Store)

### Request Payload

```json
{
  "rank": "LCDR",
  "name": "JUAN DELA CRUZ",
  "serial_number": "AFP-123456",
  "account_number": "00012345678",
  "date_of_death": "2026-01-15",
  "last_payment": "2026-03-31",
  "cause_of_stoppage": "LATE DEATH REPORTING",
  "agency_name": "LBP",
  "monthly_pension": 100000.00,
  "agency_deductions": [
    { "agency_name": "LBP", "amount": 2000.00, "crediting_agency": true },
    { "agency_name": "ALIP", "amount": 10000.00, "crediting_agency": false },
    { "agency_name": "PVB", "amount": 5000.00, "crediting_agency": false }
  ],
  "amount_collected": 0,
  "status": "not-yet-recovered"
}
```

**Notes:**
- `agency_deductions` is a JSON array. Each entry requires `agency_name`, `amount`, and `crediting_agency` (boolean, true only for the first entry).
- The first entry's `crediting_agency` must be `true`; all others must be `false`.
- `crediting_agency_name` is derived from the first entry on the backend. It must match `agency_deductions[0].agency_name`.

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "rank": "LCDR",
    "name": "JUAN DELA CRUZ",
    "serial_number": "AFP-123456",
    "account_number": "00012345678",
    "date_of_death": "2026-01-15",
    "last_payment": "2026-03-31",
    "cause_of_stoppage": "LATE DEATH REPORTING",
    "agency_name": "LBP",
    "monthly_pension": 100000.00,
    "agency_deductions": [
      { "agency_name": "LBP", "amount": 2000.00, "crediting_agency": true },
      { "agency_name": "ALIP", "amount": 10000.00, "crediting_agency": false },
      { "agency_name": "PVB", "amount": 5000.00, "crediting_agency": false }
    ],
    "crediting_agency_name": "LBP",
    "net_monthly_pension": 83000.00,
    "whole_months": 2,
    "fractional_days": 16,
    "daily_rate": 3225.81,
    "net_pension_overpayment": 217612.96,
    "agency_overpayments": [
      { "agency_name": "LBP", "amount": 2000.00, "overpayment": 5238.72 },
      { "agency_name": "ALIP", "amount": 10000.00, "overpayment": 26193.60 },
      { "agency_name": "PVB", "amount": 5000.00, "overpayment": 13096.80 }
    ],
    "grand_total_overpayment": 262142.08,
    "status": "not-yet-recovered",
    "created_at": "2026-07-06T12:00:00.000000Z",
    "updated_at": "2026-07-06T12:00:00.000000Z"
  }
}
```

**Computed fields:**
- `net_monthly_pension`: `gross - sum(agency_deductions[*].amount)`
- `whole_months`, `fractional_days`, `daily_rate`: date-based factors (shared across all components)
- `net_pension_overpayment`: computed on `net_monthly_pension`
- `agency_overpayments`: per-agency computation
- `grand_total_overpayment`: `net_pension_overpayment + sum(agency_overpayments[*].overpayment)`
- `crediting_agency_name`: derived from first entry

### Error Response (422) — Validation Errors

```json
{
  "success": false,
  "error": {
    "message": "The given data was invalid.",
    "code": "VALIDATION_ERROR",
    "details": {
      "last_payment": ["The last payment field must be a date after or equal to date of death."],
      "monthly_pension": ["The monthly pension must be greater than 0."]
    }
  }
}
```

---

## PUT /api/pensioners/{id} (Update)

Same payload structure as POST. Only provided fields are updated.

---

## GET /api/pensioners/{id} (Show)

Returns the same response structure as POST success (no computed overpayment breakdown).

---

## Frontend Payload Alignment

The frontend must send the payload using snake_case field names matching the backend's expected format. Specifically:

- `agency_deductions` → array of `{ agency_name: string, amount: number, crediting_agency: boolean }`
- `crediting_agency` → boolean field inside each deduction entry
- `date_of_death` → YYYY-MM-DD string
- `last_payment` → YYYY-MM-DD string
- `monthly_pension` → float

The frontend must NOT send camelCase field names (e.g., `agencyName`, `dateOfDeath`). This was the root cause of the "Unable to connect" error — the frontend was serializing with camelCase keys that didn't match the backend's snake_case `StorePensionerRequest` validation.
