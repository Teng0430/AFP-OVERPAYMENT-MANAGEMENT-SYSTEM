# Feature Specification: Pension Overpayment Monitoring System

**Feature Branch**: `005-pension-overpayment-system`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Build a Production-Ready Enterprise Web Application for the Finance Center, Armed Forces of the Philippines (AFP) — AFP Pension Overpayment Monitoring System (POMS). The system monitors pension overpayments caused by late death reporting, remarried pensioners, prior marriage cases, termination of benefits, and other pension suspension cases. Includes executive dashboard, pensioner management, bulk upload, recovery ledger, reports, alerts, user management, and settings."

## User Scenarios & Testing

### User Story 1 - Executive Dashboard Overview (Priority: P1)

A finance officer logs in and sees an executive dashboard with key performance indicators (KPIs) showing the current state of pension overpayment monitoring. The dashboard displays summary cards (total pensioners, active monitoring cases, total overpayment, amount collected, outstanding balance, recovery rate) each with trend indicators and sparklines. Below the KPIs, analytics charts show monthly overpayment trends, overpayment by rank, status distribution, and collection progress.

**Why this priority**: The dashboard is the primary landing page for all users — it provides immediate situational awareness for financial decision-making.

**Independent Test**: Can be fully tested by logging in as any role and verifying the dashboard loads with accurate KPI values derived from real pensioner data.

**Acceptance Scenarios**:

1. **Given** a user with an active session, **When** they log in, **Then** they are taken to the dashboard showing KPI summary cards.
2. **Given** the dashboard is loaded, **When** there are pensioners with overpayments, **Then** each KPI card displays the correct computed value with a trend indicator.
3. **Given** the dashboard analytics section, **When** a user views it, **Then** they see at least the line chart (monthly overpayment trend), bar chart (overpayment by rank), and pie chart (status distribution).
4. **Given** the dashboard, **When** there is no data yet, **Then** empty-state placeholders are shown instead of broken charts.

---

### User Story 2 - Pensioner Data Management (Priority: P1)

A finance officer views, searches, and manages the pensioners list in an enterprise-grade data table. Each row shows rank, name, serial number, account number, date of death, cause of stoppage, agency, monthly pension, computed overpayment fields, amounts collected, balance, and status. All financial computations (computation of days, computation in months, overpayment subtotal, overpayment total, balance) update automatically based on the input values. Users can filter by rank, agency, status, date range, and amount range.

**Why this priority**: The pensioner table is the core data repository — all other features depend on accurate pensioner records with correct financial computations.

**Independent Test**: Can be tested by adding a pensioner record, entering values for monthly pension, fractional days, whole months, and amount collected, then verifying all computed fields display correctly.

**Acceptance Scenarios**:

1. **Given** the pensioners list page, **When** a user opens it, **Then** they see a data table with all required columns including auto-computed financial fields.
2. **Given** a user enters monthly pension and fractional days, **When** they save the record, **Then** the "Computation of Days" field equals monthly pension multiplied by fractional value.
3. **Given** a user enters monthly pension and whole months, **When** they save, **Then** the "Computation in Months" field equals monthly pension multiplied by whole months.
4. **Given** computed values for days and months, **When** both are present, **Then** overpayment subtotal equals computation of days plus computation in months.
5. **Given** an overpayment subtotal and amount collected, **When** the user saves, **Then** balance equals overpayment total minus amount collected.
6. **Given** two records with the same pensioner name, **When** either record is viewed, **Then** overpayment total shows the sum of both records' overpayment subtotals.
7. **Given** the data table, **When** a user applies filters (rank, agency, status), **Then** only matching rows are displayed.
8. **Given** a user views a pensioner with status "Recovered But Inc.", **When** they click the badge, **Then** a slide-over ledger panel opens showing installment payment history.

---

### User Story 3 - Add Pensioner with Live Financial Summary (Priority: P1)

An encoder adds a new pensioner record through a multi-section form (Personal Information, Pension Information, Monitoring Information, Recovery Information). As the encoder fills in numeric fields (monthly pension, fractional days, whole months, amount collected), a live financial summary card on the right side updates in real time showing the subtotal, total, balance, and recovery percentage.

**Why this priority**: Adding pensioners is the most frequent data entry task — real-time feedback reduces errors and speeds up encoding.

**Independent Test**: Can be tested by opening the add pensioner form, filling all fields, and verifying the summary card updates immediately without requiring a page refresh or save.

**Acceptance Scenarios**:

1. **Given** the add pensioner form, **When** all required fields are filled, **Then** the form allows submission.
2. **Given** the add pensioner form, **When** monthly pension is entered, **Then** the live summary card shows the computed values.
3. **Given** the form is submitted successfully, **When** the system processes it, **Then** the pensioner appears in the data table.
4. **Given** the form, **When** required fields are missing, **Then** the submit button is disabled and validation errors are shown.
5. **Given** the add pensioner form, **When** a user enters an invalid rank or agency, **Then** the system shows a validation error.
6. **Given** the form, **When** a user enters a duplicate serial number, **Then** the system warns about potential duplication.

---

### User Story 4 - Bulk Upload Reports (Priority: P2)

A finance officer uploads pension data in bulk from TXT, CSV, or Excel files using drag-and-drop. The system validates records (duplicate detection, missing columns, wrong formats) and shows a preview of imported records before final confirmation. An error summary highlights problematic rows. A mapping wizard lets the user match file columns to system fields. Import history tracks all past uploads.

**Why this priority**: Bulk upload enables efficient processing of large batches of pensioner records from external sources.

**Independent Test**: Can be tested by uploading a valid CSV file with pensioner data and verifying the records appear in the data table after confirmation.

**Acceptance Scenarios**:

1. **Given** the upload page, **When** a user drags a CSV file onto the upload zone, **Then** the system parses and shows a preview of records.
2. **Given** an uploaded file with missing required columns, **When** the system validates it, **Then** an error summary shows which rows and columns failed.
3. **Given** an uploaded file with duplicate records, **When** validated, **Then** the system flags duplicates and asks the user how to handle them.
4. **Given** the upload preview, **When** the user confirms, **Then** all valid records are imported into the pensioners table.
5. **Given** a user views the upload history, **When** they open it, **Then** they see a list of past uploads with date, file name, record count, and status.

---

### User Story 5 - Recovery Ledger and Collection Tracking (Priority: P2)

A finance officer tracks partial recovery payments through the recovery ledger. When a pensioner's status is "Recovered But Inc.", clicking the badge opens a slide-over panel showing installment details (installment number, date, amount paid, running balance, collector, remarks), a progress bar with collection percentage, payment timeline, remaining balance, and expected completion date. The officer can print the ledger or export it as PDF.

**Why this priority**: Partial recoveries require detailed tracking to ensure complete collection and audit compliance.

**Independent Test**: Can be tested by assigning a pensioner "Recovered But Inc." status, adding installment payments, and verifying the ledger displays correctly with computed running balance and progress.

**Acceptance Scenarios**:

1. **Given** a pensioner with "Recovered But Inc." status, **When** a user clicks the status badge, **Then** a slide-over panel opens with the installment ledger.
2. **Given** the recovery ledger panel, **When** there are installment records, **Then** each row shows installment number, date, amount paid, running balance, collector, and remarks.
3. **Given** the recovery ledger, **When** installments exist, **Then** a progress bar and collection percentage are displayed.
4. **Given** the recovery ledger panel, **When** a user clicks "Print Ledger" or "Export PDF", **Then** the ledger is formatted for printing or downloaded as a PDF.

---

### User Story 6 - Search and Global Quick Search (Priority: P2)

Any user can search pensioner records using a global search box in the header or detailed filters in the data table. Global search searches across name, serial number, account number, agency, rank, status, and cause of stoppage. Multi-select filters allow narrowing by rank, agency, status, year, month, recovery status, amount range, and date range.

**Why this priority**: Finance officers handling thousands of records need fast, flexible search to locate specific pensioners.

**Independent Test**: Can be tested by searching for a known pensioner name in the global search box and confirming the result matches.

**Acceptance Scenarios**:

1. **Given** the global search in the header, **When** a user types a pensioner name, **Then** matching results appear in a dropdown.
2. **Given** search results, **When** a user clicks a result, **Then** they are taken to that pensioner's detail page.
3. **Given** the data table filter panel, **When** a user selects multiple ranks and a status, **Then** the table shows only matching records.
4. **Given** active filters, **When** a user clears them, **Then** the full record set is restored.

---

### User Story 7 - Reports Generation (Priority: P3)

A finance officer generates reports (daily, weekly, monthly, quarterly, annual, or custom date range) and exports them as PDF, Excel, CSV, or printable format. Reports include overpayment summaries, recovery performance, agency breakdowns, and status distributions.

**Why this priority**: Reporting is important but less critical than day-to-day operational features.

**Independent Test**: Can be tested by generating a monthly overpayment report and exporting it as CSV, then verifying the file contains the expected data.

**Acceptance Scenarios**:

1. **Given** the reports page, **When** a user selects "Monthly" and a month, **Then** the report preview shows data for that period.
2. **Given** a report preview, **When** a user clicks "Export as PDF", **Then** a PDF file is downloaded.
3. **Given** a report preview, **When** a user clicks "Export as Excel", **Then** an Excel file is downloaded.
4. **Given** the reports page, **When** a user selects a custom date range, **Then** data is filtered to that range.

---

### User Story 8 - Alerts and Notifications (Priority: P3)

A finance admin receives system alerts for late death reports, large overpayments, duplicate pensioners, duplicate accounts, missing collections, negative balances, collection due dates, and system errors. Alerts are color-coded (red, yellow, blue, green) by severity and appear in the notification center in the header.

**Why this priority**: Alerts help proactively identify issues but operational features come first.

**Acceptance Scenarios**:

1. **Given** the notification icon in the header, **When** there are unread alerts, **Then** a badge shows the count.
2. **Given** a user opens the notification center, **When** alerts are present, **Then** they are grouped by severity with color coding.
3. **Given** a late death report alert, **When** the conditions are met, **Then** the system creates an alert automatically.
4. **Given** a duplicate pensioner alert, **When** two records with the same name and serial number exist, **Then** the system flags them.

---

### User Story 9 - User Management and Role-Based Access (Priority: P3)

A super admin manages users, roles, permissions, departments, and account status. Six roles exist (Super Admin, Finance Admin, Finance Officer, Encoder, Viewer, Auditor) with different access levels. The admin can reset passwords, enable optional two-factor authentication, and view a role-matrix showing permissions per role.

**Why this priority**: User management is essential for multi-user systems but can follow initial data features.

**Acceptance Scenarios**:

1. **Given** the user management page, **When** a super admin opens it, **Then** they see a list of all users with their roles and status.
2. **Given** the user management page, **When** a super admin creates a new user, **Then** that user can log in with their credentials.
3. **Given** a user with the "Viewer" role, **When** they try to add a pensioner, **Then** the action is blocked.
4. **Given** the role matrix page, **When** a super admin views it, **Then** they see a grid of roles versus permissions.

---

### User Story 10 - Settings and Configuration (Priority: P3)

A finance admin configures system settings including financial rules (recovery rules, calculation rules, upload rules), notification settings (email, SMS), audit settings, and system preferences. Backup and restore functionality is available.

**Why this priority**: Settings are important for system administration but do not block core functionality.

**Acceptance Scenarios**:

1. **Given** the settings page, **When** a finance admin updates calculation rules, **Then** the changes apply to new computations.
2. **Given** the settings page, **When** a finance admin configures notification settings, **Then** alerts are sent via the configured channels.
3. **Given** the settings page, **When** a super admin initiates a backup, **Then** the system creates a backup without disrupting operations.

---

### Edge Cases

- What happens when the same pensioner name appears multiple times with different spellings (e.g., "Juan Dela Cruz" vs "Juan Dela Cruz Jr.")? Overpayment Total grouping uses exact name match; variations are treated as separate pensioners unless linked by serial number.
- What happens when a pensioner's monthly pension is zero or negative? The system rejects negative values and allows zero with a warning.
- What happens when the recovery ledger shows more amount collected than the overpayment total? The system prevents over-collection — balance cannot go below zero.
- What happens when a bulk upload has 100% invalid records? The system rejects the entire batch and shows a full error summary.
- What happens when two users try to edit the same pensioner record simultaneously? The last save wins, with a warning that another user may have overwritten changes.
- What happens when the user's session expires while filling a long form? Form data should be preserved locally until the user re-authenticates.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display an executive dashboard with KPI summary cards showing total pensioners, active monitoring cases, total overpayment, total amount collected, outstanding balance, recovery rate, newly uploaded records, pending verification, recovered accounts, and recovered but incomplete counts.
- **FR-002**: Each KPI card MUST include an icon, percentage trend indicator, and mini sparkline chart.
- **FR-003**: Dashboard MUST include at least three analytics charts: monthly overpayment trend (line chart), overpayment by rank (bar chart), and status distribution (pie chart).
- **FR-004**: System MUST provide a data table listing all pensioners with columns: number, rank, name, serial/control number, account number, date of death, cause of stoppage, agency name, monthly pension, agency deduction, days in month, number of months, computation of days in month, computation in months, overpayment subtotal, overpayment total, amount collected, date collected, balance, and status.
- **FR-005**: Rank MUST be selectable from a searchable dropdown containing all specified military ranks.
- **FR-006**: Agency name MUST be selectable from a dropdown containing all specified agency values.
- **FR-007**: Status MUST be one of: "Recovered", "Not Yet Recovered", or "Recovered But Inc."
- **FR-008**: System MUST automatically compute "Computation of Days" = monthly pension × fractional days value.
- **FR-009**: System MUST automatically compute "Computation in Months" = monthly pension × whole months.
- **FR-010**: System MUST automatically compute "Overpayment Subtotal" = computation of days + computation in months.
- **FR-011**: System MUST automatically compute "Overpayment Total" as the sum of all overpayment subtotals for records sharing the same pensioner name.
- **FR-012**: System MUST automatically compute "Balance" = overpayment total − amount collected.
- **FR-013**: All computed fields MUST update in real time as input values change, without requiring a page refresh or form submission.
- **FR-014**: System MUST provide a multi-section form to add new pensioners with sections: Personal Information, Pension Information, Monitoring Information, and Recovery Information.
- **FR-015**: The add pensioner form MUST include a live financial summary card on the right side showing real-time subtotal, total, balance, and recovery percentage.
- **FR-016**: System MUST support bulk upload of pensioner records from TXT, CSV, and Excel files via drag-and-drop.
- **FR-017**: Bulk upload MUST include: preview of imported records, duplicate detection, missing column detection, format validation, error summary, column mapping wizard, and import history.
- **FR-018**: When a pensioner's status is "Recovered But Inc.", clicking the status badge MUST open a slide-over panel showing the recovery installment ledger.
- **FR-019**: The recovery ledger panel MUST display: installment number, date, amount paid, running balance, collector, remarks, progress bar with collection percentage, payment timeline, remaining balance, and expected completion date.
- **FR-020**: The recovery ledger MUST support print and PDF export.
- **FR-021**: System MUST provide a global search in the header searching across name, serial number, account number, agency, rank, status, and cause of stoppage.
- **FR-022**: System MUST provide multi-select filters for rank, agency, status, year, month, recovery status, amount range, and date range.
- **FR-023**: System MUST support report generation for daily, weekly, monthly, quarterly, annual, and custom date ranges.
- **FR-024**: Reports MUST be exportable as PDF, Excel, CSV, and printable format.
- **FR-025**: System MUST generate color-coded alerts for: late death reports, large overpayments, duplicate pensioners, duplicate accounts, missing collections, negative balances, collection due dates, and system errors.
- **FR-026**: System MUST maintain an activity log tracking: login, logout, added record, edited record, deleted record, upload, export, and approval actions with user, timestamp, and IP address.
- **FR-027**: System MUST support six roles: Super Admin, Finance Admin, Finance Officer, Encoder, Viewer, Auditor — each with appropriate permissions.
- **FR-028**: Super Admin MUST be able to manage users: create, edit, deactivate, reset passwords, and configure two-factor authentication.
- **FR-029**: System MUST provide a settings page for: financial rules (recovery, calculation, upload rules), notification settings (email, SMS), audit settings, system preferences, backup, and restore.
- **FR-030**: System MUST enforce authentication and authorization on all pages and API endpoints.

### Key Entities

- **Pensioner**: A retired or separated AFP member whose pension benefits are being monitored. Key attributes include rank, name, serial number, account number, date of death, cause of stoppage, agency, monthly pension, agency deduction, fractional days, whole months, and amount collected. Each pensioner has computed financial fields (computation of days, computation in months, overpayment subtotal, overpayment total, balance) and a recovery status.
- **Overpayment**: The calculated amount of excess pension payments made to or on behalf of a pensioner due to late-reported stoppage events. Derived from the pensioner's monthly pension multiplied by the number of months and fractional days overpaid.
- **Recovery Installment**: An individual payment recorded against a pensioner's overpayment balance as part of a partial recovery plan. Part of the recovery ledger tracking collection progress.
- **User**: A system user with assigned role (Super Admin, Finance Admin, Finance Officer, Encoder, Viewer, Auditor) who can access the system within their permission scope.
- **Role**: A named set of permissions that controls what actions a user can perform within the system.
- **Upload Batch**: A group of pensioner records imported together from a single file (TXT, CSV, or Excel). Tracks import date, file name, record count, success/failure status, and error details.
- **Audit Log**: A chronological record of user actions (login, logout, create, edit, delete, upload, export, approval) including timestamp, user, and IP address.
- **Alert**: A system-generated notification about specific conditions (late death report, large overpayment, duplicate records, missing collection, negative balance, etc.) with color-coded severity levels.
- **Setting**: System-wide configuration values governing financial calculations, recovery rules, upload validation, notifications, and system preferences.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Finance officers can complete the full pensioner lifecycle (add → view → compute overpayment → track recovery) without switching between multiple systems.
- **SC-002**: Dashboard KPIs and charts render within 3 seconds of page load even when managing 10,000+ pensioner records.
- **SC-003**: All financial computations (computation of days, computation in months, overpayment subtotal, overpayment total, balance) are 100% accurate with no manual calculation required.
- **SC-004**: Bulk upload of 1,000 records completes (including validation and import) within 60 seconds.
- **SC-005**: Global search returns results within 2 seconds across a database of 10,000+ pensioner records.
- **SC-006**: Users of all six roles can complete their core tasks without encountering permission errors on authorized actions.
- **SC-007**: Recovery ledger slide-over panel opens within 1 second of clicking the status badge.
- **SC-008**: The system correctly prevents over-collection (balance below zero) in 100% of cases.
- **SC-009**: 90% of new users complete their primary task (search for a pensioner, view details) on their first attempt without assistance.

## Assumptions

- The six user roles (Super Admin, Finance Admin, Finance Officer, Encoder, Viewer, Auditor) cover all AFP Finance Center personnel who need system access.
- Rank and agency dropdown values are fixed as specified and do not require dynamic updates from external sources.
- "Overpayment Total" logic groups records by exact pensioner name match; name variations (e.g., suffixes, misspellings) require the serial number for accurate grouping.
- Financial computations use exact arithmetic without rounding until the final display value (rounded to two decimal places).
- The fractional days value represents a fraction of a month (e.g., 0.5 for 15 days).
- Bulk upload files are expected to be under 10MB per import to maintain performance.
- The system manages data within a single AFP Finance Center; cross-branch or multi-agency data sharing is out of scope for this feature.
- Existing authentication infrastructure from the previous feature (Sanctum-based token auth) provides the foundation for JWT-based RBAC.
- Dark mode is a display preference only and does not affect data visibility or accessibility compliance.
- Email and SMS notification channels require external service configuration (SMTP provider, SMS gateway) managed outside this feature.
