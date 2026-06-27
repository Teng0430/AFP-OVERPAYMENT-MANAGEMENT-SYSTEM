# IDS Frontend

React + Vite frontend application for the IDS project.

## Prerequisites

- Node.js 22.x LTS
- npm 11.x

## Setup

```bash
cd apps/frontend
npm install
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests with Vitest and coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source code |
| `npm run lint:fix` | Lint and auto-fix violations |
| `npm run typecheck` | TypeScript type-check only |

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=IDS
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── pages/        # Page components
│   ├── services/     # API client (axios)
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript type definitions
│   ├── assets/       # Static assets
│   ├── main.tsx      # Entry point
│   ├── App.tsx       # Root component with routing
│   └── vite-env.d.ts
├── tests/            # Test files
├── public/           # Public static files
├── index.html        # HTML shell
├── vite.config.ts    # Vite configuration
├── eslint.config.js  # ESLint flat config
└── .prettierrc       # Prettier configuration
```
