# Data Model & Application Architecture: React Frontend Scaffold

**Date**: 2026-06-27

## Application Layout & Component Tree

The scaffold defines the structural blueprint for this single-page application. Individual feature work will populate these directories with concrete components, pages, and services.

### Route Structure

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `HomePage` | Landing page / dashboard entry |
| `*` | `NotFoundPage` | 404 catch-all for unknown routes |

Routes will be extended by future features. The scaffold creates the routing infrastructure only.

### Component Hierarchy

```
<App>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
</App>
```

### Entity: Application Shell

The entry-point React tree that mounts to the DOM and provides the routing framework. It defines the outermost layout structure.

**Attributes**:
- `entryPoint`: `src/main.tsx` — mounts `<App />` to `#root`
- `rootComponent`: `src/App.tsx` — contains `<BrowserRouter>` and `<Routes>`
- `htmlShell`: `index.html` — contains `#root` div, script tag for `main.tsx`, `<html lang="en">`
- `publicAssets`: `public/` — static files served as-is by Vite

**Relationships**:
- Application Shell **contains** Pages (via Routes)
- Application Shell **depends on** Build Configuration (vite.config.ts, tsconfig files)

### Entity: API Service Layer

Centralized HTTP communication service that wraps the axios client.

**Attributes**:
- `baseURL`: Configurable via `VITE_API_BASE_URL` environment variable (default: `http://localhost:8000/api`)
- `defaultHeaders`: `Content-Type: application/json`
- `requestInterceptor`: Injects `Authorization: Bearer <token>` from stored auth token
- `responseInterceptor`: Unwraps the JSON envelope `{ success, data, error }` and surfaces errors uniformly

**Methods**:
| Method | Purpose |
|--------|---------|
| `GET /{endpoint}` | Fetch data (list/detail) |
| `POST /{endpoint}` | Create resource |
| `PUT /{endpoint}/{id}` | Update resource |
| `DELETE /{endpoint}/{id}` | Delete resource |

**Relationships**:
- API Service Layer **is consumed by** all feature services
- API Service Layer **communicates with** the backend API

### Entity: Build Configuration

The set of configuration files that control how the project is built, tested, and type-checked.

**Files**:
| File | Purpose |
|------|---------|
| `vite.config.ts` | Build settings, dev server proxy, plugins, test config |
| `tsconfig.json` | TypeScript project reference root |
| `tsconfig.app.json` | TypeScript config for application source code (`"strict": true`) |
| `tsconfig.node.json` | TypeScript config for Node-side files (vite.config.ts) |
| `eslint.config.js` | ESLint flat config — code quality rules |
| `.prettierrc` | Prettier formatting rules |

**Validation contexts**:
| Context | Command | Config Used |
|---------|---------|-------------|
| Development | `npm run dev` | vite.config.ts |
| Type-check | `npx tsc --noEmit` | tsconfig.app.json |
| Lint | `npm run lint` | eslint.config.js |
| Test | `npm run test` | vite.config.ts (test block) |
| Build | `npm run build` | vite.config.ts |

### State Management

The scaffold will not include a global state management library (Redux, Zustand, etc.). Component-local state via `useState`/`useReducer` and React Context for lightweight shared state is sufficient for the initial scaffold. Future features may introduce a state management solution if complexity demands it.

### Validation Rules

Not applicable to the scaffold. Validation rules for forms, inputs, and API payloads will be defined per feature.
