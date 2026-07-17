# UI Contracts: Pensioners List UI & Actions

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-10

## Overview

This feature involves frontend-only changes. No new API endpoints or schema changes are required. The existing backend API contract is fully preserved.

## Existing API Endpoints (Unchanged)

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/api/pensioners` | GET | List pensioners with filters, sorting, pagination | PensionersPage |
| `/api/pensioners/{id}` | GET | Get single pensioner details | PensionerViewModal, PensionerPrintView, EditPensionerPage |
| `/api/pensioners/{id}` | PUT | Update pensioner record | EditPensionerPage |
| `/api/pensioners/{id}` | DELETE | Delete single pensioner | PensionersPage (confirmDelete) |
| `/api/pensioners/bulk-delete` | POST | Delete multiple pensioners | PensionersPage (handleBulkDelete) |
| `/api/pensioners/bulk-update` | POST | Update multiple pensioners' status | PensionersPage (handleBulkStatus) |

## New Components & Contracts

### PensionerActionsMenu

**Purpose**: Drop-down menu for row-level actions (View, Edit, Print, Delete).

**Props**:
```typescript
interface PensionerActionsMenuProps {
  pensioner: Pensioner;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPrint: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**Behavior**:
- Trigger: `MoreHorizontal` icon button (ghost variant)
- Content: Dropdown with 4 items, each with icon + label
- View: Calls `onView(id)`, triggered on click
- Edit: Calls `onEdit(id)`, triggered on click
- Print: Calls `onPrint(id)`, triggered on click
- Delete: Calls `onDelete(id)`, triggered on click; item uses `text-destructive` color
- Keyboard: Arrow Up/Down navigates items, Enter selects, Escape closes
- Accessibility: Each item has `aria-label`, dropdown has `aria-label="Row actions"`

### Toaster

**Purpose**: Global toast notification renderer.

**Imports**: `useToast()` hook, renders toast list at fixed position.

**Behavior**:
- Positioned at `bottom-4 right-4` (or `bottom-right`)
- Renders each toast with title, description, variant styling (default/destructive)
- Auto-dismisses after 5000ms via `TOAST_REMOVE_DELAY` constant update
- Manual dismiss via close button
- Renders inside AppShell layout for global availability

### PensionerPrintView (Route Update)

**Current**: Receives `pensionerId` as prop — incompatible with direct routing.

**Change**: Wrap in a route-compatible page component that extracts `id` from `useParams`:
```typescript
// New wrapper or inline change
function PensionerPrintViewPage() {
  const { id } = useParams<{ id: string }>();
  return <PensionerPrintView pensionerId={Number(id)} />;
}
```

**Route**: `/pensioners/:id/print`

**Behavior**:
- Fetches pensioner data via `get(id)`
- Auto-triggers `window.print()` after data loads
- `@media print` CSS for page margins and layout
- "Generated:" timestamp footer

### Responsive Grid Breakpoints (Filter Section)

| Breakpoint | Tailwind Class | Columns | Layout |
|-----------|---------------|---------|--------|
| < 640px | `grid-cols-1` | 1 | All filters stacked, full width |
| 640px+ | `sm:grid-cols-2` | 2 | Two-column grid |
| 768px+ | `md:grid-cols-3` | 3 | Three-column grid |
| 1024px+ | `lg:grid-cols-5` | 5 | All filters in one row |

### Mobile Card Layout (Table)

Below 768px viewport width, the `<table>` element is hidden and a card layout is shown instead:

- Each pensioner becomes a `<Card>` with labeled fields
- Key fields displayed: Name, Serial #, Rank, Status, Balance
- Actions menu still available on each card
- "View all" or expandable detail option for remaining fields
- Implemented via Tailwind responsive utility classes:
  - `<table className="hidden md:table">`
  - `<div className="block md:hidden space-y-4">` (card container)
