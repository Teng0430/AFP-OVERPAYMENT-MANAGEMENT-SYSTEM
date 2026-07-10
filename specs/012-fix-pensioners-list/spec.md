# Feature Specification: Fix Pensioners List

**Feature Branch**: `012-fix-pensioners-list`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Investigate and redesign the Pensioners List page based on 10 identified issues including incorrect data display, computation errors, poor table layout, lack of responsiveness, and missing record management actions."

## User Scenarios & Testing

### User Story 1 - View Accurate Pensioner Records (Priority: P1)

As a system user, I want to view all pensioner records in the list with correct data so that I can trust the information displayed and make informed decisions.

**Why this priority**: Data accuracy is the foundation of the entire page — without it, all other features are meaningless.

**Independent Test**: Can be fully tested by comparing every field in the Pensioners List against the corresponding Add Pensioner form data and database records for the same pensioner.

**Acceptance Scenarios**:

1. **Given** a pensioner record exists in the database, **When** the Pensioners List page loads, **Then** each field (Rank, Name, Serial Number, Agency, Last Payment, Monthly Pension, Cause, Agencies, Overpayment, Collected, Balance, Status) matches the saved record exactly.
2. **Given** a pensioner has an overpayment computed as Monthly Pension × Number of Months Overpaid, **When** the list displays, **Then** the Overpayment column shows the correct computed value identical to the record.
3. **Given** a pensioner has a balance calculated as Overpayment minus Total Collected, **When** the list displays, **Then** the Balance column shows the correct value identical to the saved record.
4. **Given** a pensioner's last payment date is stored as a raw timestamp, **When** the list displays, **Then** the Last Payment column shows a human-readable formatted date in the application's standard format.

---

### User Story 2 - Manage Individual Pensioner Records (Priority: P1)

As a system user, I want to view, edit, print, and delete individual pensioner records from the list so that I can manage the complete lifecycle of overpayment records.

**Why this priority**: Record management is the core workflow — without it users cannot act on the displayed data.

**Independent Test**: Can be fully tested by performing each action (View, Edit, Print, Delete) on a single record and verifying the expected outcome.

**Acceptance Scenarios**:

1. **Given** a pensioner record exists, **When** the user clicks the View action, **Then** a detailed view (page or modal) shows all pensioner information including Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status, Supporting Documents, Timeline, and Audit History.
2. **Given** a pensioner record exists, **When** the user clicks the Edit action, **Then** an edit form opens prepopulated with the pensioner's data using the same layout and validation rules as the Add Pensioner form.
3. **Given** a pensioner record exists, **When** the user clicks the Print action, **Then** a printable Pensioner Summary is generated with Header, AFP Pension Overpayment Monitoring System title, Pensioner Details, Agency Summary, Financial Summary (Overpayment, Collected, Remaining Balance, Status), and Generated Date.
4. **Given** a pensioner record exists, **When** the user clicks the Delete action, **Then** a confirmation dialog appears reading "Are you sure you want to delete this pensioner?" and the record is deleted only after confirmation, with the table refreshing afterward.

---

### User Story 3 - Navigate and Find Records Efficiently (Priority: P2)

As a system user, I want to search, filter, sort, and paginate through the Pensioners List so that I can quickly find specific records even when the dataset is large.

**Why this priority**: The page is usable without these features for small datasets, but becomes impractical as records grow.

**Independent Test**: Can be tested independently by verifying search returns matching records, filters narrow results correctly, sorting reorders columns, and pagination shows the correct subset of records.

**Acceptance Scenarios**:

1. **Given** the Pensioners List is displayed, **When** the user types in the search field, **Then** the list filters to show only records matching the search term.
2. **Given** the Pensioners List is displayed, **When** the user clicks a sortable column header (Name, Rank, Agency, Balance, Status, Last Payment), **Then** the list reorders by that column in ascending or descending order.
3. **Given** the Pensioners List has many records, **When** the user navigates to the next page, **Then** the next set of records is displayed without reloading the page.
4. **Given** filter controls are available, **When** the user selects filter criteria, **Then** only matching records are displayed.

---

### User Story 4 - Use the Table on Any Device (Priority: P3)

As a system user, I want the Pensioners List to be usable on desktop, laptop, tablet, and mobile devices so that I can access the information regardless of my device.

**Why this priority**: The primary use case is desktop, but the page should not break on smaller screens.

**Independent Test**: Can be tested by loading the page at various screen widths (desktop 1920px, laptop 1366px, tablet 768px, mobile 375px) and verifying no overlapping text, no clipped buttons, no hidden actions, and horizontal scrolling for overflow content.

**Acceptance Scenarios**:

1. **Given** the Pensioners List is displayed on a desktop or laptop screen, **When** the screen width is 1024px or wider, **Then** all columns fit without horizontal overflow and the table is fully readable.
2. **Given** the Pensioners List is displayed on a tablet screen, **When** the screen width is between 768px and 1023px, **Then** horizontal scrolling is available without breaking the layout.
3. **Given** the Pensioners List is displayed on a mobile screen, **When** the screen width is less than 768px, **Then** the table remains usable with horizontal scrolling and no content is cut off or overlapping.

---

### Edge Cases

- What happens when a pensioner record has zero overpayment? The Overpayment and Balance columns should display 0.00 or the equivalent zero value.
- What happens when a pensioner record has no collection history? The Collected column should display 0.00.
- What happens when the last payment date is null or missing? The Last Payment column should display "N/A" or an equivalent placeholder.
- What happens when the search returns no results? The table should display a clear empty state message such as "No pensioners found."
- What happens when the user attempts to delete a record that has already been deleted by another user? The system should display an appropriate error message and refresh the list.
- What happens when network connectivity is lost during View, Edit, Print, or Delete actions? The system should display a network error message without data loss.
- What happens when a pensioner has no agencies assigned? The Agencies column should show "None" and the agency summary should indicate no agencies.
- What happens when editing a pensioner and the data conflicts with another user's concurrent edit? The system should detect the conflict and notify the user.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display the Last Payment date in a human-readable format using the application's standard date format (e.g., "March 31, 2026" or "03/31/2026"), never as a raw database timestamp.
- **FR-002**: System MUST display the Overpayment value exactly as computed and saved in the database, matching the formula: Monthly Pension × Number of Months Overpaid.
- **FR-003**: System MUST display the Balance value exactly as computed and saved in the database, matching the formula: Overpayment − Total Collected.
- **FR-004**: System MUST NOT perform independent recalculations of Overpayment or Balance on the frontend; all displayed financial values must come from the authoritative backend source.
- **FR-005**: System MUST display all agencies associated with a pensioner (e.g., LPB, ALIP, AFPSLAI) in a summarized view without cluttering the table.
- **FR-006**: System MUST include a View action for each pensioner that opens a detailed view (page or modal) containing: Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status, Supporting Documents, Timeline, and Audit History.
- **FR-007**: System MUST include an Edit action for each pensioner that opens an edit form prepopulated with all existing data, using the same layout and validation rules as the Add Pensioner form.
- **FR-008**: System MUST include a Print action for each pensioner that generates a browser-printable and PDF-exportable Pensioner Summary containing: Header with "AFP Pension Overpayment Monitoring System", Pensioner Details, Agency Summary, Financial Summary (Overpayment, Collected, Remaining Balance, Status), and Generated Date.
- **FR-009**: System MUST include a Delete action for each pensioner that shows a confirmation dialog ("Are you sure you want to delete this pensioner?") and only deletes the record after explicit user confirmation, with the table refreshing after successful deletion.
- **FR-010**: System MUST freeze important columns (Selection checkbox, Name, Serial Number, Actions) horizontally so they remain visible when scrolling the table.
- **FR-011**: System MUST support sorting on the following columns: Name, Rank, Agency, Balance, Status, Last Payment.
- **FR-012**: System MUST support pagination to navigate through large datasets without full page reloads.
- **FR-013**: System MUST support free-text search across pensioner records.
- **FR-014**: System MUST support filtering to narrow displayed records by relevant criteria.
- **FR-015**: System MUST implement responsive table behavior so that data remains usable across desktop, laptop, tablet, and mobile screen sizes without overlapping text, clipped buttons, or hidden actions.
- **FR-016**: System MUST prevent text overflow in table cells using ellipsis with tooltips, wrapping where appropriate, or other non-destructive overflow handling.
- **FR-017**: System MUST display every field in the pensioners table exactly as entered in the Add Pensioner form: Rank, Name, Serial Number, Agency, Last Payment, Monthly Pension, Cause, Agencies, Overpayment, Collected, Balance, and Status — with no transformation errors.
- **FR-018**: All date fields throughout the application MUST use the same standard date format.

### Key Entities

- **Pensioner**: An individual pensioner record containing personal information (Rank, Name, Serial Number), financial data (Monthly Pension, Overpayment, Collected, Balance, Status), and associated metadata (Agencies, Cause, Last Payment).
- **Agency**: A funding or service agency associated with a pensioner (e.g., LPB, ALIP, AFPSLAI). A pensioner may have multiple agencies.
- **Overpayment**: The computed total of overpaid pension amount, calculated as Monthly Pension × Number of Months Overpaid.
- **Collection**: A payment collected from the pensioner toward the overpayment. Total Collected is the sum of all collection entries.
- **Balance**: The remaining overpayment balance, calculated as Overpayment minus Total Collected.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every field in the Pensioners List matches the corresponding field in the Add Pensioner form and database record 100% of the time — no display discrepancies.
- **SC-002**: The Overpayment and Balance columns always display values identical to what was saved in the database — no frontend recalculations occur.
- **SC-003**: Users can View, Edit, Print, and Delete any pensioner record in 3 clicks or fewer from the list.
- **SC-004**: The table loads and is fully interactive on desktop (1920px), laptop (1366px), tablet (768px), and mobile (375px) viewport widths without layout breakage.
- **SC-005**: Search returns matching results in under 2 seconds, and pagination transitions are instant for datasets of up to 10,000 records.
- **SC-006**: The incorrect raw timestamp format (e.g., "2026-03-31T00:00:00.000000Z") no longer appears anywhere in the application — all dates use the standard format.
- **SC-007**: Agency display is complete and informative — users can see all associated agencies without needing to navigate away from the list.

## Assumptions

- The existing backend API provides all pensioner data including computed Overpayment and Balance values in the API response.
- The Add Pensioner form correctly computes and saves Overpayment and Balance to the database.
- The application already has a standard date format defined or the team can agree on one (e.g., "Month DD, YYYY").
- The existing database schema supports all required fields including agency associations and collection history.
- The application has an icon library that can provide action icons for View, Edit, Print, and Delete.
- Browser print functionality (window.print) is acceptable for the Print feature; no external PDF library is required.
- Sorting, search, and filtering can be implemented either client-side or server-side and will be determined during planning.
