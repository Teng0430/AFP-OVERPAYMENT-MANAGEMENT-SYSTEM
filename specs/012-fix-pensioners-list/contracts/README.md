# API Contracts: Fix Pensioners List

**Date**: 2026-07-10 | **Plan**: plan.md

## Overview

All API endpoints follow the standard JSON envelope: `{ success: bool, data: ..., error: ... }`.

All endpoints are under `auth:sanctum` middleware.

---

## GET /api/pensioners — List

**Purpose**: Fetch paginated, searchable, filterable, sortable list of pensioners.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 50, max: 100) |
| `search` | string | No | Search name, serial_number, account_number |
| `rank[]` | string[] | No | Filter by rank(s) |
| `agency_name[]` | string[] | No | Filter by agency name(s) |
| `status[]` | string[] | No | Filter by status(es) |
| `cause_of_stoppage[]` | string[] | No | Filter by cause(s) |
| `date_from` | date | No | Filter date_of_death >= |
| `date_to` | date | No | Filter date_of_death <= |
| `amount_min` | float | No | Filter overpayment_subtotal >= |
| `amount_max` | float | No | Filter overpayment_subtotal <= |
| `sort_by` | string | No | Sort column (whitelisted) |
| `sort_dir` | `asc` / `desc` | No | Sort direction (default: desc) |

**Response** (200):

```json
{
  "success": true,
  "data": {
    "data": [ PensionerResource... ],
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 5,
      "per_page": 50,
      "to": 50,
      "total": 234
    }
  },
  "error": null
}
```

**PensionerResource fields** (key fields used in list):

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | |
| `rank` | string | |
| `name` | string | |
| `serial_number` | string | |
| `agency_name` | string | Primary agency |
| `last_payment` | string (ISO date) | Raw date — **frontend must format** |
| `agency_deductions` | array | Full agency deduction list |
| `monthly_pension` | float | |
| `overpayment_total` | float | Computed sum across same-name records |
| `amount_collected` | float | |
| `balance` | float | |
| `status` | string | |

---

## GET /api/pensioners/{id} — Show (Detail View)

**Purpose**: Fetch a single pensioner with all relationships for the detail view.

**Response** (200):

```json
{
  "success": true,
  "data": {
    "pensioner": {
      ...PensionerResource (all fields),
      "upload_batch": {...} | null,
      "creator": {...} | null,
      "recovery_installments": [...],
      "collections": [...]
    }
  },
  "error": null
}
```

Used by the View modal and Edit page to fetch full pensioner data with relationships.

---

## PUT /api/pensioners/{id} — Update

**Purpose**: Update an existing pensioner. Accepts the same fields as the store endpoint (all optional).

**Request body**: Same validation rules as `UpdatePensionerRequest`.

**Response** (200): Updated `PensionerResource`.

Used by the Edit form.

---

## DELETE /api/pensioners/{id} — Delete

**Purpose**: Delete a single pensioner.

**Response** (200):
```json
{
  "success": true,
  "data": { "message": "Pensioner deleted successfully." },
  "error": null
}
```

**Response** (409 for foreign key constraint):
```json
{
  "success": false,
  "data": {},
  "error": {
    "message": "Unable to delete pensioner because related records exist.",
    "code": "FOREIGN_KEY_CONSTRAINT"
  }
}
```

Used by the Delete action.

---

## No New Endpoints Required

The existing API surface covers all needs for this feature:
- `GET /api/pensioners` — list with search/filter/sort/pagination
- `GET /api/pensioners/{id}` — detail view data
- `PUT /api/pensioners/{id}` — edit
- `DELETE /api/pensioners/{id}` — delete

All formatting (dates, currency, agency display) is handled on the frontend.
