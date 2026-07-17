# Quickstart: Fix Alert Dialog Import Error

**Date**: 2026-07-10
**Prerequisites**: Node.js 22+, npm 10+

## Setup

```shell
cd apps/frontend
npm install
```

Confirm `@radix-ui/react-alert-dialog` is present in `node_modules`:

```shell
ls node_modules/@radix-ui/react-alert-dialog
```

## Validation Scenarios

### Scenario 1: Dev server starts without errors

```shell
cd apps/frontend && npm run dev
```

**Expected**: Dev server starts on port 5173. No `[plugin:vite:import-analysis]` errors.

### Scenario 2: Production build succeeds

```shell
cd apps/frontend && npm run build
```

**Expected**: Build completes with exit code 0. No module resolution errors.

### Scenario 3: TypeScript compiles

```shell
cd apps/frontend && npx tsc --noEmit
```

**Expected**: Zero type errors.

### Scenario 4: Pensioners page loads

1. Open `http://localhost:5173` in browser
2. Log in with valid credentials
3. Navigate to Pensioners page
4. **Expected**: Page loads fully with pensioner table displayed. No console errors.

### Scenario 5: Delete confirmation dialog

1. On Pensioners page, click the trash icon on any row
2. **Expected**: Alert dialog appears with title "Delete Pensioner", description, Cancel and Delete buttons
3. Click Cancel → dialog closes, nothing deleted
4. Click Delete → dialog closes, pensioner is deleted, table refreshes

### Scenario 6: Lint

```shell
cd apps/frontend && npm run lint
```

**Expected**: No lint violations.

## See Also

- [Specification](spec.md)
- [Research findings](research.md)
- [Data model](data-model.md)
- [Implementation plan](plan.md)
