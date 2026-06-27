# Component Contract

**Date**: 2026-06-27

## App Shell (`src/App.tsx`)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| (none) | — | — | — | App mounts with no props; uses BrowserRouter internally |

## Page Components (under `src/pages/`)

All page components:

- MUST accept no props (data fetching is handled internally via hooks or loaders)
- MUST be default-exported for dynamic route-based imports
- MUST render within the route tree

## Route Contract (via react-router-dom)

Defined in `src/App.tsx`:

```
/        → <HomePage>
*        → <NotFoundPage>
```

Future features register additional routes here.

## Error/Loading/Empty State Contract

All components MUST handle three states:
- **Loading**: Show a spinner or skeleton while data is pending
- **Error**: Show an error message with retry action when data fetch fails
- **Empty**: Show an empty state message when data returns with zero results

This contract will be enforced during feature implementation and code review.
