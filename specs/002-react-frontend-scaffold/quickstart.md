# Quickstart Validation Guide: React Frontend Scaffold

**Date**: 2026-06-27

## Prerequisites

- Node.js 22.x LTS (verify with `node --version`)
- npm 11.x (verify with `npm --version`)
- Repository cloned locally

## Validation Scenarios

### Scenario 1: Project Initialization (P1)

1. Navigate to `apps/frontend/`
2. Run `npm install`
   - **Expected**: All dependencies install without errors
3. Run `npm run dev`
   - **Expected**: Dev server starts on `http://localhost:5173` (or configured port)
4. Open `http://localhost:5173` in browser
   - **Expected**: Application loads and displays the home page
5. Edit `src/App.tsx` and save
   - **Expected**: Browser hot-reloads with changes instantly

### Scenario 2: Production Build (P1)

1. Run `npm run build`
   - **Expected**: Build succeeds, output in `dist/` directory
2. Check bundle size: `npx vite-bundle-analyzer` or inspect `dist/assets/*.js`
   - **Expected**: Total gzipped JS < 500KB

### Scenario 3: Testing Infrastructure (P2)

1. Run `npm test`
   - **Expected**: Vitest runs, test results displayed, coverage reported
2. Run `npm run test -- --watch`
   - **Expected**: Tests re-run when source files change

### Scenario 4: Code Quality (P3)

1. Run `npm run lint`
   - **Expected**: No errors on clean scaffold
2. Introduce a deliberate lint violation (e.g., unused variable), run `npm run lint`
   - **Expected**: Violation reported with file, line, and description
3. Run `npm run lint -- --fix`
   - **Expected**: Fixable violations auto-corrected
4. Run `npx tsc --noEmit`
   - **Expected**: TypeScript strict mode passes with zero errors

### Scenario 5: Environment Configuration

1. Check that `.env.example` exists at `apps/frontend/.env.example`
   - **Expected**: File exists with documented variables
2. Copy `.env.example` to `.env`, modify values, restart dev server
   - **Expected**: New values take effect

## Contract Verification

- API service contract: See [contracts/api-client.md](./contracts/api-client.md)
- Component contract: See [contracts/components.md](./contracts/components.md)
- Application architecture: See [data-model.md](./data-model.md)

## Expected Exit Codes (CI/CD)

| Command | Success | Failure |
|---------|---------|---------|
| `npm run build` | 0 | non-zero |
| `npm test` | 0 | non-zero |
| `npm run lint` | 0 | non-zero |
| `npx tsc --noEmit` | 0 | non-zero |
