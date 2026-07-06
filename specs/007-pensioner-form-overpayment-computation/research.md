# Research: Pensioner Form & Overpayment Computation Update

## Unknown 1: Backward Compatibility — Old Single Agency Deduction vs New Array

- **Decision**: Store `agency_deductions` as a JSON column representing an array of `{agency_name, amount}` objects. Preserve `agency_deduction` column as a nullable derived field — for existing records it remains; for new records it is populated from the sum of the first entry's amount (or null if no deductions). The UI reads/writes the JSON array; the model casts it to an array. The old column stays for query/report backward compatibility.
- **Rationale**: Zero-migration risk for existing records. Old column can be deprecated in a future release once all consumers are migrated.
- **Alternatives considered**: 
  - Drop+rename old column: breaks existing records.
  - Separate agency_deductions table: overkill for 1-10 rows per pensioner, JSON column is simpler and matches the spec's "array of objects" requirement.

## Unknown 2: Automated Overpayment Computation vs Manual Input

- **Decision**: The new overpayment computation is **read-only / display-only** on the form — computed from `date_of_death`, `last_payment`, and `monthly_pension`. The old `fractional_days` and `whole_months` fields are **removed from the form** (no longer manual inputs). For existing records, these values are preserved in the database but **overwritten** when the user re-saves with new inputs (the computation engine derives them). The backend `OverpaymentCalculationService` is rewritten with the new formula; existing records retain their stored values until explicitly recalculated.
- **Rationale**: The spec says "automatically compute" — manual input conflicts with the requirement. Existing records are read-only for these fields unless re-processed.
- **Alternatives considered**:
  - Keep both manual and auto modes: confusing dual-input UX.
  - Auto-compute only for new records: inconsistent behavior.

## Unknown 3: Making `date_of_death` Required

- **Decision**: `date_of_death` becomes required for **new records** (validation in StorePensionerRequest). Existing records with null `date_of_death` remain valid. The model mutator/accessor handles null gracefully — computation returns zero values when `date_of_death` or `last_payment` is null.
- **Rationale**: The overpayment computation depends on `date_of_death` — it must be present for the formula to work. Backward compatibility with existing null records is maintained.
- **Alternatives considered**:
  - Keep nullable and allow computation only when both dates present: more flexible but lets incomplete records through.

## Technology: Timezone-Safe Date Arithmetic

- **Decision**: All date arithmetic uses UTC internally (PHP `Carbon`, JavaScript `Date` with UTC methods). User-facing dates display in Philippine Time (PHT, UTC+8) but storage and computation use UTC. Month-day arithmetic (days-in-month, leap year) is calendar-based and timezone-agnostic.
- **Rationale**: The computation uses calendar dates (day of month, days in month) which are not timezone-dependent. Using UTC avoids DST ambiguity.
- **Alternatives considered**: 
  - Use PHT everywhere: simpler display but risks DST edge cases.

## Technology: Frontend Computation Library

- **Decision**: Implement the computation engine as a **pure function** in `financial-calculations.ts` with no side effects. Takes `{ dateOfDeath: Date, lastPayment: Date, monthlyPension: number }` and returns `{ startDate, endDate, wholeMonths, fractionalDays, totalDays, dailyRate, overpaymentAmount }`. Extensively unit-tested with Vitest.
- **Rationale**: Pure functions are deterministic, testable, and can be used identically on both frontend (real-time preview) and backend (PHP service reimplements the same logic).
- **Alternatives considered**: 
  - Single source of truth on backend only: introduces latency for real-time preview.
  - Shared Wasm/computation library: overengineered for this scope.

## Backend Service Strategy

- **Decision**: PHP `OverpaymentCalculationService` is rewritten with static methods matching the new formula. The service is called by the `PensionerController` during store/update to persist computed values (`fractional_days`, `whole_months`) to the database. The existing computed accessor attributes (`computationOfDays`, etc.) remain for backward compatibility with existing API consumers.
- **Rationale**: The service pattern is already established. Keeping the old computed attributes as aliases (now deriving from the new computation) prevents breaking existing API responses.
- **Alternatives considered**:
  - Completely new service class: unnecessary duplication.
