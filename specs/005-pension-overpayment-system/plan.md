# Implementation Plan: Pension Overpayment Monitoring System

**Branch**: `005-pension-overpayment-system` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-pension-overpayment-system/spec.md`

## Summary

Build a full-stack enterprise dashboard for the AFP Finance Center to monitor pension overpayments caused by late death reporting, remarried pensioners, prior marriage cases, and other stoppage events. The system provides executive KPIs, pensioner data management with automatic financial computations, bulk upload, recovery ledger tracking, search/filtering, reports, alerts, RBAC user management, and system settings — all within a professional government financial platform UI.

## Technical Context

**Language/Version**: PHP 8.2+ (backend via Laravel 11.x), TypeScript 5.x (frontend via React 19.2.x)

**Primary Dependencies**:
- Backend: Laravel 11.x framework, Laravel Sanctum (auth), MySQL 8.x driver, Laravel Excel (import/export), DOMPDF (PDF generation)
- Frontend: React 19.2.x, Vite 6.x (build), shadcn/ui (components), TanStack Table (data grid), React Hook Form + Zod (forms), Recharts (charts), Framer Motion (animations), Lucide React (icons), axios (HTTP)

**Storage**: MySQL 8.4 LTS (primary), SQLite (in-memory for Pest tests)

**Testing**: Pest 4.x (backend), Vitest 4.1.x (frontend), minimum coverage 80% backend / 70% frontend

**Target Platform**: Linux server (backend API), modern browsers (frontend SPA)

**Project Type**: Full-stack web application (monorepo with `apps/backend` + `apps/frontend`)

**Performance Goals**:
- API response <200ms at p95 for standard endpoints
- Dashboard renders within 3 seconds for 10k+ pensioner records
- Global search returns results within 2 seconds
- Bulk upload of 1,000 records completes within 60 seconds
- Frontend bundle <500KB gzipped

**Constraints**:
- API responses follow consistent JSON envelope (`{ success, data, error }`)
- N+1 database queries prohibited; eager loading required
- WCAG 2.1 AA accessibility compliance
- All computed fields must update in real time (no manual encoding)
- Sanitize and validate all inputs; Sanctum token auth with bcrypt

**Scale/Scope**: 10k+ pensioner records, 6 user roles (Super Admin, Finance Admin, Finance Officer, Encoder, Viewer, Auditor), 10 user stories across dashboard, pensioner management, upload, recovery, search, reports, alerts, user management, and settings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Code Quality (PSR-12, ESLint, TS strict, PHPStan L6) | PASS | Project already configured with these standards; all new code follows same conventions |
| II. Testing Standards (Pest, Vitest, 80%/70% coverage) | PASS | Backend tests use Pest + SQLite; frontend uses Vitest; coverage targets are achievable |
| III. UX Consistency (design system, JSON envelope, responsive, WCAG AA) | PASS | Spec defines enterprise UI using shadcn/ui; existing JSON envelope pattern reused |
| IV. Performance (<200ms p95, no N+1, <500KB bundle, indexes) | PASS | Performance goals documented in Technical Context; DB indexes planned in data model |
| V. Security (Sanctum, bcrypt, validation, CSRF, input sanitization) | PASS | Existing Sanctum auth reused; RBAC extends current User model |

**Gate Verdict**: ALL GATES PASS. No violations to justify. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-pension-overpayment-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
apps/backend/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Pensioner.php
│   │   ├── Overpayment.php
│   │   ├── Collection.php
│   │   ├── RecoveryInstallment.php
│   │   ├── UploadBatch.php
│   │   ├── AuditLog.php
│   │   ├── Alert.php
│   │   └── Setting.php
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── DashboardController.php
│   │   │   ├── PensionerController.php
│   │   │   ├── UploadController.php
│   │   │   ├── RecoveryController.php
│   │   │   ├── ReportController.php
│   │   │   ├── AlertController.php
│   │   │   ├── AuditLogController.php
│   │   │   ├── UserController.php
│   │   │   └── SettingController.php
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Services/
│   │   ├── OverpaymentCalculationService.php
│   │   ├── UploadValidationService.php
│   │   ├── ReportGenerationService.php
│   │   └── AlertService.php
│   └── Console/Commands/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── tests/
    ├── Feature/Api/
    └── Unit/

apps/frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Sidebar, Header, Shell
│   │   ├── dashboard/   # KPI cards, Charts
│   │   ├── pensioners/  # DataTable, Form, Detail
│   │   ├── upload/      # DragDrop, Preview, MappingWizard
│   │   ├── recovery/    # LedgerPanel, InstallmentForm
│   │   ├── reports/     # ReportBuilder, ExportOptions
│   │   ├── alerts/      # NotificationCenter
│   │   └── shared/      # SearchBar, Filters, Pagination
│   ├── hooks/
│   ├── services/        # API client modules
│   ├── lib/             # Utilities, types, constants
│   ├── pages/           # Route pages
│   ├── contexts/        # AuthContext, etc.
│   └── types/           # TypeScript interfaces
└── tests/
    └── components/

**Structure Decision**: Option 2 — Web application matching existing monorepo convention with `apps/backend` (Laravel API) and `apps/frontend` (React SPA). New modules added within each app following existing patterns.

## Complexity Tracking

No constitution violations to justify. All gates pass cleanly.
