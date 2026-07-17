# API Contracts: Redesign Pensioners List

**Date**: 2026-07-10 | **Plan**: plan.md

## No New API Endpoints Required

All existing API endpoints are sufficient. No new endpoints need to be created.

### Existing Endpoints

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| `GET` | `/api/pensioners` | List pensioners with pagination, search, filters, sorting | Existing |
| `GET` | `/api/pensioners/{id}` | Get single pensioner with all relations | Existing |
| `PUT` | `/api/pensioners/{id}` | Update pensioner (used by Edit) | Existing |
| `DELETE` | `/api/pensioners/{id}` | Delete single pensioner | Existing |
| `POST` | `/api/pensioners/bulk-delete` | Bulk delete pensioners | Existing |
| `POST` | `/api/pensioners/bulk-update` | Bulk update pensioners | Existing |

### Key Contract Fields (PensionerResource)

The `PensionerResource` returns the following fields relevant to this feature:

| Field | Type | Notes |
|-------|------|-------|
| `last_payment` | string (ISO date) | Raw date string for form inputs |
| `last_payment_formatted` | string | Formatted date (e.g., "March 31, 2026") **— use this for display** |
| `agency_deductions` | array | Array of `{agency_name, amount, crediting_agency}` |
| `overpayment_total` | number | **Will be fixed** — currently bugged with name-based grouping |
| `balance` | number | **Will be fixed** — cascaded from overpayment_total fix |
| `amount_collected` | number | Direct DB value |

### Response Envelope

All responses follow the consistent `{success, data, error}` envelope.
