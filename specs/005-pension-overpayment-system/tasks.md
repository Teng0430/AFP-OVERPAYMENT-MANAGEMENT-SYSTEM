# Tasks: Pension Overpayment Monitoring System

**Input**: Design documents from `specs/005-pension-overpayment-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/`
- **Frontend**: `apps/frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies required for the feature

- [x] T001 [P] Install backend packages: `openspout/openspout`, `tecnickcom/tcpdf` via `composer require` in `apps/backend/` (maatwebsite/laravel-excel incompatible with Laravel 12)
- [x] T002 [P] Install frontend packages: `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `framer-motion`, `lucide-react` via `npm install` in `apps/frontend/`
- [x] T003 [P] Add shadcn/ui components and install all Radix UI + utility dependencies in `apps/frontend/`
- [x] T004 [P] Install Tailwind CSS v3, configure PostCSS, shadcn CSS variables, and utility packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story can begin

**CRITICAL**: No user story work starts until this phase is complete

### Database Migrations

- [x] T005 Create `create_roles_table` migration in `apps/backend/database/migrations/`
- [x] T006 Create `add_role_id_to_users_table` migration in `apps/backend/database/migrations/`
- [x] T007 Create `create_pensioners_table` migration in `apps/backend/database/migrations/`
- [x] T008 [P] Create `create_recovery_installments_table` migration in `apps/backend/database/migrations/`
- [x] T009 [P] Create `create_collections_table` migration in `apps/backend/database/migrations/`
- [x] T010 [P] Create `create_upload_batches_table` migration in `apps/backend/database/migrations/`
- [x] T011 [P] Create `create_audit_logs_table` migration in `apps/backend/database/migrations/`
- [x] T012 [P] Create `create_alerts_table` migration in `apps/backend/database/migrations/`
- [x] T013 [P] Create `create_settings_table` migration in `apps/backend/database/migrations/`

### Models

- [x] T014 [P] Create `Role` model in `apps/backend/app/Models/Role.php`
- [x] T015 [P] Extend `User` model in `apps/backend/app/Models/User.php` with role_id, role(), hasRole()
- [x] T016 [P] Create `Pensioner` model in `apps/backend/app/Models/Pensioner.php` with computed accessors
- [x] T017 [P] Create `RecoveryInstallment` model in `apps/backend/app/Models/RecoveryInstallment.php`
- [x] T018 [P] Create `Collection` model in `apps/backend/app/Models/Collection.php`
- [x] T019 [P] Create `UploadBatch` model in `apps/backend/app/Models/UploadBatch.php`
- [x] T020 [P] Create `AuditLog` model in `apps/backend/app/Models/AuditLog.php`
- [x] T021 [P] Create `Alert` model in `apps/backend/app/Models/Alert.php`
- [x] T022 [P] Create `Setting` model in `apps/backend/app/Models/Setting.php`

### Auth & RBAC Infrastructure

- [x] T023 Create `CheckRole` middleware in `apps/backend/app/Http/Middleware/CheckRole.php`
- [x] T024 Register `CheckRole` middleware as `role` alias in `AppServiceProvider.php`
- [x] T025 [P] Create `RolesSeeder` in `apps/backend/database/seeders/RolesSeeder.php` with 6 roles
- [x] T026 [P] Create `SettingsSeeder` in `apps/backend/database/seeders/SettingsSeeder.php`

### Audit Logging

- [x] T027 Create `AuditService` in `apps/backend/app/Services/AuditService.php` with static log() method
- [x] T028 Add `logAudit()` helper to User model in `apps/backend/app/Models/User.php`

### Frontend Infrastructure

- [x] T029 [P] Create TypeScript type definitions in `apps/frontend/src/types/pensioner.ts`
- [x] T030 [P] Create TypeScript type definitions in `apps/frontend/src/types/index.ts`
- [x] T031 [P] Create frontend API service modules in `apps/frontend/src/services/`
- [x] T032 [P] Create enterprise layout shell (Sidebar, Header, AppShell, SidebarContext) in `apps/frontend/src/components/layout/`
- [x] T033 [P] Create route structure in `apps/frontend/src/App.tsx` with lazy-loaded pages and 11 placeholder pages

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Executive Dashboard (P1)

**Goal**: Users see KPI summary cards and analytics charts as the landing page after login

**Independent Test**: Log in and verify dashboard renders with KPI cards (showing 0 values if no data) and chart containers

### Backend — Dashboard

- [x] T034 [P] [US1] Create `DashboardController` in `apps/backend/app/Http/Controllers/Api/DashboardController.php`
- [x] T035 [US1] Add `charts()` method to `DashboardController`
- [x] T036 [P] [US1] Create `OverpaymentCalculationService` in `apps/backend/app/Services/OverpaymentCalculationService.php`
- [x] T037 [US1] Register dashboard API routes in `apps/backend/routes/api.php`
- [ ] T038 [P] [US1] Create Feature tests for Dashboard KPI endpoint
- [ ] T039 [P] [US1] Create Feature tests for Dashboard charts endpoint

### Frontend — Dashboard

- [x] T040 [P] [US1] Create `KpiCard` component in `apps/frontend/src/components/dashboard/KpiCard.tsx`
- [x] T041 [P] [US1] Create `KpiGrid` component in `apps/frontend/src/components/dashboard/KpiGrid.tsx`
- [x] T042 [P] [US1] Create `MonthlyOverpaymentChart` component in `apps/frontend/src/components/dashboard/MonthlyOverpaymentChart.tsx`
- [x] T043 [P] [US1] Create `OverpaymentByRankChart` component
- [x] T044 [P] [US1] Create `StatusDistributionChart` component
- [x] T045 [P] [US1] Create `CollectionProgressChart` component
- [x] T046 [P] [US1] Create `AgencyRecoveriesChart` component
- [x] T047 [P] [US1] Create `MonthlyRecoveriesHeatmap` component
- [x] T048 [US1] Create `DashboardPage` in `apps/frontend/src/pages/DashboardPage.tsx`
- [ ] T049 [P] [US1] Create frontend tests for dashboard components
- [ ] T050 [US1] Add dashboard route as authenticated landing page (index route) in `apps/frontend/src/App.tsx`

**Checkpoint**: US1 complete — dashboard shows KPI cards and charts with real or empty-state data

---

## Phase 4: User Story 2 — Pensioner Data Management (P1)

**Goal**: Users view, sort, filter, and manage pensioners in an enterprise data table with auto-computed financial fields

**Independent Test**: Open the pensioners page and verify the table renders all columns with correct computed values

### Backend — Pensioner CRUD

- [ ] T051 [P] [US2] Create `PensionerController` in `apps/backend/app/Http/Controllers/Api/PensionerController.php` with `index()` method supporting pagination, sorting, and filtering by rank, agency, status, date range, amount range
- [ ] T052 [US2] Add `show()` method to `PensionerController` returning single pensioner with computed fields and installments
- [ ] T053 [US2] Add `update()` method to `PensionerController` with validation and computed field recalculation
- [ ] T054 [US2] Add `destroy()` method to `PensionerController` for soft-delete
- [ ] T055 [P] [US2] Add `bulkDelete()` and `bulkUpdate()` methods to `PensionerController`
- [ ] T056 [P] [US2] Create `StorePensionerRequest` in `apps/backend/app/Http/Requests/StorePensionerRequest.php` with validation rules per data-model.md
- [ ] T057 [P] [US2] Create `UpdatePensionerRequest` in `apps/backend/app/Http/Requests/UpdatePensionerRequest.php`
- [ ] T058 [P] [US2] Create `PensionerResource` in `apps/backend/app/Http/Resources/PensionerResource.php` including computed fields in API response
- [ ] T059 [US2] Register pensioner routes in `apps/backend/routes/api.php`: `GET /api/pensioners`, `GET /api/pensioners/{id}`, `PUT /api/pensioners/{id}`, `DELETE /api/pensioners/{id}`, `POST /api/pensioners/bulk-delete`, `POST /api/pensioners/bulk-update`
- [ ] T060 [P] [US2] Create Feature tests in `apps/backend/tests/Feature/Api/PensionerTest.php` for list with filters, show, update, delete, bulk operations
- [ ] T061 [P] [US2] Create Feature tests verifying all computed fields (computation_of_days, computation_in_months, overpayment_subtotal, overpayment_total, balance) return correct values

### Frontend — Pensioner Data Table

- [ ] T062 [P] [US2] Create `PensionerDataTable` component in `apps/frontend/src/components/pensioners/PensionerDataTable.tsx` using TanStack Table with all columns, sorting, pagination, sticky header, column visibility, resizable columns
- [ ] T063 [P] [US2] Create rank searchable dropdown component in `apps/frontend/src/components/shared/RankSelect.tsx` with all military rank values
- [ ] T064 [P] [US2] Create agency searchable dropdown component in `apps/frontend/src/components/shared/AgencySelect.tsx` with all agency values
- [ ] T065 [P] [US2] Create status badge component in `apps/frontend/src/components/shared/StatusBadge.tsx` with color-coded badges for recovered (green), not-yet-recovered (red), recovered-but-inc (yellow)
- [ ] T066 [P] [US2] Create `PensionerFilters` component in `apps/frontend/src/components/pensioners/PensionerFilters.tsx` with multi-select for rank, agency, status, date range, amount range
- [ ] T067 [US2] Create `PensionersPage` in `apps/frontend/src/pages/PensionersPage.tsx` composing data table with filters and search
- [ ] T068 [P] [US2] Add route for `/pensioners` in `apps/frontend/src/App.tsx`
- [ ] T069 [P] [US2] Create tests in `apps/frontend/src/components/pensioners/__tests__/PensionerDataTable.test.tsx`

**Checkpoint**: US2 complete — pensioner data table renders with correct columns, sorting, filtering, and computed values

---

## Phase 5: User Story 3 — Add Pensioner Form (P1)

**Goal**: Encoders add new pensioners through a multi-section form with live financial summary card

**Independent Test**: Open the add form, fill fields, and verify the summary card updates in real time

### Backend — Create Endpoint

- [ ] T070 [P] [US3] Add `store()` method to `PensionerController` in `apps/backend/app/Http/Controllers/Api/PensionerController.php` (uses StorePensionerRequest)
- [ ] T071 [US3] Register `POST /api/pensioners` route in `apps/backend/routes/api.php`
- [ ] T072 [P] [US3] Create Feature test in `apps/backend/tests/Feature/Api/PensionerStoreTest.php` verifying creation with all field combinations and validation

### Frontend — Multi-Section Form

- [ ] T073 [P] [US3] Create `PersonalInfoSection` component in `apps/frontend/src/components/pensioners/form/PersonalInfoSection.tsx` with rank (searchable dropdown), name, serial number, account number fields
- [ ] T074 [P] [US3] Create `PensionInfoSection` component in `apps/frontend/src/components/pensioners/form/PensionInfoSection.tsx` with monthly pension, agency deduction, agency name dropdown
- [ ] T075 [P] [US3] Create `MonitoringInfoSection` component in `apps/frontend/src/components/pensioners/form/MonitoringInfoSection.tsx` with date of death, cause of stoppage, number of months, fractional days
- [ ] T076 [P] [US3] Create `RecoveryInfoSection` component in `apps/frontend/src/components/pensioners/form/RecoveryInfoSection.tsx` with amount collected, date collected, status dropdown
- [ ] T077 [P] [US3] Create `FinancialSummaryCard` component in `apps/frontend/src/components/pensioners/form/FinancialSummaryCard.tsx` showing live subtotal, total, balance, and recovery percentage
- [ ] T078 [US3] Create `AddPensionerPage` in `apps/frontend/src/pages/AddPensionerPage.tsx` with React Hook Form + Zod validation, four sections, and live summary card
- [ ] T079 [P] [US3] Create Zod validation schema in `apps/frontend/src/lib/schemas/pensionerSchema.ts` matching backend validation rules
- [ ] T080 [P] [US3] Create client-side financial computation utility in `apps/frontend/src/lib/financial-calculations.ts` mirroring backend formulas for real-time updates
- [ ] T081 [US3] Add route for `/pensioners/add` in `apps/frontend/src/App.tsx`
- [ ] T082 [P] [US3] Create tests in `apps/frontend/src/components/pensioners/form/__tests__/FinancialSummaryCard.test.tsx` and `AddPensionerPage.test.tsx`

**Checkpoint**: US3 complete — users can add pensioners through a validated form with live computation preview

---

## Phase 6: User Story 6 — Search and Global Quick Search (P2)

**Goal**: Users search pensioner records using global header search and detailed table filters

**Independent Test**: Type a query in the global search box and verify matching results appear

### Backend — Search

- [ ] T083 [P] [US6] Create `SearchController` in `apps/backend/app/Http/Controllers/Api/SearchController.php` with `search()` method querying pensioners table via full-text index on name, serial_number, account_number, with LIKE fallback for rank, agency, status
- [ ] T084 [US6] Register `GET /api/search` route in `apps/backend/routes/api.php`
- [ ] T085 [P] [US6] Create Feature test in `apps/backend/tests/Feature/Api/SearchTest.php` for search with various query types

### Frontend — Search

- [ ] T086 [P] [US6] Create `GlobalSearch` component in `apps/frontend/src/components/shared/GlobalSearch.tsx` with debounced input, dropdown results, keyboard navigation
- [ ] T087 [US6] Integrate `GlobalSearch` into the `Header` component in `apps/frontend/src/components/layout/Header.tsx`
- [ ] T088 [P] [US6] Create search service hook in `apps/frontend/src/services/search.ts`
- [ ] T089 [P] [US6] Create tests in `apps/frontend/src/components/shared/__tests__/GlobalSearch.test.tsx`

**Checkpoint**: US6 complete — global search in header returns matching results with keyboard navigation

---

## Phase 7: User Story 4 — Bulk Upload Reports (P2)

**Goal**: Finance officers upload pension data in bulk from TXT, CSV, or Excel files with validation and preview

**Independent Test**: Upload a valid CSV and verify records appear in the pensioners table after confirmation

### Backend — Upload

- [ ] T090 [P] [US4] Create `UploadController` in `apps/backend/app/Http/Controllers/Api/UploadController.php` with `upload()` method accepting multipart file, parsing via Laravel Excel
- [ ] T091 [P] [US4] Create `UploadValidationService` in `apps/backend/app/Services/UploadValidationService.php` with methods for duplicate detection, missing column detection, format validation, error summary generation
- [ ] T092 [US4] Add `preview()` method to `UploadController` returning parsed rows, detected columns, errors, and duplicates
- [ ] T093 [US4] Add `confirm()` method to `UploadController` that bulk-inserts validated records with upload_batch_id reference
- [ ] T094 [P] [US4] Add `history()` method to `UploadController` returning paginated list of past upload batches
- [ ] T095 [US4] Register upload routes in `apps/backend/routes/api.php`: `POST /api/uploads`, `GET /api/uploads/preview`, `POST /api/uploads/{upload}/confirm`, `GET /api/uploads`, `GET /api/uploads/{id}`
- [ ] T096 [P] [US4] Create Feature tests in `apps/backend/tests/Feature/Api/UploadTest.php` for file upload, preview, confirm, and history

### Frontend — Upload

- [ ] T097 [P] [US4] Create `FileDropzone` component in `apps/frontend/src/components/upload/FileDropzone.tsx` with drag-and-drop support for TXT, CSV, XLSX files
- [ ] T098 [P] [US4] Create `UploadPreviewTable` component in `apps/frontend/src/components/upload/UploadPreviewTable.tsx` showing parsed rows with validation status
- [ ] T099 [P] [US4] Create `ColumnMappingWizard` component in `apps/frontend/src/components/upload/ColumnMappingWizard.tsx` for matching file columns to system fields
- [ ] T100 [P] [US4] Create `ErrorSummary` component in `apps/frontend/src/components/upload/ErrorSummary.tsx` highlighting problematic rows
- [ ] T101 [P] [US4] Create `ImportHistory` component in `apps/frontend/src/components/upload/ImportHistory.tsx` listing past uploads
- [ ] T102 [US4] Create `UploadPage` in `apps/frontend/src/pages/UploadPage.tsx` composing all upload components
- [ ] T103 [US4] Add route for `/upload` in `apps/frontend/src/App.tsx`
- [ ] T104 [P] [US4] Create tests in `apps/frontend/src/components/upload/__tests__/FileDropzone.test.tsx` and upload flow test

**Checkpoint**: US4 complete — users can upload files, preview, map columns, and import pensioner records

---

## Phase 8: User Story 5 — Recovery Ledger and Collection Tracking (P2)

**Goal**: Finance officers track partial recovery payments through a slide-over installment ledger

**Independent Test**: Set a pensioner status to "recovered-but-inc", add an installment, and verify the ledger panel and progress bar

### Backend — Recovery

- [ ] T105 [P] [US5] Create `RecoveryController` in `apps/backend/app/Http/Controllers/Api/RecoveryController.php` with `installments()` method listing all installments for a pensioner
- [ ] T106 [US5] Add `storeInstallment()` method to `RecoveryController` that creates a new installment, recalculates running_balance, and updates pensioner amount_collected
- [ ] T107 [US5] Add `exportPdf()` method to `RecoveryController` generating a PDF of the recovery ledger via DOMPDF
- [ ] T108 [US5] Register recovery routes in `apps/backend/routes/api.php`: `GET /api/pensioners/{pensioner}/installments`, `POST /api/pensioners/{pensioner}/installments`, `GET /api/pensioners/{pensioner}/installments/export-pdf`
- [ ] T109 [P] [US5] Create Feature tests in `apps/backend/tests/Feature/Api/RecoveryTest.php` for installment creation, running balance calculation, and PDF export

### Frontend — Recovery

- [ ] T110 [P] [US5] Create `RecoveryLedgerPanel` component in `apps/frontend/src/components/recovery/RecoveryLedgerPanel.tsx` as a shadcn Sheet slide-over with installment table
- [ ] T111 [P] [US5] Create `InstallmentTable` component in `apps/frontend/src/components/recovery/InstallmentTable.tsx` showing installment no, date, amount, running balance, collector, remarks
- [ ] T112 [P] [US5] Create `CollectionProgressBar` component in `apps/frontend/src/components/recovery/CollectionProgressBar.tsx` with progress percentage
- [ ] T113 [P] [US5] Create `PaymentTimeline` component in `apps/frontend/src/components/recovery/PaymentTimeline.tsx` showing chronological payment history
- [ ] T114 [P] [US5] Create `RemainingBalanceCard` component in `apps/frontend/src/components/recovery/RemainingBalanceCard.tsx` showing remaining balance and expected completion date
- [ ] T115 [US5] Integrate recovery ledger panel trigger into StatusBadge component (opens sheet on click when status = recovered-but-inc)
- [ ] T116 [US5] Create `RecoveryLedgerPage` in `apps/frontend/src/pages/RecoveryLedgerPage.tsx`
- [ ] T117 [US5] Add route for `/recovery-ledger` in `apps/frontend/src/App.tsx`
- [ ] T118 [P] [US5] Create tests for recovery ledger components

**Checkpoint**: US5 complete — clicking "Recovered But Inc." badge opens installment ledger with progress tracking

---

## Phase 9: User Story 7 — Reports Generation (P3)

**Goal**: Finance officers generate and export reports in PDF, Excel, CSV, and printable formats

**Independent Test**: Generate a monthly report and export it as CSV, then verify the file contains the expected data

### Backend — Reports

- [ ] T119 [P] [US7] Create `ReportController` in `apps/backend/app/Http/Controllers/Api/ReportController.php` with `generate()` method accepting type, date range, group_by, format parameters
- [ ] T120 [P] [US7] Create `ReportGenerationService` in `apps/backend/app/Services/ReportGenerationService.php` with methods for overpayment summary reports, recovery performance, agency breakdowns, status distributions
- [ ] T121 [US7] Implement CSV export using Laravel Excel (Maatwebsite\Excel)
- [ ] T122 [US7] Implement Excel export using Laravel Excel with formatted columns and headers
- [ ] T123 [US7] Implement PDF export using barryvdh/laravel-dompdf with styled HTML template
- [ ] T124 [US7] Implement printable view returning clean HTML layout
- [ ] T125 [US7] Register `GET /api/reports/generate` route in `apps/backend/routes/api.php`
- [ ] T126 [P] [US7] Create Feature tests in `apps/backend/tests/Feature/Api/ReportTest.php` for all export formats

### Frontend — Reports

- [ ] T127 [P] [US7] Create `ReportBuilder` component in `apps/frontend/src/components/reports/ReportBuilder.tsx` with type selector, date range picker, group-by options
- [ ] T128 [P] [US7] Create `ExportOptions` component in `apps/frontend/src/components/reports/ExportOptions.tsx` with PDF/Excel/CSV/Print buttons
- [ ] T129 [P] [US7] Create `ReportPreview` component in `apps/frontend/src/components/reports/ReportPreview.tsx` showing data table in report format
- [ ] T130 [US7] Create `ReportsPage` in `apps/frontend/src/pages/ReportsPage.tsx`
- [ ] T131 [US7] Add route for `/reports` in `apps/frontend/src/App.tsx`

**Checkpoint**: US7 complete — users can generate reports and export in multiple formats

---

## Phase 10: User Story 8 — Alerts and Notifications (P3)

**Goal**: Finance admins see color-coded system alerts in the notification center

**Independent Test**: Create a pensioner with late death report condition and verify an alert appears

### Backend — Alerts

- [ ] T132 [P] [US8] Create `AlertController` in `apps/backend/app/Http/Controllers/Api/AlertController.php` with `index()`, `markRead()`, `markAllRead()` methods
- [ ] T133 [P] [US8] Create `AlertService` in `apps/backend/app/Services/AlertService.php` with check methods for: late death reports, large overpayments, duplicate pensioners, duplicate accounts, missing collections, negative balances, collection due dates, system errors
- [ ] T134 [US8] Create `CheckAlerts` console command in `apps/backend/app/Console/Commands/CheckAlerts.php` that runs AlertService checks and persists alerts to database
- [ ] T135 [US8] Register scheduled task in `apps/backend/app/Console/Kernel.php` to run `alerts:check` hourly
- [ ] T136 [US8] Register alert routes in `apps/backend/routes/api.php`: `GET /api/alerts`, `POST /api/alerts/{id}/read`, `POST /api/alerts/read-all`
- [ ] T137 [P] [US8] Create Feature tests in `apps/backend/tests/Feature/Api/AlertTest.php` for alert generation and reading

### Frontend — Alerts

- [ ] T138 [P] [US8] Create `NotificationCenter` component in `apps/frontend/src/components/alerts/NotificationCenter.tsx` as a dropdown with alert list grouped by severity
- [ ] T139 [P] [US8] Create `AlertBadge` component in `apps/frontend/src/components/alerts/AlertBadge.tsx` for the header notification icon with unread count
- [ ] T140 [US8] Integrate `NotificationCenter` and `AlertBadge` into `Header` component in `apps/frontend/src/components/layout/Header.tsx`
- [ ] T141 [US8] Create `AlertsPage` in `apps/frontend/src/pages/AlertsPage.tsx` with full alert history
- [ ] T142 [US8] Add route for `/alerts` in `apps/frontend/src/App.tsx`

**Checkpoint**: US8 complete — alerts are generated automatically and shown in the notification center

---

## Phase 11: User Story 9 — User Management and RBAC (P3)

**Goal**: Super admins manage users, roles, permissions, and view the role matrix

**Independent Test**: Create a new user with Viewer role and verify they cannot access add pensioner features

### Backend — User Management

- [ ] T143 [P] [US9] Create `UserController` in `apps/backend/app/Http/Controllers/Api/UserController.php` with `index()`, `store()`, `update()`, `destroy()`, `resetPassword()`, `toggle2fa()` methods — all restricted to Super Admin
- [ ] T144 [P] [US9] Create `RoleController` in `apps/backend/app/Http/Controllers/Api/RoleController.php` with `index()` and `matrix()` methods returning roles with permissions grid
- [ ] T145 [P] [US9] Create `StoreUserRequest` in `apps/backend/app/Http/Requests/StoreUserRequest.php` with validation
- [ ] T146 [P] [US9] Create `UpdateUserRequest` in `apps/backend/app/Http/Requests/UpdateUserRequest.php`
- [ ] T147 [US9] Register user management routes in `apps/backend/routes/api.php`: `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`, `POST /api/users/{id}/reset-password`, `POST /api/users/{id}/toggle-2fa`, `GET /api/roles`, `GET /api/roles/matrix`
- [ ] T148 [P] [US9] Create Feature tests in `apps/backend/tests/Feature/Api/UserManagementTest.php` for CRUD and role-based access
- [ ] T149 [P] [US9] Create Feature tests verifying RBAC middleware blocks unauthorized actions (e.g., Viewer cannot create pensioners)

### Frontend — User Management

- [ ] T150 [P] [US9] Create `UserList` component in `apps/frontend/src/components/users/UserList.tsx` with data table, filters, pagination
- [ ] T151 [P] [US9] Create `UserForm` component in `apps/frontend/src/components/users/UserForm.tsx` for create/edit with role selection
- [ ] T152 [P] [US9] Create `RoleMatrix` component in `apps/frontend/src/components/users/RoleMatrix.tsx` showing permissions grid
- [ ] T153 [US9] Create `UserManagementPage` in `apps/frontend/src/pages/UserManagementPage.tsx`
- [ ] T154 [US9] Add route for `/users` in `apps/frontend/src/App.tsx`

**Checkpoint**: US9 complete — super admins manage users and roles, RBAC enforced on all operations

---

## Phase 12: User Story 10 — Settings and Configuration (P3)

**Goal**: Finance admins configure financial rules, notification channels, and system preferences

**Independent Test**: Update a calculation rule and verify new computations use the updated value

### Backend — Settings

- [ ] T155 [P] [US10] Create `SettingController` in `apps/backend/app/Http/Controllers/Api/SettingController.php` with `index()`, `update()`, `backup()`, `restore()` methods
- [ ] T156 [US10] Add `index()` method to `SettingController` returning all settings grouped by category
- [ ] T157 [US10] Add `update()` method accepting array of `{group, key, value}` objects
- [ ] T158 [P] [US10] Create `backup()` method that creates a database dump or export
- [ ] T159 [P] [US10] Create `restore()` method that imports a backup file
- [ ] T160 [US10] Register setting routes in `apps/backend/routes/api.php`: `GET /api/settings`, `PUT /api/settings`, `POST /api/settings/backup`, `POST /api/settings/restore`
- [ ] T161 [P] [US10] Create Feature tests in `apps/backend/tests/Feature/Api/SettingTest.php`

### Frontend — Settings

- [ ] T162 [P] [US10] Create `FinancialRulesSection` in `apps/frontend/src/components/settings/FinancialRulesSection.tsx`
- [ ] T163 [P] [US10] Create `NotificationSettingsSection` in `apps/frontend/src/components/settings/NotificationSettingsSection.tsx`
- [ ] T164 [P] [US10] Create `AuditSettingsSection` in `apps/frontend/src/components/settings/AuditSettingsSection.tsx`
- [ ] T165 [P] [US10] Create `SystemPreferencesSection` in `apps/frontend/src/components/settings/SystemPreferencesSection.tsx`
- [ ] T166 [P] [US10] Create `BackupRestoreSection` in `apps/frontend/src/components/settings/BackupRestoreSection.tsx`
- [ ] T167 [US10] Create `SettingsPage` in `apps/frontend/src/pages/SettingsPage.tsx` with tabs for each section
- [ ] T168 [US10] Add route for `/settings` in `apps/frontend/src/App.tsx`

**Checkpoint**: US10 complete — admins can configure system settings and trigger backup/restore

---

## Phase 13: Activity Logs (Cross-Cutting)

- [ ] T169 [P] Create `AuditLogController` in `apps/backend/app/Http/Controllers/Api/AuditLogController.php` with `index()` method supporting filters by user_id, action, entity_type, date range
- [ ] T170 [US9] Register `GET /api/audit-logs` route in `apps/backend/routes/api.php`
- [ ] T171 [P] Create `ActivityLogsPage` in `apps/frontend/src/pages/ActivityLogsPage.tsx` with data table and filters
- [ ] T172 Add route for `/activity-logs` in `apps/frontend/src/App.tsx`

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T173 [P] Add loading skeleton components for all pages and data tables
- [ ] T174 [P] Add empty-state components for all data views (no pensioners, no alerts, no uploads)
- [ ] T175 [P] Add error boundary components wrapping each page
- [ ] T176 [P] Add dark mode support to the layout shell and all components via Tailwind dark mode class strategy
- [ ] T177 [P] Add keyboard shortcuts (Ctrl+K for search, etc.) throughout the application
- [ ] T178 [P] Add responsive layout adjustments for tablet and mobile views
- [ ] T179 [P] Add pagination component shared across all data tables
- [ ] T180 [P] Add context menu (right-click) on pensioner table rows with quick actions
- [ ] T181 [P] Run full backend test suite: `cd apps/backend && php artisan test`
- [ ] T182 [P] Run full frontend test suite: `cd apps/frontend && npx vitest run`
- [ ] T183 [P] Run backend static analysis: `cd apps/backend && ./vendor/bin/phpstan analyse --level=6`
- [ ] T184 [P] Run frontend type check: `cd apps/frontend && npx tsc --noEmit`
- [ ] T185 [P] Run frontend lint: `cd apps/frontend && npm run lint`
- [ ] T186 [P] Validate all quickstart.md scenarios pass end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3-12)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - US6 (Search/P2) can be done early as it only adds search endpoints
- **Activity Logs (Phase 13)**: Depends on foundational audit infrastructure
- **Polish (Phase 14)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 Dashboard (P1)**: Can use seed/factory data — no hard dependency on US2
- **US2 Pensioner Data (P1)**: Core CRUD — enables data for all stories
- **US3 Add Form (P1)**: Uses same Pensioner model and controller as US2
- **US4 Upload (P2)**: Depends on Pensioner model — imports into pensioners table
- **US5 Recovery (P2)**: Depends on Pensioner model (installments FK to pensioners)
- **US6 Search (P2)**: Depends on Pensioner model and indexes
- **US7 Reports (P3)**: Depends on Pensioner + Collection data
- **US8 Alerts (P3)**: Depends on Pensioner model — no hard dependency on other stories
- **US9 Users (P3)**: Depends on Roles table (foundational) — largely independent
- **US10 Settings (P3)**: Largely independent — uses settings table (foundational)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints/controllers
- Backend API before frontend integration
- Component before page

### Parallel Opportunities

- All tasks within a phase marked [P] can run in parallel
- Setup Phase: All 4 tasks can run in parallel
- Foundational Phase: Many migration tasks can run in parallel with model tasks
- Within each user story: [P]-marked tasks can run concurrently
- US9 (User Management) and US10 (Settings) can run in parallel as they share minimal dependencies

---

## Parallel Example: User Story 1 (Dashboard)

```bash
# Backend: DashboardController + tests in parallel
Task: "Create DashboardController in apps/backend/app/Http/Controllers/Api/DashboardController.php"
Task: "Create OverpaymentCalculationService in apps/backend/app/Services/OverpaymentCalculationService.php"

# Frontend: Chart components in parallel
Task: "Create KpiCard component in apps/frontend/src/components/dashboard/KpiCard.tsx"
Task: "Create MonthlyOverpaymentChart in apps/frontend/src/components/dashboard/MonthlyOverpaymentChart.tsx"
Task: "Create OverpaymentByRankChart in apps/frontend/src/components/dashboard/OverpaymentByRankChart.tsx"
Task: "Create StatusDistributionChart in apps/frontend/src/components/dashboard/StatusDistributionChart.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1-4)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (migrations, models, RBAC, auth, layout shell)
3. Complete US2: Pensioner Data Table (P1) — core data management
4. **STOP and VALIDATE**: Pensioner CRUD works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. + US2 (Pensioner Table) → Core data management → Deploy/Demo
3. + US3 (Add Form) → Data entry capability → Deploy/Demo
4. + US1 (Dashboard) → Executive visibility → Deploy/Demo (MVP!)
5. + US6 (Search) → Fast lookup → Deploy/Demo
6. + US4 (Upload) → Bulk processing → Deploy/Demo
7. + US5 (Recovery) → Collection tracking → Deploy/Demo
8. + US7-10 (Reports, Alerts, Users, Settings) → Full enterprise features

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Developer A: US2 (Pensioner Data) + US3 (Add Form)
   - Developer B: US1 (Dashboard) + US6 (Search)
   - Developer C: US4 (Upload) + US5 (Recovery)
3. All P1 features complete → integrate and test
4. Developer A: US9 (Users) + US10 (Settings)
5. Developer B: US7 (Reports)
6. Developer C: US8 (Alerts)
7. Team: Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- Tests are MANDATORY per constitution: Pest for backend, Vitest for frontend
- Minimum coverage: 80% backend, 70% frontend
- Contract tests required for every API endpoint
- All API responses must follow `{ success, data, error }` envelope
- Commit after each task or logical group
- Run full test suite before each merge
