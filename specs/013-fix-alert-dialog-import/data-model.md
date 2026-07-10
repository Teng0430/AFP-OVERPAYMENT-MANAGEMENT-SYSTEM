# Data Model: Alert Dialog Component

**Date**: 2026-07-10
**Type**: UI Component — no backend data model changes

## Overview

The Alert Dialog is a frontend-only UI component. No database schema changes, API endpoints, or backend data models are required.

## Component API

### AlertDialog (Root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | — | Controlled open state |
| `onOpenChange` | (open: boolean) => void | — | Callback when open state changes |
| `defaultOpen` | boolean | — | Uncontrolled initial open state |

### AlertDialogTrigger

| Prop | Type | Default | Description |
|---|---|---|---|
| `asChild` | boolean | false | Merge styling onto child element |
| `children` | ReactNode | — | Button/trigger element |

### AlertDialogContent

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Content to render inside dialog |

### AlertDialogHeader

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |

### AlertDialogTitle

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Title text |

### AlertDialogDescription

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Description text |

### AlertDialogFooter

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |

### AlertDialogCancel

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Cancel button text |
| `onClick` | () => void | — | Click handler |

### AlertDialogAction

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Action button text |
| `onClick` | () => void | — | Click handler |

## States

| State | Behavior |
|---|---|
| **Closed (default)** | Content is hidden; trigger button is visible |
| **Open** | Content is displayed as a centered modal with backdrop overlay; focus is trapped inside |
| **Confirm** | User clicks Action button → dialog closes, callback fires |
| **Cancel** | User clicks Cancel button or presses Escape → dialog closes |

## Validation Rules

- Alert Dialog is intended for destructive action confirmations only (delete, bulk delete, status changes)
- No form validation needed — dialog simply confirms/cancels an action
