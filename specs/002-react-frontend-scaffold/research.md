# Research: React Frontend Scaffold

**Date**: 2026-06-27

## Technology Decisions

### Build Tool: Vite

**Decision**: Vite 6.x (latest stable compatible with React 19)

**Rationale**: Vite is the officially recommended build tool for new React projects (per React docs). Provides sub-second HMR, native ES module dev server, and optimized production builds via Rollup. Chosen over Create React App (deprecated), Next.js (full framework — too heavy for thin-client SPA), and Webpack (slower DX).

**Alternatives considered**:
- Create React App (CRA): Deprecated upstream, no longer maintained
- Next.js: Full SSR/SSG framework — unnecessary complexity for this thin-client SPA
- Webpack 5: Significantly slower dev server startup and HMR compared to Vite

### Testing: Vitest 4.1.x

**Decision**: Vitest 4.1.x with @testing-library/react + jsdom environment

**Rationale**: Vitest is the native testing framework for Vite projects — shares the same transform pipeline, configuration, and plugin ecosystem. Offers watch mode, coverage (via v8 or Istanbul), and Jest-compatible API. `@testing-library/react` provides idiomatic React component testing (encourages testing behavior, not implementation). jsdom provides a browser-like environment without a real browser.

**Alternatives considered**:
- Jest: Requires separate configuration, slower, not Vite-native
- Cypress/Playwright: E2E tools — too heavy for unit/component tests defined in spec
- React Testing Library with Jest: Works but adds configuration overhead

### Code Quality: ESLint + Prettier + TypeScript Strict

**Decision**: ESLint 9.x with flat config + Prettier + TypeScript strict mode

**Rationale**: ESLint flat config (introduced in ESLint 9) is the modern standard. Paired with Prettier for formatting (no style rules in ESLint — let Prettier handle that). TypeScript strict mode catches null/undefined errors, ensures proper typing. Matches the project's existing code quality requirements from constitution.

**Alternatives considered**:
- ESLint legacy `.eslintrc` format: Deprecated, flat config is the future
- Rome/Biome: Newer tools but less ecosystem support for React-specific rules
- StandardJS: Not compatible with Prettier pipeline

### HTTP Client: axios 1.18.x

**Decision**: axios 1.18.x

**Rationale**: Already specified in constitution. Provides interceptors, automatic JSON parsing, request/response transformation, and better error handling than native `fetch`. A thin wrapper service (`src/services/api.ts`) will be created to centralize base URL, auth token injection, and response envelope parsing.

**Alternatives considered**:
- Native `fetch`: Less ergonomic, no automatic JSON, no interceptors, no timeout
- ky: Lighter but smaller ecosystem

### Routing: react-router-dom 7.18.x

**Decision**: react-router-dom 7.x (data router pattern)

**Rationale**: Already specified in constitution. V7 introduces the data router pattern with loaders/actions — provides better data-fetching patterns and pending state handling. Suitable for a SPA with multiple pages.

**Alternatives considered**:
- TanStack Router: Newer, file-based routing — less established
- wouter: Too minimal for a growing project
- No router: Not feasible for multi-page SPA

### Project Setup: npm create vite

**Decision**: Use `npm create vite@latest` with React + TypeScript template, then customize

**Rationale**: The official Vite scaffolding command produces a canonical project structure that follows Vite conventions. Customizations after scaffolding add project-specific configurations (axios, react-router, testing setup, ESLint flat config, Prettier).

**Alternatives considered**:
- Manual setup from scratch: More control but error-prone and time-consuming
- Custom Yeoman/Plop generator: Overkill for initial scaffold

## Key Configuration Decisions

1. **ESLint flat config** (`eslint.config.js`) — includes `typescript-eslint` for TS-specific rules, `eslint-plugin-react-hooks` for hooks rules, `eslint-plugin-react-refresh` for HMR-safe exports
2. **Vitest config** in `vite.config.ts` using `defineConfig` merge — test file pattern: `**/*.test.{ts,tsx}`, jsdom environment, coverage via v8, setup file at `tests/setup.ts`
3. **TypeScript strict mode** — `"strict": true` in `tsconfig.app.json` with `"noUncheckedIndexedAccess": true` for additional safety
4. **Path aliases** — `@/` mapped to `src/*` in both Vite and TypeScript configs
5. **Environment variables** — Vite exposes `VITE_*` env vars via `import.meta.env`; `.env.example` documents available variables
6. **Proxy** — Vite dev server proxies `/api` requests to the backend (configurable via env var)

## Bundle Size Budget

**Target**: <500KB gzipped production build

**Strategy**:
- Tree-shaking enabled by default (ES module imports)
- Manual chunks for vendor splitting (react, react-dom separate from app code)
- No oversized dependencies — vet each addition against bundle budget
- Use `vite-plugin-compression` for gzip/brotli pre-compression in CI builds

## Accessibility Baseline

WCAG 2.1 AA compliance will be enforced at the feature/component level, not scaffold level. The scaffold will:
- Use semantic HTML in the App shell (`<main>`, `<nav>`, `<header>`, etc.)
- Include a `lang` attribute on `<html>`
- Not suppress focus outlines
- Use proper heading hierarchy

## Environment Configuration

Required environment variables (documented in `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=IDS
```

The Vite dev server will proxy `/api/*` requests to `VITE_API_BASE_URL` when running in development mode.
