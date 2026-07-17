# Feature Specification: Pensioners List UI & Actions

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description detailing layout problems (page wider than viewport, horizontal scrolling, broken responsiveness), missing record management actions (View, Edit, Print, Delete), and UX/performance improvements for the Pensioners List page.

## User Scenarios & Testing

### User Story 1 — View Pensioners Without Horizontal Scrolling (Priority: P1)

As a system user, I want the Pensioners List to fit within the browser viewport on standard desktop monitors so that I can see all columns and data without needing to scroll horizontally.

**Why this priority**: The page is unusable when critical data is hidden off-screen — this is the most visible and disruptive problem.

**Independent Test**: Load the Pensioners List page on desktop monitors at 1366×768, 1440×900, 1600×900, and 1920×1080 resolutions and confirm no page-level horizontal scrollbar appears.

**Acceptance Scenarios**:

1. **Given** a user loads the Pensioners List page on a desktop monitor, **When** the page renders, **Then** no horizontal scrollbar appears at the page level (only within the table container if needed).
2. **Given** a user loads the page on a 1366×768 display, **When** the page renders, **Then** all column headers and data rows are visible without horizontal scrolling.
3. **Given** a user loads the page on a 1920×1080 display, **When** the page renders, **Then** content fills the available space without overflow or excessive whitespace.

---

### User Story 2 — Access Complete Record Management (Priority: P1)

As a system user, I want to View, Edit, Print, and Delete individual pensioner records from an Actions menu on each row so that I can manage the full lifecycle of overpayment records without navigating away from the list.

**Why this priority**: Record management is the core workflow — users must act on the data they see without friction.

**Independent Test**: Perform each action (View, Edit, Print, Delete) on any single pensioner record and verify the expected outcome.

**Acceptance Scenarios**:

1. **Given** a pensioner record exists in the list, **When** the user opens the Actions menu and selects View, **Then** a read-only details view displays Personal Information, Pension Details, Agency Information, Monthly Pension, Overpayment Details, Collection History, Balance, Status, Recovery Timeline, Supporting Documents (if available), and Audit Information.
2. **Given** a pensioner record exists, **When** the user selects Edit from the Actions menu, **Then** the existing Add/Edit form opens pre-filled with all of the pensioner's data, preserving validation rules, and the table refreshes after a successful save.
3. **Given** a pensioner record exists, **When** the user selects Print from the Actions menu, **Then** a printable Pensioner Summary is generated containing the AFP Pension Overpayment Monitoring System header, Pensioner Information, Agency Summary, Monthly Pension, Overpayment, Amount Collected, Remaining Balance, Status, and Date Printed — supporting both browser printing and PDF export.
4. **Given** a pensioner record exists, **When** the user selects Delete from the Actions menu, **Then** a confirmation dialog displays "Are you sure you want to delete this pensioner?", and the record is deleted only after explicit confirmation, with the table refreshing after successful deletion.
5. **Given** a deletion is blocked by related records, **When** the user confirms deletion, **Then** a meaningful error message is displayed explaining why the record cannot be deleted.

---

### User Story 3 — Use the List on Any Device (Priority: P2)

As a system user, I want the Pensioners List to remain usable on desktop, laptop, tablet, and mobile devices so that I can access information regardless of my screen size.

**Why this priority**: Primary use case is desktop, but the page must not break on smaller screens.

**Independent Test**: Load the page at viewport widths representing desktop (1920px, 1440px, 1366px), tablet (768px), and mobile (375px) and verify usability.

**Acceptance Scenarios**:

1. **Given** the page is displayed on a desktop or laptop (1024px or wider), **When** the page renders, **Then** all columns fit without page-level horizontal overflow and no content is cut off.
2. **Given** the page is displayed on a tablet (768px to 1023px), **When** the page renders, **Then** filters stack responsively, and the table provides horizontal scrolling within the table container without breaking the overall page layout.
3. **Given** the page is displayed on a mobile device (less than 768px), **When** the page renders, **Then** filters stack vertically, and the table uses card-style rows or expandable rows to keep content usable without page-level horizontal scrolling.

---

### User Story 4 — Filter and Search Pensioners (Priority: P2)

As a system user, I want responsive filter controls that remain visible and usable at any screen size so that I can narrow down records without fighting the layout.

**Why this priority**: Filtering is a frequent task; broken filter layout reduces productivity.

**Independent Test**: Apply filters at various viewport widths and confirm all controls remain accessible and functional.

**Acceptance Scenarios**:

1. **Given** the filter section is displayed on a desktop screen, **When** the page renders, **Then** filters are arranged in a responsive grid with appropriate spacing and no controls overflow.
2. **Given** the filter section is displayed on a narrow viewport (less than 1024px), **When** the page renders, **Then** filters wrap to the next line and remain fully visible without horizontal scrolling.
3. **Given** filters are applied, **When** the page responds, **Then** the table updates to show only matching records, and filters remain interactive.

---

### Edge Cases

- Zero overpayment: Overpayment and Balance columns display 0.00 or equivalent zero value.
- No collection history: Collected column displays 0.00.
- Missing last payment date: Last Payment column displays a placeholder such as "N/A".
- Empty search results: Table displays a clear empty state message (e.g., "No pensioners found").
- Long cell values: Text is truncated with ellipsis and a tooltip shows the full value on hover or focus.
- Deletion blocked by foreign key constraints: System displays a meaningful error message explaining why the record cannot be deleted.
- Network failure during View, Edit, Print, or Delete: System displays a network error notification without data loss.
- Concurrent edit conflicts: If detected, system notifies the user of the conflict during save.
- Very large datasets: Table rendering remains smooth with pagination or virtual scrolling as needed.

## Requirements

### Functional Requirements

- **FR-001**: System MUST render the Pensioners List page without horizontal scrolling at the page level on standard desktop resolutions (1366×768, 1440×900, 1600×900, 1920×1080).
- **FR-002**: System MUST constrain the main content area to the available viewport width, using no fixed-width containers that exceed the viewport.
- **FR-003**: System MUST provide a responsive table that horizontally scrolls within its container (not the entire page) when content exceeds available width.
- **FR-004**: System MUST freeze (sticky) the Selection, Name, and Serial Number columns on the left side of the table.
- **FR-005**: System MUST freeze (sticky) the Actions column on the right side of the table.
- **FR-006**: System MUST freeze the table header row so it remains visible when scrolling down through many rows.
- **FR-007**: System MUST display every data column — Rank, Name, Serial Number, Agency, Last Payment, Agencies, Monthly Pension, Overpayment, Collected, Balance, Status — without excessive whitespace.
- **FR-008**: System MUST format dates in a readable format (e.g., "Mar 31, 2026") rather than raw timestamps.
- **FR-009**: System MUST use ellipsis with tooltips for long cell values to avoid breaking the table layout.
- **FR-010**: System MUST include a compact Actions menu (e.g., a three-dot icon that opens a dropdown) on each row containing: View, Edit, Print, and Delete.
- **FR-011**: System MUST open a read-only details view when the user selects View, containing: Personal Information, Pension Details, Agency Information, Monthly Pension, Overpayment Details, Collection History, Balance, Status, Recovery Timeline, Supporting Documents (if available), and Audit Information.
- **FR-012**: System MUST open the existing Add/Edit form pre-filled with all pensioner data when the user selects Edit, preserving existing validation rules, and MUST refresh the table after a successful update.
- **FR-013**: System MUST generate a printable Pensioner Summary when the user selects Print, containing: AFP Pension Overpayment Monitoring System header, Pensioner Information, Agency Summary, Monthly Pension, Overpayment, Amount Collected, Remaining Balance, Status, and Date Printed — supporting both browser printing and PDF export.
- **FR-014**: System MUST display a confirmation dialog reading "Are you sure you want to delete this pensioner?" when the user selects Delete, and MUST only delete after explicit user confirmation.
- **FR-015**: System MUST display a meaningful error message if deletion is blocked by related records (e.g., foreign key constraints).
- **FR-016**: System MUST refresh the table after successful deletion to reflect the removed record.
- **FR-017**: System MUST arrange filters in a responsive grid layout that wraps to the next line on narrower viewports, keeping all filter controls fully visible.
- **FR-018**: System MUST provide hover effects on table rows for improved readability.
- **FR-019**: System MUST display a loading indicator while the table is fetching data.
- **FR-020**: System MUST display a clear empty state message when no pensioners match the current filters.
- **FR-021**: System MUST display success and error notifications for all record management actions (View, Edit, Print, Delete).
- **FR-022**: System MUST support keyboard navigation for all Action menu items (arrow keys to navigate, Enter to select, Escape to close).
- **FR-023**: System MUST maintain smooth scrolling and responsive interactions without lag or jank.
- **FR-024**: System MUST preserve all existing search, filter, sort, pagination, and bulk action functionality without regressions.

### Key Entities

- **Pensioner**: An individual pensioner record with personal information (Rank, Name, Serial Number), financial data (Monthly Pension, Overpayment, Collected, Balance, Status), and associated metadata (Agency, Agencies, Last Payment).
- **Agency**: A funding or service agency associated with a pensioner (e.g., LPB, ALIP, AFPSLAI). A pensioner may have multiple agencies.
- **Overpayment**: The total overpaid pension amount as computed and saved in the database.
- **Collection**: Payments collected from the pensioner toward the overpayment. Total Collected is the sum of all collection entries.
- **Balance**: The remaining overpayment balance (Overpayment minus Total Collected), as saved in the database.
- **Pensioner Summary**: A printable document containing a snapshot of the pensioner's information, financial summary, and agency details.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The Pensioners List page renders without horizontal scrollbars at the page level on all standard desktop resolutions (1366×768, 1440×900, 1600×900, 1920×1080).
- **SC-002**: The Actions menu is accessible on every row and contains all four actions (View, Edit, Print, Delete).
- **SC-003**: Users can complete each action (View, Edit, Print, Delete) in 3 clicks or fewer directly from the list.
- **SC-004**: The table header and specified columns (Selection, Name, Serial Number, Actions) remain fixed in place during horizontal and vertical scrolling.
- **SC-005**: Filter controls remain fully visible and functional at all common viewport widths without horizontal scrolling.
- **SC-006**: All dates in the table display in a consistent, human-readable format (e.g., "Mar 31, 2026") — no raw timestamps are visible.
- **SC-007**: Long text values in table cells are truncated with ellipsis and the full value is accessible via tooltip.
- **SC-008**: Delete operations prompt for confirmation and provide meaningful error messages when deletion is blocked — no accidental deletions occur.
- **SC-009**: The page remains usable on mobile viewports (375px and above) with card-style or expandable rows and vertically stacked filters.
- **SC-010**: No regressions are introduced — all existing search, filter, sort, pagination, and bulk action functionality continues to work after changes.

## Assumptions

- The existing backend API already provides all pensioner data needed for the table and the Actions (View, Edit, Print, Delete).
- The Add/Edit Pensioner form component already exists and can be reused for the Edit action with pre-populated data.
- The system has an icon library available that can provide icons for the Actions menu (View, Edit, Print, Delete).
- Browser print functionality (window.print) with a print-specific CSS stylesheet is acceptable for the Print feature.
- Supporting Documents refers to any documents already uploaded or associated with a pensioner record in the existing system.
- Audit Information refers to standard audit trail data such as record creation and modification timestamps and responsible users.
- Recovery Timeline is a chronological view of collection or recovery actions taken for the pensioner's overpayment.
- The application uses "Month DD, YYYY" (e.g., "Mar 31, 2026") as the standard date format.
- Sticky (frozen) columns and headers can be implemented using CSS position: sticky without requiring a separate JavaScript library.
- Card-style or expandable row layouts on mobile are acceptable approaches to preserve table usability on narrow viewports.
- Horizontal scrolling is acceptable within the table container itself, as long as the page-level layout does not scroll horizontally.
