# Research: Fix Alert Dialog Import Error

**Date**: 2026-07-10
**Investigator**: Automated analysis

## Root Cause Analysis

### Decision
The import `@/components/ui/alert-dialog` fails because the file `apps/frontend/src/components/ui/alert-dialog.tsx` does not exist.

### Rationale
1. **Missing component file**: `alert-dialog.tsx` was never created under `src/components/ui/`. The directory contains 19 UI component files (button, card, dialog, badge, select, table, etc.) but no `alert-dialog.tsx`.
2. **Configuration is correct**: Both `tsconfig.app.json` (`"@/*": ["src/*"]`) and `vite.config.ts` (`'@': path.resolve(__dirname, 'src')`) have valid path alias configurations.
3. **Dependency is installed**: `@radix-ui/react-alert-dialog@^1.1.19` is present in `package.json` as a dependency — the Radix primitive is available but the wrapper component was never created.
4. **Pattern exists**: The project follows shadcn/ui conventions — each Radix primitive is wrapped in a component file under `src/components/ui/`. The `dialog.tsx` file (wrapping `@radix-ui/react-dialog`) serves as a direct template for the missing `alert-dialog.tsx` (wrapping `@radix-ui/react-alert-dialog`).

### Alternatives Considered
- **Changing the import path to an existing component**: Not viable — no existing component provides the AlertDialog compound component API used by PensionersPage.
- **Removing AlertDialog usage**: Rejected per requirements — destructive action confirmations are required.
- **Using Dialog component instead**: Dialog and AlertDialog have different Radix primitives with different ARIA roles (alertdialog is more appropriate for destructive confirmations).

## Technology Verification

### UI Architecture
- **Pattern**: shadcn/ui-style compound components wrapping Radix UI primitives
- **Styling**: Tailwind CSS with `cn()` utility (clsx + tailwind-merge)
- **Component structure**: Each UI component is a single `.tsx` file in `src/components/ui/`
- **Exports**: Named exports of sub-components from each file

### All Imports Verification
- `PensionersPage.tsx` line 46-56: All 9 AlertDialog sub-components are used in the render output (lines 270-295).
- No unused imports detected.

### Bulk Delete Still Uses window.confirm
- Line 144: `handleBulkDelete` uses `window.confirm()` instead of AlertDialog. This is a pre-existing pattern but should be migrated for consistency (scope: enhancement, not blocker).

## Dependency Status

| Dependency | Version | Status |
|---|---|---|
| `@radix-ui/react-alert-dialog` | ^1.1.19 | ✅ Installed |
| `class-variance-authority` | ^0.7.1 | ✅ Installed (not needed for alert-dialog) |
| `lucide-react` | ^1.23.0 | ✅ Available (used in dialog.tsx for X icon) |
| `tailwind-merge` (via `cn()`) | ^3.6.0 | ✅ Available |

## Implementation Strategy

Create `apps/frontend/src/components/ui/alert-dialog.tsx` following the exact pattern of `dialog.tsx`:
- Import from `@radix-ui/react-alert-dialog`
- Export same compound component structure: AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
- Use same Tailwind classes and `cn()` utility
- Note: AlertDialog does not include a Close/X button by default (per Radix design — actions close via Cancel/Action), so omit the X close button
