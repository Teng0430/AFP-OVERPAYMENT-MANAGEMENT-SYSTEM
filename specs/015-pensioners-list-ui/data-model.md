# Data Model: Pensioners List UI & Actions

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-10

## Overview

This feature involves no database schema changes. All data is consumed from the existing backend API and displayed on the frontend. This document describes how the existing data model is used for display, the UI state model, and the component hierarchy.

## Pensioner Entity (Display View)

The `Pensioner` interface from the existing backend API is used directly. No new fields are added.

| Field | Type | Display Format | Column in Table | Notes |
|-------|------|---------------|-----------------|-------|
| `id` | `number` | — | (not displayed) | Primary key, used for actions/API calls |
| `rank` | `string` | Plain text | Rank | Sticky: no |
| `name` | `string` | Truncated with tooltip | Name | **Sticky left** |
| `serial_number` | `string` | Plain text | Serial # | **Sticky left** |
| `cause_of_stoppage` | `string` | Truncated with tooltip | Cause | Optional — displayed if present |
| `agency_name` | `string` | Truncated with tooltip | Agency | Primary agency |
| `last_payment` | `string` (ISO date) | `formatDisplayDate()` → "Mar 31, 2026" | Last Payment | Format: short month |
| `agency_deductions` | `AgencyDeduction[]` | Comma-separated names, tooltip with details | Agencies | |
| `monthly_pension` | `number` | `formatCurrency()` → "₱12,345.67" | Monthly Pension | |
| `overpayment_total` | `number` | `formatCurrency()` | Overpayment | |
| `amount_collected` | `number` | `formatCurrency()` | Collected | |
| `balance` | `number` | `formatCurrency()` | Balance | |
| `status` | `string` | `<Badge>` with color variant | Status | Variant map: recovered→default, not-yet-recovered→destructive, recovered-but-inc→secondary |
| `account_number` | `string\|null` | — | (not in table) | Shown in View modal |
| `date_of_death` | `string\|null` | `formatDisplayDate()` | (not in table) | Shown in View modal |
| `overpayment_subtotal` | `number` | — | (not in table) | Shown in View modal |
| `computation_in_months` | `number` | — | (not in table) | Shown in View modal |
| `computation_of_days` | `number` | — | (not in table) | Shown in View modal |
| `crediting_agency_name` | `string` | — | (not in table) | Shown in View modal |
| `created_at` | `string` (ISO) | `formatDisplayDate()` | (not in table) | Audit info in View modal |
| `updated_at` | `string` (ISO) | `formatDisplayDate()` | (not in table) | Audit info in View modal |
| `created_by` | `number\|null` | — | (not in table) | Audit info in View modal |

## UI State Model

### PensionersPage State

| State Variable | Type | Default | Purpose |
|---------------|------|---------|---------|
| `pensioners` | `Pensioner[]` | `[]` | Fetched records from API |
| `loading` | `boolean` | `true` | Loading indicator |
| `total` | `number` | `0` | Total record count (from API meta) |
| `page` | `number` | `1` | Current page number |
| `perPage` | `number` | `10` | Records per page (constant) |
| `sorting` | `SortingState` | `[]` | Column sort state for TanStack Table |
| `rowSelection` | `RowSelectionState` | `{}` | Selected row IDs for bulk actions |
| `search` | `string` | `''` | Search text input |
| `rankFilter` | `string` | `''` | Selected rank filter value |
| `statusFilter` | `string` | `''` | Selected status filter value |
| `agencyFilter` | `string` | `''` | Selected agency filter value |
| `causeFilter` | `string` | `''` | Selected cause filter value |
| `error` | `string` | `''` | Error message (legacy — replaced by toast) |
| `viewModalId` | `number\|null` | `null` | Pensioner ID for View modal |
| `deleteConfirmId` | `number\|null` | `null` | Pensioner ID pending deletion |
| `deleteDialogOpen` | `boolean` | `false` | Delete confirmation dialog state |

### Column Definition (Sticky Configuration)

| Column ID | Sticky | z-index | Shadow |
|-----------|--------|---------|--------|
| `select` | Left (0) | `z-10` | `shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]` |
| `name` | Left (0) | `z-10` | (none — adjacent to select) |
| `serial_number` | Left (0) | `z-10` | (none — adjacent to name) |
| `rank` | No | — | — |
| `cause_of_stoppage` | No | — | — |
| `agency_name` | No | — | — |
| `last_payment` | No | — | — |
| `agency_deductions` | No | — | — |
| `monthly_pension` | No | — | — |
| `overpayment_total` | No | — | — |
| `amount_collected` | No | — | — |
| `balance` | No | — | — |
| `status` | No | — | — |
| `actions` | Right (0) | `z-10` | `shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]` |

Header row uses `z-20` to remain above sticky column cells during vertical scroll.

## Component Hierarchy

```
App
└── BrowserRouter
    └── AuthProvider
        └── ProtectedRoute
            └── AppShell (DashboardLayout)
                └── <Toaster />                        [NEW: global toast notifications]
                └── PensionersPage
                    ├── Header (title + Add button)
                    ├── FilterCard
                    │   ├── SearchInput
                    │   ├── RankSelect
                    │   ├── StatusSelect
                    │   ├── AgencySelect
                    │   ├── CauseSelect
                    │   └── ApplyButton
                    ├── BulkActionsBar (conditional)
                    ├── TableCard
                    │   ├── Table (sticky header)
                    │   │   ├── HeaderRow
                    │   │   │   ├── SelectAllCol (sticky left)
                    │   │   │   ├── NameCol (sticky left)
                    │   │   │   ├── SerialNoCol (sticky left)
                    │   │   │   ├── ... (scrollable cols)
                    │   │   │   └── ActionsCol (sticky right)
                    │   │   └── DataRows
                    │   │       └── PerRow:
                    │   │           ├── SelectCell (sticky left)
                    │   │           ├── NameCell (sticky left)
                    │   │           ├── SerialNoCell (sticky left)
                    │   │           ├── ... (scrollable cells)
                    │   │           └── PensionerActionsMenu (sticky right) [NEW]
                    │   └── EmptyState (conditional)
                    ├── PaginationControls
                    ├── PensionerViewModal
                    └── DeleteConfirmDialog (AlertDialog)
```

## Actions (Drop-down Menu Items)

| Menu Item | Icon | Action | Destination |
|-----------|------|--------|-------------|
| View | `Eye` | `setViewModalId(id)` | PensionerViewModal |
| Edit | `Pencil` | `navigate(/pensioners/${id}/edit)` | EditPensionerPage |
| Print | `Printer` | `window.open(/pensioners/${id}/print)` | PensionerPrintView (new route) |
| Delete | `Trash2` | `initiateDelete(id)` → AlertDialog confirmation | `remove(id)` API call |
