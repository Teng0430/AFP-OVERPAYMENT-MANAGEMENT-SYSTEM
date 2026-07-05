# Quickstart Validation Guide: Pension Overpayment Monitoring System

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-05

## Prerequisites

- PHP 8.2+ with Composer 2.8.x
- Node.js 22.x LTS with npm 11.x
- MySQL 8.4 LTS
- Existing project at `apps/backend` (Laravel 11.x) and `apps/frontend` (React 19.2.x)
- Feature 003 (Sanctum Auth) and Feature 004 (Post-Login Dashboard) fully implemented

---

## Setup

### Backend

```bash
cd apps/backend

# Install new dependencies
composer require maatwebsite/laravel-excel barryvdh/laravel-dompdf

# Run new migrations
php artisan migrate

# Seed roles and default settings
php artisan db:seed --class=RolesSeeder
php artisan db:seed --class=SettingsSeeder

# Start dev server
php artisan serve
```

### Frontend

```bash
cd apps/frontend

# Install new dependencies
npm install @tanstack/react-table react-hook-form @hookform/resolvers zod recharts framer-motion lucide-react

# Start dev server
npm run dev
```

---

## Validation Scenarios

### Scenario 1: Dashboard Loads with KPIs

**Steps**:
1. Log in as any user (POST `/api/login` with finance-officer credentials)
2. Navigate to `/dashboard`
3. Observe the executive summary cards

**Expected**:
- 10 KPI cards render (Total Pensioners, Active Cases, Total Overpayment, Amount Collected, Outstanding Balance, Recovery Rate %, Newly Uploaded, Pending Verification, Recovered Accounts, Recovered But Incomplete)
- Each card has an icon, trend direction arrow, and sparkline
- If no pensioners exist, empty-state placeholders are shown

**API Contract**: See `contracts/api.md` → `GET /api/dashboard/kpis`

---

### Scenario 2: Add Pensioner with Live Computation

**Steps**:
1. Navigate to `/pensioners/add`
2. Fill Personal Information section: Rank (select "COL"), Name ("Juan Dela Cruz"), Serial Number ("AFP-12345")
3. Fill Pension Information: Monthly Pension (45000), Agency Deduction (2500), Agency (select "LBP")
4. Fill Monitoring Information: Date of Death (2026-01-15), Cause of Stoppage ("Late Death Reporting"), Number of Months (6), Fractional Days (0.5)
5. Fill Recovery Information: Amount Collected (0), Status ("Not Yet Recovered")
6. Observe the live Financial Summary Card on the right side

**Expected**:
- Computation of Days: 22500.00 (45000 × 0.5)
- Computation in Months: 270000.00 (45000 × 6)
- Overpayment Subtotal: 292500.00 (22500 + 270000)
- Overpayment Total: 292500.00 (matches subtotal since no duplicates)
- Balance: 292500.00 (292500 − 0)
- Recovery %: 0%
- Summary card updates in real time as values change

**API Contract**: `POST /api/pensioners`

---

### Scenario 3: Pensioner Data Table with Filters

**Steps**:
1. Navigate to `/pensioners`
2. Apply filter: Rank = "COL", Status = "Not Yet Recovered"
3. Search by name: type "Juan"

**Expected**:
- Data table shows all columns listed in FR-004
- Only matching rows displayed after filtering
- Search narrows results further
- Column headers are sortable; pagination works
- Computed fields (Computation of Days, Computation in Months, etc.) show correct values

**API Contract**: `GET /api/pensioners`

---

### Scenario 4: Bulk Upload CSV

**Steps**:
1. Navigate to `/upload`
2. Drag a CSV file with pensioner data onto the upload zone
3. Review the preview of parsed records
4. Confirm import

**Expected**:
- File parsed and columns detected
- Preview table shows row-by-row data
- Any validation errors (missing columns, wrong formats) highlighted
- After confirmation, records appear in the pensioner table
- Import history shows the completed upload

**API Contract**: `POST /api/uploads`, `GET /api/uploads/preview`, `POST /api/uploads/{id}/confirm`

---

### Scenario 5: Recovery Ledger for Partial Payments

**Steps**:
1. Navigate to `/pensioners` and find a pensioner with status "Recovered But Inc."
2. Click the status badge
3. Observe the slide-over ledger panel
4. Click "Print Ledger" or "Export PDF"

**Expected**:
- Slide-over panel opens with installment table
- Each row shows: installment number, date, amount paid, running balance, collector, remarks
- Progress bar shows collection percentage
- Timeline shows payment history
- Remaining balance and expected completion date displayed
- Print/PDF export formats the ledger appropriately

**API Contract**: `GET /api/pensioners/{id}/installments`, `GET /api/pensioners/{id}/installments/export-pdf`

---

### Scenario 6: Global Search

**Steps**:
1. In the header search bar, type "Juan"
2. Select a search result

**Expected**:
- Dropdown shows matching results grouped by type (pensioner name, serial number, etc.)
- Selecting a result navigates to that pensioner's detail page
- Search is fast (<2 seconds)

**API Contract**: `GET /api/search`

---

### Scenario 7: RBAC — Viewer Cannot Edit

**Steps**:
1. Log in as a user with "Viewer" role
2. Navigate to `/pensioners`

**Expected**:
- Data table is visible (read access)
- "Add Pensioner" button is hidden or disabled
- Edit/delete actions on table rows are hidden
- Form submission endpoints return 403 Forbidden

**API Contract**: All endpoints enforce via middleware; expect `403` response for unauthorized actions.

---

### Scenario 8: Report Generation

**Steps**:
1. Navigate to `/reports`
2. Select type: "Monthly", Month: "2026-06"
3. Click "Generate"
4. Click "Export as CSV"

**Expected**:
- Report preview shows data for the selected period
- CSV file downloads with correct header row and data
- Same flow works for PDF and Excel formats

**API Contract**: `GET /api/reports/generate`

---

### Scenario 9: Alerts Generated Automatically

**Steps**:
1. Create a pensioner with date_of_death > 30 days ago and status "Not Yet Recovered"
2. Wait for the next scheduled alert check (or run artisan command manually: `php artisan alerts:check`)
3. Open notification center in header

**Expected**:
- Alert appears: type "late-death-report", severity "warning"
- Unread badge shows count
- Clicking alert navigates to the relevant pensioner

**Check command**: `php artisan alerts:check`

**API Contract**: `GET /api/alerts`

---

## Running Tests

### Backend

```bash
cd apps/backend
php artisan test --filter="PensionerOverpayment"
php artisan test --filter="Dashboard"
php artisan test --filter="Upload"
php artisan test --filter="Recovery"
php artisan test --filter="Auth"

# Run all tests
php artisan test
```

### Frontend

```bash
cd apps/frontend
npx vitest run

# With coverage
npx vitest run --coverage
```

### Static Analysis

```bash
cd apps/backend
./vendor/bin/phpstan analyse --level=6

cd apps/frontend
npx tsc --noEmit
npx eslint src/
```
