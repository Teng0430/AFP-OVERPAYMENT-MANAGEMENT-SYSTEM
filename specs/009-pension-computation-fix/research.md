# Research: Fix Pensioner Computation & Connection Handling

## Decision 1: Net Monthly Pension Formula

**Decision**: Only subtract non-crediting agency deductions from Gross Monthly Pension when computing Net Monthly Pension (Crediting Agency Amount). The crediting agency's own deduction is excluded from the subtraction.

**Rationale**: The crediting agency is the bank/institution where the net pension is deposited. Its deduction represents the pensioner's obligation to that institution, but the crediting amount is the actual pension disbursed. Only non-crediting agencies' deductions reduce the disbursable pension. This matches the business rule that the crediting agency receives the residual amount after all other agency deductions.

**Alternatives considered**:
- Subtract all deductions (current implementation from 008) — incorrect because it double-counts the crediting agency's position (they receive the net amount, so their own deduction shouldn't reduce it further).
- Allow manual entry — rejected because it's error-prone and the formula is fixed by business rules.

**Implementation**: In `OverpaymentCalculationService::netMonthlyPension()`, filter deductions to only those where `crediting_agency` is `false` (or not `true`) before summing.

## Decision 2: Pension Summary Display

**Decision**: Remove the "Deductions" row. Display only three rows: Gross Monthly Pension, Total Agency (sum of non-crediting deductions), Net Monthly Pension (= Crediting Agency Amount).

**Rationale**: The previous "Deductions" field was ambiguous — it wasn't clear whether it represented the crediting agency amount, total deductions, or something else. The three-row format is unambiguous and maps directly to the business concepts.

**Alternatives considered**:
- Keep "Deductions" as total of all deductions (including crediting) — confusing because the net pension would then differ from the crediting amount.
- Add explanatory tooltips without removing the row — more complex, doesn't solve the core ambiguity.

## Decision 3: Connection Error Handling

**Decision**: Enhance the axios error interceptor in `api.ts` to distinguish these error types with specific messages:
- **No response / network error** → "Unable to connect. Please check your internet connection and try again." (keep existing)
- **CORS error** → Detected by checking for network errors on requests that never reach the server; add diagnostic guidance about configuration
- **DNS failure / timeout** → Treated as network error with more specific message
- **Server error (5xx)** → "Service temporarily unavailable. Please try again later." (keep existing)
- **Validation error (422)** → Field-level messages with summary (keep existing)
- **401** → "Invalid username or password." (keep existing)
- **403/423** → "Account locked. Please contact your administrator." (keep existing)

**Rationale**: The current interceptor already handles most cases, but the "Unable to connect" message appears for any error where `error.response` is undefined. This includes CORS errors, DNS failures, timeouts, and actual network disconnections. While these are all "connection" issues, distinguishing CORS/config errors gives developers and users a better diagnostic path.

**Alternatives considered**:
- Single generic message — easier but unhelpful for debugging.
- No error handling — raw axios errors are technical and confusing.
- Console-only detailed logging + user-friendly generic message — compromise approach, but showing different user-facing messages per category is more transparent.

**Implementation**: Check `error.code` (axios error codes like `ERR_NETWORK`, `ECONNABORTED`) and `error.message` patterns to distinguish CORS errors (no `Access-Control-Allow-Origin` header) from DNS failures and timeouts. Map each to an appropriate message category.

## Decision 4: Backward Compatibility

**Decision**: Existing pensioner records will be recalculated on load using the new formula. The `net_monthly_pension` value will change for records where the crediting agency has a non-zero deduction amount.

**Rationale**: No new columns are needed. The formula is purely computational and applied at query time via model accessors. Existing records automatically pick up the corrected calculation.

**Migration path**: No database migration required. The accessor change is transparent.
