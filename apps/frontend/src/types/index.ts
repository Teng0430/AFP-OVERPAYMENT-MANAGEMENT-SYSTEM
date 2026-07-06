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

// ── Agency Deduction ──
export interface AgencyDeduction {
  agency_name: string;
  amount: number;
  crediting_agency?: boolean;
}

// ── Multi-Component Overpayment Result ──
export interface AgencyOverpaymentItem {
  agency_name: string;
  amount: number;
  overpayment: number;
}

export interface MultiComponentResult {
  netMonthlyPension: number;
  netPensionOverpayment: number;
  agencyOverpayments: AgencyOverpaymentItem[];
  grandTotalOverpayment: number;
}

// ── Enums / Constants ──
export const RANK_OPTIONS = [
  { value: 'ADM', label: 'ADM' },
  { value: 'VADM', label: 'VADM' },
  { value: 'RADM', label: 'RADM' },
  { value: 'COMO', label: 'COMO' },
  { value: 'CAPT', label: 'CAPT' },
  { value: 'CDR', label: 'CDR' },
  { value: 'LCDR', label: 'LCDR' },
  { value: 'LT', label: 'LT' },
  { value: 'LTJG', label: 'LTJG' },
  { value: 'ENS', label: 'ENS' },
  { value: 'GEN', label: 'GEN' },
  { value: 'LTGEN', label: 'LTGEN' },
  { value: 'MGEN', label: 'MGEN' },
  { value: 'BGEN', label: 'BGEN' },
  { value: 'COL', label: 'COL' },
  { value: 'LTC', label: 'LTC' },
  { value: 'MAJ', label: 'MAJ' },
  { value: 'CPT', label: 'CPT' },
  { value: '1LT', label: '1LT' },
  { value: '2LT', label: '2LT' },
  { value: 'FOIC', label: 'FOIC' },
  { value: 'MCPO', label: 'MCPO' },
  { value: 'SCPO', label: 'SCPO' },
  { value: 'CPO', label: 'CPO' },
  { value: 'PO1', label: 'PO1' },
  { value: 'PO2', label: 'PO2' },
  { value: 'PO3', label: 'PO3' },
  { value: 'SA', label: 'SA' },
  { value: 'SN', label: 'SN' },
  { value: 'SR', label: 'SR' },
  { value: 'CMSG', label: 'CMSG' },
  { value: 'SMSG', label: 'SMSG' },
  { value: 'MSG', label: 'MSG' },
  { value: 'TSG', label: 'TSG' },
  { value: 'SSG', label: 'SSG' },
  { value: 'SGT', label: 'SGT' },
  { value: 'CPL', label: 'CPL' },
  { value: 'PFC', label: 'PFC' },
  { value: 'PVT', label: 'PVT' },
  { value: 'OW', label: 'OW' },
  { value: 'EW', label: 'EW' },
  { value: 'MR', label: 'MR' },
  { value: 'MS', label: 'MS' },
  { value: 'MRS', label: 'MRS' },
  { value: 'GDN', label: 'GDN' },
] as const;

export const AGENCY_OPTIONS = [
  { value: 'LBP', label: 'LBP' },
  { value: 'DBP', label: 'DBP' },
  { value: 'PVB', label: 'PVB' },
  { value: 'ACDI', label: 'ACDI' },
  { value: 'ACES', label: 'ACES' },
  { value: 'AFPFCMPC', label: 'AFPFCMPC' },
  { value: 'AFPMBAI', label: 'AFPMBAI' },
  { value: 'AFPSLAI', label: 'AFPSLAI' },
  { value: 'AGFO', label: 'AGFO' },
  { value: 'ALIP', label: 'ALIP' },
  { value: 'AMWSLAI', label: 'AMWSLAI' },
  { value: 'AVACC', label: 'AVACC' },
  { value: 'BABSLAI', label: 'BABSLAI' },
  { value: 'BOT B4 ACCT (101)', label: 'BOT B4 ACCT (101)' },
  { value: 'CWSLA', label: 'CWSLA' },
  { value: 'FABSLAI', label: 'FABSLAI' },
  { value: 'KBKP', label: 'KBKP' },
  { value: 'KKMPC', label: 'KKMPC' },
  { value: 'PAFCPIC', label: 'PAFCPIC' },
  { value: 'PNSLAI', label: 'PNSLAI' },
  { value: 'PNRA-CCI', label: 'PNRA-CCI' },
  { value: 'PVB EMER LOAN', label: 'PVB EMER LOAN' },
  { value: 'RSBS 5% OF DIFFL', label: 'RSBS 5% OF DIFFL' },
  { value: 'RSBS 5% OF REG RATE', label: 'RSBS 5% OF REG RATE' },
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
