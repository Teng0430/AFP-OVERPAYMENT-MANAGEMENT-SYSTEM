# Data Model: Pension Overpayment Monitoring System

**Phase**: 1 — Design & Contracts | **Date**: 2026-07-05

## Entity Relationship Summary

```
users ── belongsTo ──> roles
pensioners ── hasMany ──> overpayments
pensioners ── hasMany ──> recovery_installments
pensioners ── hasMany ──> collections
pensioners ── belongsTo ──> upload_batches
upload_batches ── belongsTo ──> users
audit_logs ── belongsTo ──> users
alerts ── belongsTo ──> users (optional)
settings ── single-row config
```

---

## Entity Definitions

### 1. roles

Stores system roles for RBAC.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| name | varchar(100) | NOT NULL, UNIQUE | Display name |
| slug | varchar(50) | NOT NULL, UNIQUE | Role identifier: super-admin, finance-admin, finance-officer, encoder, viewer, auditor |
| description | text | nullable | |
| permissions | json | NOT NULL | JSON array of permission slugs |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Seed data**: 6 rows matching the six roles defined in the spec.

---

### 2. users

Extends existing `users` table (from Feature 003) with role FK.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| name | varchar(255) | NOT NULL | |
| email | varchar(255) | NOT NULL, UNIQUE | |
| password | varchar(255) | NOT NULL | bcrypt hashed |
| role_id | bigint | NOT NULL, FK → roles.id | New column added to existing table |
| department | varchar(255) | nullable | |
| profile_image | varchar(255) | nullable | URL or path |
| is_active | boolean | NOT NULL, DEFAULT true | |
| two_factor_enabled | boolean | NOT NULL, DEFAULT false | |
| email_verified_at | timestamp | nullable | |
| remember_token | varchar(100) | nullable | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `index_users_role_id`, `index_users_email`, `index_users_is_active`

**Relationships**: `belongsTo(Role)`, `hasMany(AuditLog)`, `hasMany(UploadBatch)`, `hasMany(Alert)`

---

### 3. pensioners

Core entity representing an AFP member whose pension is being monitored.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| rank | varchar(20) | NOT NULL | From predefined rank list |
| name | varchar(255) | NOT NULL | Full name |
| serial_number | varchar(50) | NOT NULL, UNIQUE | AFP serial/control number |
| account_number | varchar(50) | nullable | Bank account number |
| date_of_death | date | nullable | |
| cause_of_stoppage | varchar(255) | NOT NULL | Late death, remarried, prior marriage, termination, suspension |
| agency_name | varchar(50) | NOT NULL | From predefined agency list (LBP, DBP, PVB, etc.) |
| monthly_pension | decimal(12,2) | NOT NULL, >= 0 | |
| agency_deduction | decimal(12,2) | nullable, DEFAULT 0 | |
| fractional_days | decimal(5,3) | NOT NULL, DEFAULT 0 | Fraction of month (e.g., 0.5 = 15 days) |
| whole_months | integer | NOT NULL, DEFAULT 0 | Number of whole months overpaid |
| amount_collected | decimal(12,2) | NOT NULL, DEFAULT 0 | Total collected so far |
| date_collected | date | nullable | Date of last collection |
| status | enum | NOT NULL | recovered, not-yet-recovered, recovered-but-inc |
| upload_batch_id | bigint | nullable, FK → upload_batches.id | |
| created_by | bigint | nullable, FK → users.id | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Computed fields** (not stored — calculated on read):
- `computation_of_days` = monthly_pension × fractional_days
- `computation_in_months` = monthly_pension × whole_months
- `overpayment_subtotal` = computation_of_days + computation_in_months
- `overpayment_total` = SUM of overpayment_subtotal for all pensioners with same name
- `balance` = overpayment_total − amount_collected

**Indexes**: 
- `index_pensioners_name` (full-text for global search)
- `index_pensioners_serial_number` (full-text for global search)
- `index_pensioners_account_number` (full-text for global search)
- `index_pensioners_rank`
- `index_pensioners_agency_name`
- `index_pensioners_status`
- `index_pensioners_cause_of_stoppage`
- `index_pensioners_date_of_death`
- `index_pensioners_upload_batch_id`
- `index_pensioners_created_by`

**Relationships**: `belongsTo(UploadBatch)`, `belongsTo(User, created_by)`, `hasMany(RecoveryInstallment)`, `hasMany(Collection)`

---

### 4. recovery_installments

Tracks installment payments for "Recovered But Inc." pensioners.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| pensioner_id | bigint | NOT NULL, FK → pensioners.id | |
| installment_no | integer | NOT NULL | Sequential per pensioner |
| date_paid | date | NOT NULL | |
| amount_paid | decimal(12,2) | NOT NULL, > 0 | |
| running_balance | decimal(12,2) | NOT NULL | Computed as previous balance − amount_paid |
| collector | varchar(255) | nullable | Person who collected payment |
| remarks | text | nullable | |
| created_by | bigint | nullable, FK → users.id | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `index_recovery_installments_pensioner_id`, `index_recovery_installments_date_paid`

**Relationships**: `belongsTo(Pensioner)`, `belongsTo(User, created_by)`

---

### 5. collections

Tracks collection events (may reference installments or be standalone).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| pensioner_id | bigint | NOT NULL, FK → pensioners.id | |
| amount | decimal(12,2) | NOT NULL, > 0 | |
| collection_date | date | NOT NULL | |
| collection_type | varchar(50) | NOT NULL | installment, full-payment, write-off |
| reference | varchar(255) | nullable | OR number or reference |
| collector | varchar(255) | nullable | |
| remarks | text | nullable | |
| created_by | bigint | nullable, FK → users.id | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `index_collections_pensioner_id`, `index_collections_collection_date`

**Relationships**: `belongsTo(Pensioner)`, `belongsTo(User, created_by)`

---

### 6. upload_batches

Tracks bulk import operations.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| file_name | varchar(255) | NOT NULL | Original filename |
| file_type | varchar(10) | NOT NULL | txt, csv, xlsx |
| file_size | integer | NOT NULL | Bytes |
| total_rows | integer | NOT NULL | Rows in file |
| success_count | integer | NOT NULL, DEFAULT 0 | Successfully imported |
| error_count | integer | NOT NULL, DEFAULT 0 | Rows with errors |
| duplicate_count | integer | NOT NULL, DEFAULT 0 | Duplicate rows found |
| errors | json | nullable | Array of error details per row |
| column_mapping | json | nullable | File column → system field mapping |
| status | enum | NOT NULL | pending, processing, completed, failed |
| uploaded_by | bigint | NOT NULL, FK → users.id | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `index_upload_batches_uploaded_by`, `index_upload_batches_status`

**Relationships**: `belongsTo(User, uploaded_by)`, `hasMany(Pensioner)`

---

### 7. audit_logs

Tracks all user actions for compliance and auditing.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| user_id | bigint | nullable, FK → users.id | Null for system actions |
| action | varchar(50) | NOT NULL | login, logout, create, update, delete, upload, export, approve |
| entity_type | varchar(50) | NOT NULL | pensioner, user, upload_batch, etc. |
| entity_id | bigint | nullable | ID of affected record |
| description | text | nullable | Human-readable summary |
| old_values | json | nullable | Previous state |
| new_values | json | nullable | New state |
| ip_address | varchar(45) | nullable | |
| user_agent | text | nullable | |
| created_at | timestamp | NOT NULL | |

**Indexes**: `index_audit_logs_user_id`, `index_audit_logs_action`, `index_audit_logs_entity_type_entity_id`, `index_audit_logs_created_at`

**Relationships**: `belongsTo(User)`

---

### 8. alerts

System-generated notifications about conditions requiring attention.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| type | varchar(50) | NOT NULL | late-death-report, large-overpayment, duplicate-pensioner, duplicate-account, missing-collection, negative-balance, collection-due, system-error |
| severity | enum | NOT NULL | critical, warning, info, resolved |
| title | varchar(255) | NOT NULL | |
| message | text | NOT NULL | |
| pensioner_id | bigint | nullable, FK → pensioners.id | Optional link |
| assigned_to | bigint | nullable, FK → users.id | |
| is_read | boolean | NOT NULL, DEFAULT false | |
| read_at | timestamp | nullable | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `index_alerts_type`, `index_alerts_severity`, `index_alerts_is_read`, `index_alerts_assigned_to`

**Relationships**: `belongsTo(Pensioner)`, `belongsTo(User, assigned_to)`

---

### 9. settings

Singleton configuration table (key-value with typed values).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint, auto-increment | PK | |
| group | varchar(50) | NOT NULL | financial, recovery, calculation, upload, notification, audit, system |
| key | varchar(100) | NOT NULL | Setting identifier |
| value | text | NOT NULL | JSON-encoded value |
| type | varchar(20) | NOT NULL, DEFAULT 'string' | string, number, boolean, json |
| description | text | nullable | |
| created_at | timestamp | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Indexes**: `unique_settings_group_key` (composite unique on group + key)

**Seed data**: Default calculation formulas, notification preferences, upload validation rules.

---

## Validation Rules

### Pensioner
- `rank`: must be one of the predefined military rank values
- `name`: required, max 255 chars, must not be only whitespace
- `serial_number`: required, unique, alphanumeric with hyphens allowed
- `monthly_pension`: required, decimal(12,2), must be >= 0
- `fractional_days`: decimal(5,3), must be >= 0 and <= 31 (interpretation: days in a month max)
- `whole_months`: integer, must be >= 0
- `amount_collected`: decimal(12,2), must be >= 0, cannot exceed overpayment_total on update
- `status`: must be one of recovered, not-yet-recovered, recovered-but-inc
- `agency_name`: must be one of the predefined agency values
- `cause_of_stoppage`: required, max 255 chars

### Recovery Installment
- `pensioner_id`: must reference existing pensioner with status recovered-but-inc
- `amount_paid`: required, must be > 0
- `date_paid`: required, cannot be in the future
- `running_balance`: automatically computed, must be >= 0

### Upload Batch
- `file_type`: must be txt, csv, or xlsx
- `file_size`: max 10MB
- `column_mapping`: all required system fields must be mapped

---

## State Transitions

### Pensioner Status

```
recovered ────────────────────── (terminal)
not-yet-recovered ──> recovered (full payment)
not-yet-recovered ──> recovered-but-inc (partial payment started)
recovered-but-inc ──> recovered (remaining balance paid)
recovered-but-inc ──> not-yet-recovered (if all installments voided — rare)
```

### Upload Batch Status

```
pending ──> processing ──> completed
                       └──> failed
```
