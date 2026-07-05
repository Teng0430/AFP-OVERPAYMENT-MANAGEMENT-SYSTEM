# API Contracts: Pension Overpayment Monitoring System

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-05

## Base URL

All endpoints: `/api/` prefix.

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header using Laravel Sanctum.

## Response Envelope

All responses follow the project standard JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": { "field": ["validation message"] }
  }
}
```

---

## 1. Dashboard

### GET /api/dashboard/kpis

Returns computed KPI values for the executive summary cards.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_pensioners": 1250,
    "active_monitoring_cases": 340,
    "total_overpayment": 15200000.00,
    "total_amount_collected": 4800000.00,
    "outstanding_balance": 10400000.00,
    "recovery_rate": 31.58,
    "newly_uploaded_records": 45,
    "pending_verification": 22,
    "recovered_accounts": 180,
    "recovered_but_incomplete": 58,
    "trends": {
      "total_pensioners": { "direction": "up", "percentage": 3.5 },
      "recovery_rate": { "direction": "up", "percentage": 1.2 },
      "outstanding_balance": { "direction": "down", "percentage": 2.1 }
    },
    "sparklines": {
      "total_overpayment": [12500000, 12800000, 13500000, 14200000, 14800000, 15200000],
      "amount_collected": [3500000, 3800000, 4100000, 4400000, 4600000, 4800000]
    }
  }
}
```

### GET /api/dashboard/charts

Returns data for dashboard analytics charts.

**Query Params**: `?period=monthly|quarterly|annual`

**Response**:
```json
{
  "success": true,
  "data": {
    "monthly_overpayment_trend": [
      { "month": "2026-01", "amount": 12500000 },
      { "month": "2026-02", "amount": 12800000 }
    ],
    "overpayment_by_rank": [
      { "rank": "GEN", "amount": 2500000 },
      { "rank": "COL", "amount": 1800000 }
    ],
    "status_distribution": [
      { "status": "recovered", "count": 180 },
      { "status": "not-yet-recovered", "count": 102 },
      { "status": "recovered-but-inc", "count": 58 }
    ],
    "collection_progress": [
      { "month": "2026-01", "collected": 350000, "target": 400000 }
    ],
    "agency_recoveries": [
      { "agency": "LBP", "total_overpayment": 5000000, "collected": 2000000 }
    ],
    "monthly_recoveries_heatmap": [
      { "year": 2026, "month": 1, "amount": 350000 },
      { "year": 2026, "month": 2, "amount": 380000 }
    ]
  }
}
```

---

## 2. Pensioners

### GET /api/pensioners

Paginated list of pensioners with filtering, sorting, and search.

**Query Params**:
- `page` (int, default: 1)
- `per_page` (int, default: 50, max: 100)
- `search` (string) — global search across name, serial, account
- `rank` (array) — multi-select filter
- `agency_name` (array) — multi-select filter
- `status` (array) — multi-select filter
- `cause_of_stoppage` (array)
- `year` (int) — filter by year of date_of_death
- `month` (int) — filter by month of date_of_death
- `recovery_status` (string)
- `amount_min` / `amount_max` (decimal)
- `date_from` / `date_to` (date)
- `sort_by` (string, default: created_at)
- `sort_dir` (string, default: desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "pensioners": [
      {
        "id": 1,
        "rank": "COL",
        "name": "Juan Dela Cruz",
        "serial_number": "AFP-12345",
        "account_number": "1234567890",
        "date_of_death": "2026-01-15",
        "cause_of_stoppage": "Late Death Reporting",
        "agency_name": "LBP",
        "monthly_pension": 45000.00,
        "agency_deduction": 2500.00,
        "fractional_days": 0.500,
        "whole_months": 6,
        "computation_of_days": 22500.00,
        "computation_in_months": 270000.00,
        "overpayment_subtotal": 292500.00,
        "overpayment_total": 292500.00,
        "amount_collected": 100000.00,
        "date_collected": "2026-03-01",
        "balance": 192500.00,
        "status": "recovered-but-inc",
        "created_at": "2026-01-20T10:00:00Z",
        "updated_at": "2026-03-01T14:30:00Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 25,
      "per_page": 50,
      "total": 1250,
      "from": 1,
      "to": 50
    }
  }
}
```

### GET /api/pensioners/{id}

Single pensioner with full details.

**Response**: Single pensioner object (same structure as list item, plus `recovery_installments` and `collections` arrays if applicable).

### POST /api/pensioners

Create new pensioner.

**Request Body**:
```json
{
  "rank": "COL",
  "name": "Juan Dela Cruz",
  "serial_number": "AFP-12345",
  "account_number": "1234567890",
  "date_of_death": "2026-01-15",
  "cause_of_stoppage": "Late Death Reporting",
  "agency_name": "LBP",
  "monthly_pension": 45000.00,
  "agency_deduction": 2500.00,
  "fractional_days": 0.500,
  "whole_months": 6,
  "amount_collected": 0,
  "date_collected": null,
  "status": "not-yet-recovered"
}
```

**Response**: Created pensioner object with computed fields included.

### PUT /api/pensioners/{id}

Update pensioner. Same body structure as POST. Computed fields recalculated on save.

### DELETE /api/pensioners/{id}

Soft-delete a pensioner record.

**Response**: `{ "success": true, "data": { "id": 1, "deleted": true }, "error": null }`

### POST /api/pensioners/bulk-delete

Delete multiple pensioners by ID.

**Request Body**: `{ "ids": [1, 2, 3] }`

### POST /api/pensioners/bulk-update

Update multiple pensioners (same field for all).

**Request Body**: `{ "ids": [1, 2, 3], "data": { "status": "recovered" } }`

---

## 3. Recovery Installments

### GET /api/pensioners/{pensionerId}/installments

List installments for a pensioner.

**Response**:
```json
{
  "success": true,
  "data": {
    "installments": [
      {
        "id": 1,
        "installment_no": 1,
        "date_paid": "2026-02-01",
        "amount_paid": 50000.00,
        "running_balance": 242500.00,
        "collector": "Sgt. Reyes",
        "remarks": "First installment"
      },
      {
        "id": 2,
        "installment_no": 2,
        "date_paid": "2026-03-01",
        "amount_paid": 50000.00,
        "running_balance": 192500.00,
        "collector": "Sgt. Reyes",
        "remarks": "Second installment"
      }
    ],
    "summary": {
      "total_overpayment": 292500.00,
      "total_collected": 100000.00,
      "remaining_balance": 192500.00,
      "collection_percentage": 34.19,
      "expected_completion": "2026-09-01"
    }
  }
}
```

### POST /api/pensioners/{pensionerId}/installments

Add a new installment.

**Request Body**:
```json
{
  "date_paid": "2026-04-01",
  "amount_paid": 50000.00,
  "collector": "Sgt. Reyes",
  "remarks": "Third installment"
}
```

### GET /api/pensioners/{pensionerId}/installments/export-pdf

Download recovery ledger as PDF.

---

## 4. Upload

### POST /api/uploads

Upload file for bulk import.

**Request**: Multipart form data with `file` field.

### GET /api/uploads/preview

Preview parsed records before confirming import. Requires file reference from previous upload.

**Response**: `{ "columns": [...], "rows": [...], "errors": [...], "duplicates": [...] }`

### POST /api/uploads/{uploadId}/confirm

Confirm import of previewed records.

### GET /api/uploads

List upload history.

**Response**: Paginated list with file_name, date, row counts, status.

---

## 5. Reports

### GET /api/reports/generate

Generate report with specified parameters.

**Query Params**:
- `type` (required): daily|weekly|monthly|quarterly|annual|custom
- `date_from` / `date_to` (required for custom)
- `format` (required): pdf|excel|csv|print
- `group_by` (optional): rank|agency|status|cause

**Response**: File download (Content-Disposition: attachment) for PDF/Excel/CSV, or HTML for print.

---

## 6. Search

### GET /api/search

Global search endpoint.

**Query Params**:
- `q` (required, string): search query
- `type` (optional): pensioners|users|uploads

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "pensioner",
        "id": 1,
        "rank": "COL",
        "name": "Juan Dela Cruz",
        "serial_number": "AFP-12345",
        "match_field": "name",
        "match_preview": "...Dela <strong>Cruz</strong>..."
      }
    ]
  }
}
```

---

## 7. Alerts

### GET /api/alerts

List alerts with optional filters.

**Query Params**: `severity=critical|warning|info|resolved`, `is_read=true|false`, `type=...`

### POST /api/alerts/{id}/read

Mark single alert as read.

### POST /api/alerts/read-all

Mark all alerts as read.

---

## 8. Audit Logs

### GET /api/audit-logs

Paginated list of audit log entries.

**Query Params**: `user_id`, `action`, `entity_type`, `date_from`, `date_to` (all optional)

---

## 9. Users (Admin)

### GET /api/users

List all users (Super Admin only).

### POST /api/users

Create new user.

**Request Body**: `{ "name", "email", "password", "role_id", "department", "is_active" }`

### PUT /api/users/{id}

Update user details.

### DELETE /api/users/{id}

Deactivate user (soft-delete).

### POST /api/users/{id}/reset-password

Admin-initiated password reset.

### POST /api/users/{id}/toggle-2fa

Enable/disable two-factor authentication.

### GET /api/roles

List all roles with permissions.

### GET /api/roles/matrix

Role-permission matrix grid.

---

## 10. Settings

### GET /api/settings

Get all settings grouped by category.

### PUT /api/settings

Update settings. Accepts array of `{ group, key, value }`.

### POST /api/settings/backup

Trigger system backup.

### POST /api/settings/restore

Restore from backup.
