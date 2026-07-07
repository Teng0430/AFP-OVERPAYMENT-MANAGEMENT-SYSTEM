# API Contracts: Fix Pensioner Computation & Connection Handling

## GET /api/pensioners/{id} — Response (200)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "rank": "LCDR",
    "name": "Juan Dela Cruz",
    "serial_number": "AFPCN-12345",
    "account_number": "123456789",
    "date_of_death": "2026-01-15",
    "last_payment": "2026-03-31",
    "cause_of_stoppage": "Late Death Reporting",
    "agency_name": "LBP",
    "monthly_pension": 190000.00,
    "agency_deduction": null,
    "agency_deductions": [
      { "agency_name": "LBP", "amount": 0.00, "crediting_agency": true },
      { "agency_name": "AMWSLAI", "amount": 10000.00, "crediting_agency": false },
      { "agency_name": "ALIP", "amount": 15000.00, "crediting_agency": false },
      { "agency_name": "AFPMBAI", "amount": 5000.00, "crediting_agency": false }
    ],
    "crediting_agency_name": "LBP",
    "net_monthly_pension": 160000.00,
    "total_non_crediting": 30000.00,
    "fractional_days": 16.000,
    "whole_months": 2,
    "overpayment_amount": 424516.13,
    "net_pension_overpayment": 357487.10,
    "agency_overpayments": [
      { "agency_name": "LBP", "amount": 0.00, "overpayment": 0.00 },
      { "agency_name": "AMWSLAI", "amount": 10000.00, "overpayment": 22343.33 },
      { "agency_name": "ALIP", "amount": 15000.00, "overpayment": 33515.00 },
      { "agency_name": "AFPMBAI", "amount": 5000.00, "overpayment": 11171.67 }
    ],
    "grand_total_overpayment": 424516.13,
    "amount_collected": 0.00,
    "date_collected": null,
    "status": "not-yet-recovered",
    "created_at": "2026-07-07T00:00:00.000000Z",
    "updated_at": "2026-07-07T00:00:00.000000Z"
  }
}
```

### Key Changes from Previous Contract

| Field | Change |
|-------|--------|
| `net_monthly_pension` | Now equals `monthly_pension - sum(non-crediting deductions)` instead of `monthly_pension - sum(all deductions)` |
| `total_non_crediting` | **NEW** — sum of all deduction amounts where `crediting_agency` is false |
| `agency_deductions` | Unchanged structure |
| `crediting_agency_name` | Unchanged |

### Validation Example (422)

```json
{
  "success": false,
  "error": {
    "message": "Total non-crediting agency deductions exceed monthly pension.",
    "details": {
      "agency_deductions": ["Total non-crediting deductions (30000.00) must not exceed gross monthly pension (25000.00)."]
    }
  }
}
```

### Error Message Mapping

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Validation failure | 422 | Field-level errors from `error.details` |
| Server error | 500+ | "Service temporarily unavailable. Please try again later." |
| Authentication failure | 401 | "Invalid username or password." |
| Account locked | 403/423 | "Account locked. Please contact your administrator." |
| CORS/config error | No response (CORS blocked) | "Connection refused by server. Please check that the API server is running and CORS is configured correctly." |
| Network timeout | No response (timeout) | "Request timed out. Please check your network connection and try again." |
| DNS / no internet | No response (network) | "Unable to connect. Please check your internet connection and try again." |
