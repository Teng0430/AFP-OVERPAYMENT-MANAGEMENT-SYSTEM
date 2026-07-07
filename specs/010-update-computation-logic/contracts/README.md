# API Contracts: Update Computation Logic for Breakdown and Summary

## Overview

No API contract changes are required for this feature. The API response shape (`PensionerResource`) remains unchanged — all computed fields continue to be returned. Only the frontend display of the Final Summary section changes.

## Affected API Endpoints

| Method | Endpoint | Change |
|--------|----------|--------|
| GET | `/api/pensioners` | None — still returns all fields |
| GET | `/api/pensioners/{id}` | None |
| POST | `/api/pensioners` | None |
| PUT | `/api/pensioners/{id}` | None |

## Relevant Response Fields (unchanged)

```jsonc
{
  "data": {
    // ... all other fields remain unchanged ...
    "net_monthly_pension": 22000.0,          // Still returned
    "total_non_crediting": 8000.0,            // Still returned
    "net_pension_overpayment": 57548.38,      // Still returned
    "agency_overpayments": [                  // Still returned
      { "agency_name": "LBP", "amount": 5000.0, "overpayment": 12580.64 },
      { "agency_name": "AFPSLAI", "amount": 3000.0, "overpayment": 8019.36 }
    ],
    "grand_total_overpayment": 78148.38       // Still returned and displayed
  }
}
```

## Change Summary

- `net_pension_overpayment` is **still returned** by the API but **no longer displayed** in the Final Summary
- `agency_overpayments` is **still returned** by the API (individual agency cards remain) but the summed "Total Agency Overpayments" row is **removed** from the Final Summary
- `grand_total_overpayment` is **still returned** and **remains displayed** in the Final Summary
