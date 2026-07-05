# Research & Design Decisions: Pension Overpayment Monitoring System

**Phase**: 0 — Outline & Research | **Date**: 2026-07-05

## Overview

This document captures all technical decisions, rationale, and alternatives considered during planning for the AFP Pension Overpayment Monitoring System (POMS). The feature spec contained no [NEEDS CLARIFICATION] markers; all decisions below derive from the existing project constitution, feature spec requirements, and industry best practices for government financial systems.

---

## Decision 1: Monorepo Structure with Existing Apps

**Decision**: Use existing `apps/backend` (Laravel 11.x) and `apps/frontend` (React 19.2.x + Vite) monorepo structure, adding new modules within each.

**Rationale**: The project already follows this structure for features 001-004. Adding a third app (e.g., `apps/poms`) would violate constitution simplicity principles and increase deployment complexity. The existing apps support all required functionality (REST API in Laravel, SPA in React).

**Alternatives Considered**:
- New standalone app — rejected: duplicates existing infrastructure, violates DRY principle
- Monolithic single app — rejected: would require abandoning the existing two-app architecture

---

## Decision 2: Database Engine — MySQL 8.4 LTS

**Decision**: MySQL 8.4 LTS (primary), SQLite in-memory (Pest tests).

**Rationale**: Constitution mandates MySQL 8.4 LTS for the primary database. PostgreSQL was mentioned in the user prompt but conflicts with the established constitution. MySQL provides all required features (transactions, JSON columns for flexible fields, full-text search for global search).

**Alternatives Considered**:
- PostgreSQL — mentioned in user prompt but constitution mandates MySQL 8.4 LTS

---

## Decision 3: Authentication — Laravel Sanctum (extending existing)

**Decision**: Extend existing Laravel Sanctum token authentication (Feature 003) with role-based access control (RBAC) by adding a `role_id` FK on the `users` table and a `roles` table with permissions.

**Rationale**: The constitution mandates Laravel Sanctum for authentication. The existing auth system (Feature 003) already provides register, login, logout, and token management. Adding RBAC is a natural extension — add `roles` and `role_user` pivot tables, assign roles on registration, and check permissions via middleware.

**Alternatives Considered**:
- Separate JWT library — unnecessary; Sanctum already issues API tokens with scopes
- OAuth2 — overkill for a single-organization internal financial system

---

## Decision 4: Frontend Data Table — TanStack Table

**Decision**: Use TanStack Table (React Table) for the enterprise data grid.

**Rationale**: TanStack Table provides: column visibility, resizable columns, sticky columns, sorting, filtering, pagination, virtual scrolling, and export hooks. It integrates well with React 19 and shadcn/ui which the project already uses.

**Alternatives Considered**:
- AG Grid — powerful but introduces a heavy dependency; the existing project doesn't use it
- MUI Data Grid — would require importing Material UI, conflicting with shadcn/ui design system

---

## Decision 5: Charting — Recharts

**Decision**: Use Recharts for all dashboard analytics (line chart, bar chart, pie chart, area chart, stacked bar, heatmap).

**Rationale**: Recharts is built on React components, supports all required chart types (line, bar, pie, area, stacked bar), is lightweight, and integrates naturally with React 19. It's a common choice alongside shadcn/ui in enterprise dashboards.

**Alternatives Considered**:
- Chart.js — would require react-chartjs-2 wrapper; less React-idiomatic
- D3.js — lower-level, more complex to implement the required chart types
- Nivo — less mature, smaller community

---

## Decision 6: Form Handling — React Hook Form + Zod

**Decision**: Use React Hook Form with Zod schema validation for all forms (Add Pensioner, Filters, Reports, Settings).

**Rationale**: React Hook Form provides performant form state management with minimal re-renders. Zod provides runtime type validation with TypeScript inference. The combination enables real-time validation and the live financial summary card updates required by the spec.

**Alternatives Considered**:
- Formik + Yup — heavier, more boilerplate; React Hook Form is the modern standard
- Plain controlled components — sufficient but lacks validation framework and type safety

---

## Decision 7: Financial Computation Logic — Backend Service + Frontend Real-time

**Decision**: Implement financial computation logic twice: (1) a Laravel Service class (`OverpaymentCalculationService`) for server-side calculation, and (2) real-time calculation in the React frontend for the live summary card. The backend is the source of truth; frontend mirrors logic for UX responsiveness.

**Rationale**: The spec requires real-time updates (FR-013) without page refresh or form submission. Client-side calculation is essential for this UX. Server-side recalculation ensures data integrity when saving and enables batch operations.

**Formulas**:
- Computation of Days = Monthly Pension × Fractional Days
- Computation in Months = Monthly Pension × Whole Months
- Overpayment Subtotal = Computation of Days + Computation in Months
- Overpayment Total = SUM of all Overpayment Subtotals for same pensioner name
- Balance = Overpayment Total − Amount Collected
- Recovery Rate % = (Amount Collected / Overpayment Total) × 100

**Edge Cases**:
- Zero or negative monthly pension → validation rejects negatives, allows zero with warning
- Over-collection → balance constrained to minimum of zero
- Exact name match for Overpayment Total grouping → serial number used as tiebreaker for name variants

---

## Decision 8: File Upload — Laravel Excel + Custom Validation

**Decision**: Use Laravel Excel (Maatwebsite/Laravel-Excel) for TXT/CSV/Excel parsing on the backend, with a custom `UploadValidationService` for duplicate detection, column validation, and error summary generation. Frontend uses a drag-and-drop zone with file preview before submission.

**Rationale**: Laravel Excel is the de facto standard for spreadsheet import/export in Laravel. Custom validation is needed because the spec requires duplicate detection, missing column warnings, and column mapping — features beyond what Laravel Excel provides natively.

**Alternatives Considered**:
- OpenSpout — lower-level; Laravel Excel already wraps it with Laravel-friendly API
- Custom CSV parser — unnecessary complexity given Laravel Excel's maturity

---

## Decision 9: RBAC Implementation — Middleware + Policies

**Decision**: Implement RBAC using Laravel middleware (route-level) and Form Request authorization (action-level). Roles defined in a `roles` table; permissions as a JSON column or pivot table depending on complexity.

**Six Roles**: Super Admin (full access), Finance Admin (manage + approve), Finance Officer (operational CRUD), Encoder (add-only), Viewer (read-only), Auditor (read-only + audit log access).

**Permission Model**:
- `roles` table: id, name, slug, description, permissions (JSON)
- `users.role_id` FK on users table
- Middleware: `CheckRole('finance-admin|super-admin')` for protected routes
- Policies: `PensionerPolicy`, `UploadPolicy`, etc. for granular action-level control

---

## Decision 10: Report Generation — Laravel Excel + DOMPDF

**Decision**: Use Laravel Excel for CSV/Excel export and barryvdh/laravel-dompdf for PDF report generation. Frontend triggers download via API endpoints.

**Rationale**: These are the most commonly used Laravel packages for reporting. Laravel Excel handles large datasets efficiently via chunking. DOMPDF renders HTML templates to PDF, allowing styled government-formatted reports.

**Alternatives Considered**:
- Laravel Snappy (wkhtmltopdf) — more CPU-intensive, harder to configure in containerized environments
- Only use Laravel Excel for all formats — PDF support from Laravel Excel is limited

---

## Decision 11: Global Search — MySQL Full-Text Index + LIKE

**Decision**: Use MySQL full-text indexes on `pensioners.name`, `pensioners.serial_number`, and `pensioners.account_number` for fast global search. Use LIKE queries for partial matches on rank, agency, status, and cause of stoppage (which have limited distinct values).

**Rationale**: Full-text search in MySQL is built-in, requires no additional infrastructure, and handles the expected 10k+ record scale efficiently. The spec requires search within 2 seconds which is achievable with proper indexing.

**Alternatives Considered**:
- Meilisearch/Algolia — excellent but requires separate service; overkill for single-table search
- Laravel Scout + database driver — adds abstraction layer but MySQL full-text is sufficient

---

## Decision 12: Alerts — Database-Driven + Scheduled Checks

**Decision**: Store alerts in a `notifications`/`alerts` database table. Generate alerts via Laravel scheduled tasks (kernel commands) that run periodically (e.g., every hour) to check conditions: late death reports, large overpayments, duplicate records, missing collections, negative balances, collection due dates, and system errors.

**Rationale**: Scheduled checks are simpler and more reliable than real-time event-driven alerts for a financial system. The hourly cadence is appropriate for monitoring — immediate sub-second alerts aren't required for this use case. Color-coding maps to severity levels (Red=critical, Yellow=warning, Blue=info, Green=resolved).

**Alternatives Considered**:
- Real-time event broadcasting (Laravel Echo + WebSockets) — adds infrastructure complexity; overkill for alert generation
- Queue-based alerts — possible, but scheduled checks provide simpler recovery and audit trail
