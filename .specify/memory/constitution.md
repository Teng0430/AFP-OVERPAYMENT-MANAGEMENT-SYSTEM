<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version change: 1.0.0 -> 1.0.1
  Modified sections:
    - Technology Stack & Standards (version columns updated from vague "Latest"
      to specific version numbers)
  Added sections: None
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md (already generic - no changes needed)
    - .specify/templates/spec-template.md (already generic - no changes needed)
    - .specify/templates/tasks-template.md (already generic - no changes needed)
    - .specify/templates/checklist-template.md (already generic - no changes needed)
    - .specify/templates/constitution-template.md (already generic - no changes needed)
  Deferred TODOs: None
  ============================================================================
-->

# IDS Constitution

## Core Principles

### I. Code Quality

All PHP code MUST adhere to PSR-12 coding standards; all JavaScript/React code MUST
follow ESLint + Prettier conventions as configured in the project. Static analysis
(PHPStan level 6 for backend, TypeScript strict mode for frontend) MUST pass before
any merge. No dead code, commented-out code, or debug artifacts (dd(), dump(),
console.log, debugger) shall be committed. Every PR MUST receive at least one
approving code review before merging.

*Rationale*: Consistent, clean code reduces maintenance burden, accelerates
onboarding, and prevents regressions.

### II. Testing Standards

All backend features MUST be tested with Pest using an in-memory SQLite database;
all frontend features MUST be tested with Vitest. Every user story MUST have passing
tests before being marked complete. Minimum line coverage: 80% for backend, 70% for
frontend. Contract tests MUST be written for every API endpoint. The full test suite
MUST pass before every commit and every PR merge.

*Rationale*: Comprehensive testing is the safety net that enables confident
refactoring and rapid delivery.

### III. User Experience Consistency

All UI components MUST follow a consistent design system (shared component library,
uniform spacing, typography, and color palette). Every component MUST handle error,
loading, and empty states. All API responses MUST use a consistent JSON envelope
(`{ success: bool, data: ..., error: ... }`). The frontend MUST be responsive
(mobile-first) and meet WCAG 2.1 AA accessibility standards.

*Rationale*: Inconsistent UX erodes user trust, increases support burden, and
dilutes brand identity.

### IV. Performance Requirements

API response time MUST be <200ms at p95 for standard endpoints (excluding file
uploads). N+1 database queries are strictly prohibited; eager loading MUST be used.
Frontend initial bundle size MUST be <500KB gzipped. Hot endpoints MUST employ
caching (Laravel cache facade, Redis, or Octane). Database indexes MUST be present
on all columns used in WHERE, JOIN, and ORDER BY clauses.

*Rationale*: Performance is a feature — slow applications directly cause user churn
and lost revenue.

### V. Security & Data Integrity

Authentication MUST use Laravel Sanctum with bcrypt-hashed passwords. All API
endpoints MUST validate and sanitize input. Never commit .env files or secrets; use
.env.example as the reference. JWT tokens (if used) MUST have expiration; Sanctum
tokens MUST be scoped to the minimum necessary. SQL injection, XSS, and CSRF
protections MUST remain active in all environments.

*Rationale*: Security breaches are existential threats; proactive defense is
non-negotiable.

## Technology Stack & Standards

| Technology | Version |
|-----------|---------|
| Laravel (backend) | 11.x (PHP 8.2+) |
| React (frontend) | 19.2.x |
| MySQL (database) | 8.4 LTS |
| Pest (backend testing, in-memory SQLite) | 4.x |
| Vitest (frontend testing) | 4.1.x |
| Laravel Sanctum + bcrypt (auth) | bundled with Laravel 11 |
| axios (HTTP client) | 1.18.x |
| jsonwebtoken (JWT) | 9.0.x |
| react-router-dom (routing) | 7.18.x |
| Node.js (runtime) | 22.x LTS |
| Project structure | `apps/` for code, `docs/` for docs |

All feature code MUST reside under `apps/`. Documentation and supporting files go
in `docs/`. Environment configuration follows `.env.example` — never commit `.env`
or `.env.*` files.

## Development Workflow & Quality Gates

Development follows a phased workflow:

1. **Specification**: Feature is specified in `specs/[###-feature-name]/spec.md`
   with prioritized user stories (P1, P2, P3).
2. **Planning**: Implementation plan is created with a constitution compliance check.
3. **Setup**: Project scaffolding, dependency installation, tooling configuration.
4. **Foundational**: Shared infrastructure (database, auth, routing) — blocks all
   stories.
5. **Implementation**: User stories implemented in priority order (P1 -> P2 -> P3).
6. **Quality Gates** (MUST pass before merge):
   - Static analysis passes (PHPStan Level 6, TypeScript strict)
   - Full test suite passes (Pest + Vitest)
   - Code review approved (minimum one reviewer)
   - Constitution compliance verified
7. **Polish**: Cross-cutting concerns — documentation updates, cleanup, performance
   tuning.

Complexity violations MUST be documented and justified in the plan.

## Governance

This constitution supersedes all other development guidelines and practices.
Amendments require:
- A documented rationale for the change.
- Team approval before adoption.
- A migration plan if the amendment is backward-incompatible.
- A semantic version bump per the project versioning policy.

**Compliance**: Every PR MUST include a constitution compliance check. Violations
MUST be explicitly justified. Complexity exceeding project needs MUST be flagged
and approved during code review.

---

**Version**: 1.0.1 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-06-27
