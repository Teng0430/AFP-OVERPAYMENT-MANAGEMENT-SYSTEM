# Feature Specification: Redesign Pensioners List

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description detailing 10 issues with the Pensioners List page covering incorrect data display, computation errors, poor table layout, lack of responsiveness, and missing record management actions.

## User Scenarios & Testing

### User Story 1 - View Accurate Pensioner Records (Priority: P1)

As a system user, I want all pensioner records displayed in the list with correct data matching what was entered in the Add Pensioner form so that I can trust the information and make informed decisions.

**Why this priority**: Data accuracy is foundational — without correct data, the page has no value.

**Independent Test**: Compare every field in the Pensioners List against the Add Pensioner form data and database records for the same pensioner. All fields must match exactly.

**Acceptance Scenarios**:

1. **Given** a pensioner record exists in the database, **When** the Pensioners List page loads, **Then** each displayed field (Rank, Name, Serial Number, Agency, Last Payment, Monthly Pension, Cause, Agencies, Overpayment, Collected, Balance, Status) matches the saved record exactly — no transformation errors.
2. **Given** a pensioner has an overpayment computed as Monthly Pension × Number of Months Overpaid, **When** the list displays, **Then** the Overpayment column shows the exact computed value saved in the database, not a frontend recalculation.
3. **Given** a pensioner has a balance calculated as Overpayment minus Total Collected, **When** the list displays, **Then** the Balance column shows the exact saved value, not a frontend recalculation.
4. **Given** a pensioner's last payment date is stored as a raw database timestamp (e.g., "2026-03-31T00:00:00.000000Z"), **When** the list displays, **Then** the Last Payment column shows a human-readable formatted date using the application's standard date format.
5. **Given** a pensioner is associated with multiple agencies (e.g., LPB, ALIP, AFPSLAI), **When** the list displays, **Then** all agencies are shown in a summarized view without cluttering the table, and a detailed agency breakdown is accessible.

---

### User Story 2 - Manage Individual Pensioner Records (Priority: P1)

As a system user, I want to view, edit, print, and delete individual pensioner records directly from the list so that I can manage the complete lifecycle of overpayment records.

**Why this priority**: Record management is the core workflow — users must act on the data they see.

**Independent Test**: Perform each action (View, Edit, Print, Delete) on a single pensioner record and verify the expected outcome.

**Acceptance Scenarios**:

1. **Given** a pensioner record exists, **When** the user clicks the View action, **Then** a detailed view (page or modal) shows all pensioner information including Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status, Supporting Documents, Timeline, and Audit History.
2. **Given** a pensioner record exists, **When** the user clicks the Edit action, **Then** an edit form opens prepopulated with the pensioner's existing data using the same layout, fields, and validation rules as the Add Pensioner form.
3. **Given** a pensioner record exists, **When** the user clicks the Print action, **Then** a printable Pensioner Summary is generated with: Header, "AFP Pension Overpayment Monitoring System" title, Pensioner Details, Agency Summary, Financial Summary (Overpayment, Collected, Remaining Balance, Status), and Generated Date. The output must support browser printing and PDF export.
4. **Given** a pensioner record exists, **When** the user clicks the Delete action, **Then** a confirmation dialog displays "Are you sure you want to delete this pensioner?" and the record is deleted only after explicit confirmation, with the table refreshing after successful deletion.

---

### User Story 3 - Navigate and Find Records Efficiently (Priority: P2)

As a system user, I want to search, filter, sort, and paginate through the Pensioners List so that I can quickly find specific records even with large datasets.

**Why this priority**: Essential for usability as the number of records grows over time.

**Independent Test**: Verify search returns matching results, filters narrow by criteria, sorting reorders correctly, and pagination shows correct subsets of records.

**Acceptance Scenarios**:

1. **Given** the Pensioners List is displayed, **When** the user types in a search field, **Then** the list filters in real-time to show only matching records.
2. **Given** the Pensioners List is displayed, **When** the user clicks a sortable column header (Name, Rank, Agency, Balance, Status, Last Payment), **Then** the list reorders by that column, toggling between ascending and descending order.
3. **Given** the Pensioners List has many records, **When** the user navigates to the next page, **Then** the next set of records is displayed without a full page reload.
4. **Given** filter controls are available, **When** the user selects filter criteria (e.g., by agency, status), **Then** only matching records are displayed.

---

### User Story 4 - Use the Table on Any Device (Priority: P3)

As a system user, I want the Pensioners List to remain usable on desktop, laptop, tablet, and mobile devices so that I can access information regardless of my device.

**Why this priority**: Primary use case is desktop, but the page must not break on smaller screens.

**Independent Test**: Load the page at various viewport widths (desktop 1920px, laptop 1366px, tablet 768px, mobile 375px) and verify no overlapping text, clipped buttons, or hidden actions.

**Acceptance Scenarios**:

1. **Given** the Pensioners List is displayed on a desktop or laptop screen (1024px or wider), **When** the page renders, **Then** all columns fit without horizontal overflow and the table is fully readable.
2. **Given** the Pensioners List is displayed on a tablet screen (768px to 1023px), **When** the page renders, **Then** horizontal scrolling is available without breaking the layout.
3. **Given** the Pensioners List is displayed on a mobile screen (less than 768px), **When** the page renders, **Then** the table remains usable with horizontal scrolling and no content is cut off, overlapping, or hidden.

---

### Edge Cases

- Zero overpayment: Overpayment and Balance columns display 0.00 or equivalent zero value.
- No collection history: Collected column displays 0.00.
- Null or missing last payment date: Last Payment column displays "N/A" or equivalent placeholder.
- Empty search results: Table displays a clear empty state message (e.g., "No pensioners found").
- Deleted record already removed by another user: System displays appropriate error message and refreshes the list.
- Network connectivity loss during View, Edit, Print, or Delete: System displays a network error message without data loss.
- Pensioner with no agencies assigned: Agencies column shows "None" and agency summary indicates no agencies.
- Concurrent edit conflicts: System detects data conflicts during editing and notifies the user.
- Text overflow handling: Long cell values use ellipsis with tooltips to avoid breaking the table layout.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display the Last Payment date in a human-readable format using the application's standard date format (e.g., "March 31, 2026" or "03/31/2026"), never as a raw database timestamp.
- **FR-002**: System MUST display the Overpayment value exactly as computed and saved in the database, matching the formula: Monthly Pension × Number of Months Overpaid — no frontend recalculation.
- **FR-003**: System MUST display the Balance value exactly as computed and saved in the database, matching the formula: Overpayment − Total Collected — no frontend recalculation.
- **FR-004**: System MUST NOT perform independent recalculations of Overpayment or Balance on the frontend; all displayed financial values must come from the authoritative backend API response.
- **FR-005**: System MUST display all agencies associated with a pensioner (e.g., LPB, ALIP, AFPSLAI) in a summarized view (e.g., comma-separated list or badges) without cluttering the table, with an accessible detailed agency breakdown.
- **FR-006**: System MUST include a View action for each pensioner that opens a detailed view (page or modal) containing: Personal Information, Agency Information, Overpayment Details, Collection History, Recovery Status, Supporting Documents, Timeline, and Audit History.
- **FR-007**: System MUST include an Edit action for each pensioner that opens an edit form prepopulated with all existing data, using the same layout, fields, and validation rules as the Add Pensioner form.
- **FR-008**: System MUST include a Print action for each pensioner that generates a printable Pensioner Summary (supporting both browser printing and PDF export) containing: Header with "AFP Pension Overpayment Monitoring System", Pensioner Details, Agency Summary, Financial Summary (Overpayment, Collected, Remaining Balance, Status), and Generated Date.
- **FR-009**: System MUST include a Delete action for each pensioner that shows a confirmation dialog reading "Are you sure you want to delete this pensioner?" and only deletes after explicit user confirmation, with automatic table refresh after successful deletion.
- **FR-010**: System MUST freeze important columns (Selection checkbox, Name, Serial Number, Actions) in place so they remain visible when horizontally scrolling the table.
- **FR-011**: System MUST support sorting on the following columns: Name, Rank, Agency, Balance, Status, Last Payment.
- **FR-012**: System MUST support pagination to navigate through large datasets without full page reloads.
- **FR-013**: System MUST support free-text search across pensioner records.
- **FR-014**: System MUST support filtering to narrow displayed records by relevant criteria (e.g., agency, status).
- **FR-015**: System MUST implement responsive table behavior so that data remains usable across desktop (1920px), laptop (1366px), tablet (768px), and mobile (375px) viewport widths without overlapping text, clipped buttons, or hidden actions.
- **FR-016**: System MUST prevent text overflow in table cells using ellipsis with tooltips, wrapping where appropriate, or other non-destructive overflow handling techniques.
- **FR-017**: System MUST display every field in the Pensioners table exactly as entered in the Add Pensioner form — Rank, Name, Serial Number, Agency, Last Payment, Monthly Pension, Cause, Agencies, Overpayment, Collected, Balance, and Status — with no transformation errors or discrepancies.
- **FR-018**: All date fields throughout the entire application MUST use the same standard date format consistently.
- **FR-019**: System MUST display the agency summary as a comma-separated list of agency names (e.g., "LPB, ALIP, AFPSLAI") instead of a count (e.g., "3 agency(ies)").

### Key Entities

- **Pensioner**: An individual pensioner record containing personal information (Rank, Name, Serial Number), financial data (Monthly Pension, Overpayment, Collected, Balance, Status), and associated metadata (Agencies, Cause, Last Payment).
- **Agency**: A funding or service agency associated with a pensioner (e.g., LPB, ALIP, AFPSLAI). A pensioner may have multiple agencies.
- **Overpayment**: The computed total of overpaid pension amount, calculated as Monthly Pension × Number of Months Overpaid, saved in the database.
- **Collection**: A payment collected from the pensioner toward the overpayment. Total Collected is the sum of all collection entries.
- **Balance**: The remaining overpayment balance, calculated as Overpayment minus Total Collected, saved in the database.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every field in the Pensioners List matches the corresponding field in the Add Pensioner form and database record 100% of the time — no display discrepancies.
- **SC-002**: The Overpayment and Balance columns always display values identical to what was saved in the database — no frontend recalculations occur.
- **SC-003**: Users can View, Edit, Print, and Delete any pensioner record in 3 clicks or fewer directly from the list.
- **SC-004**: The table loads and is fully interactive on desktop (1920px), laptop (1366px), tablet (768px), and mobile (375px) viewport widths without layout breakage, overlapping content, or hidden actions.
- **SC-005**: Search returns matching results in under 2 seconds, and pagination transitions complete in under 1 second for datasets up to 10,000 records.
- **SC-006**: The raw database timestamp format (e.g., "2026-03-31T00:00:00.000000Z") no longer appears anywhere in the application — all date fields use the application's standard format.
- **SC-007**: Agency display shows the complete comma-separated list of agency names for each pensioner — the count-only format ("3 agency(ies)") is eliminated.
- **SC-008**: The Delete action removes only the selected record after explicit confirmation — no accidental or bulk deletions occur without confirmation.
- **SC-009**: No regressions are introduced — all existing search, filter, sort, and pagination functionality continues to work after changes.

## Assumptions

- The existing backend API already provides all pensioner data including computed Overpayment and Balance values in the API response.
- The Add Pensioner form correctly computes and saves Overpayment and Balance to the database.
- The application has a standard date format already defined or the team will agree on one (e.g., "Month DD, YYYY" or "MM/DD/YYYY").
- The existing database schema supports all required fields including agency associations and collection history.
- The application has an icon library available that can provide action icons for View, Edit, Print, and Delete.
- Browser print functionality (window.print) is acceptable for the Print feature; no external PDF library is assumed.
- Sorting, search, and filtering can be implemented either client-side or server-side and will be determined during planning.
- The View feature can be implemented as either a dedicated page or a modal dialog based on implementation preference.
- The Edit form will reuse the existing Add Pensioner form component with prepopulated data.
