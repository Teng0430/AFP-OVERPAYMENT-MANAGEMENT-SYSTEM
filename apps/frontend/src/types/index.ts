export type { Pensioner } from './pensioner';

// ── Role ──
export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

// ── User ──
export interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string | null;
  role_id: number | null;
  role?: Role | null;
  department: string | null;
  is_active: boolean;
  two_factor_enabled: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ── RecoveryInstallment ──
export interface RecoveryInstallment {
  id: number;
  pensioner_id: number;
  installment_no: number;
  date_paid: string;
  amount_paid: number;
  running_balance: number;
  collector: string | null;
  remarks: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentSummary {
  total_overpayment: number;
  total_collected: number;
  remaining_balance: number;
  collection_percentage: number;
  expected_completion: string | null;
}

// ── UploadBatch ──
export type UploadBatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UploadBatch {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  total_rows: number;
  success_count: number;
  error_count: number;
  duplicate_count: number;
  errors: Record<string, unknown>[] | null;
  column_mapping: Record<string, string> | null;
  status: UploadBatchStatus;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

// ── AuditLog ──
export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ── Alert ──
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved';
export type AlertType =
  | 'late-death-report'
  | 'large-overpayment'
  | 'duplicate-pensioner'
  | 'duplicate-account'
  | 'missing-collection'
  | 'negative-balance'
  | 'collection-due'
  | 'system-error';

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  pensioner_id: number | null;
  assigned_to: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Setting ──
export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface Setting {
  id: number;
  group: string;
  key: string;
  value: string;
  type: SettingType;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ── API Response Envelope ──
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Dashboard ──
export interface DashboardKpi {
  total_pensioners: number;
  active_monitoring_cases: number;
  total_overpayment: number;
  total_amount_collected: number;
  outstanding_balance: number;
  recovery_rate: number;
  newly_uploaded_records: number;
  pending_verification: number;
  recovered_accounts: number;
  recovered_but_incomplete: number;
  trends: Record<string, { direction: 'up' | 'down'; percentage: number }>;
  sparklines: Record<string, number[]>;
}

export interface DashboardCharts {
  monthly_overpayment_trend: { month: string; amount: number }[];
  overpayment_by_rank: { rank: string; amount: number }[];
  status_distribution: { status: string; count: number }[];
  collection_progress: { month: string; collected: number; target: number }[];
  agency_recoveries: { agency: string; total_overpayment: number; collected: number }[];
  monthly_recoveries_heatmap: { year: number; month: number; amount: number }[];
}

// ── Enums / Constants ──
export const RANK_OPTIONS = [
  { value: 'GEN', label: 'General' },
  { value: 'LTG', label: 'Lieutenant General' },
  { value: 'MG', label: 'Major General' },
  { value: 'BGEN', label: 'Brigadier General' },
  { value: 'COL', label: 'Colonel' },
  { value: 'LTC', label: 'Lieutenant Colonel' },
  { value: 'MAJ', label: 'Major' },
  { value: 'CPT', label: 'Captain' },
  { value: '1LT', label: 'First Lieutenant' },
  { value: '2LT', label: 'Second Lieutenant' },
  { value: 'ENS', label: 'Ensign' },
  { value: 'LTJG', label: 'Lieutenant Junior Grade' },
  { value: 'LT', label: 'Lieutenant' },
  { value: 'LCDR', label: 'Lieutenant Commander' },
  { value: 'CDR', label: 'Commander' },
  { value: 'CAPT', label: 'Captain (Navy)' },
  { value: 'CMS', label: 'Chief Master Sergeant' },
  { value: 'MSG', label: 'Master Sergeant' },
  { value: 'TSG', label: 'Technical Sergeant' },
  { value: 'SSG', label: 'Staff Sergeant' },
  { value: 'SGT', label: 'Sergeant' },
  { value: 'CPL', label: 'Corporal' },
  { value: 'PFC', label: 'Private First Class' },
  { value: 'PVT', label: 'Private' },
] as const;

export const AGENCY_OPTIONS = [
  { value: 'LBP', label: 'Land Bank of the Philippines (LBP)' },
  { value: 'DBP', label: 'Development Bank of the Philippines (DBP)' },
  { value: 'PVB', label: 'Philippine Veterans Bank (PVB)' },
  { value: 'PNB', label: 'Philippine National Bank (PNB)' },
  { value: 'BDO', label: 'BDO Unibank' },
  { value: 'METROBANK', label: 'Metropolitan Bank & Trust Company' },
  { value: 'BPI', label: 'Bank of the Philippine Islands (BPI)' },
  { value: 'CHINABANK', label: 'China Banking Corporation' },
  { value: 'UCPB', label: 'United Coconut Planters Bank' },
  { value: 'PSBANK', label: 'Philippine Savings Bank' },
  { value: 'EASTWEST', label: 'EastWest Bank' },
  { value: 'SECURITY', label: 'Security Bank Corporation' },
  { value: 'RCBC', label: 'Rizal Commercial Banking Corporation' },
  { value: 'UNIONBANK', label: 'Union Bank of the Philippines' },
  { value: 'OTHER', label: 'Other Bank/Institution' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'not-yet-recovered', label: 'Not Yet Recovered', color: 'red' },
  { value: 'recovered', label: 'Recovered', color: 'green' },
  { value: 'recovered-but-inc', label: 'Recovered But Incomplete', color: 'yellow' },
] as const;

export const CAUSE_OF_STOPPAGE_OPTIONS = [
  { value: 'Late Death Reporting', label: 'Late Death Reporting' },
  { value: 'Remarried', label: 'Remarried' },
  { value: 'Prior Marriage', label: 'Prior Marriage' },
  { value: 'Termination of Benefits', label: 'Termination of Benefits' },
  { value: 'Suspension', label: 'Suspension' },
  { value: 'Other', label: 'Other' },
] as const;
