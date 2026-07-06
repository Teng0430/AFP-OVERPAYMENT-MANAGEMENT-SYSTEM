import type { AgencyDeduction } from './index';

export interface Pensioner {
  id: number;
  rank: string;
  name: string;
  serial_number: string;
  account_number: string | null;
  date_of_death: string | null;
  last_payment: string | null;
  cause_of_stoppage: string;
  agency_name: string;
  monthly_pension: number;
  agency_deduction: number;
  agency_deductions: AgencyDeduction[];
  fractional_days: number;
  whole_months: number;
  start_date: string | null;
  end_date: string | null;
  daily_rate: number | null;
  total_overpayment_days: number | null;
  overpayment_amount: number | null;
  amount_collected: number;
  date_collected: string | null;
  status: 'recovered' | 'not-yet-recovered' | 'recovered-but-inc';
  upload_batch_id: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  computation_of_days: number;
  computation_in_months: number;
  overpayment_subtotal: number;
  overpayment_total: number;
  balance: number;
}
