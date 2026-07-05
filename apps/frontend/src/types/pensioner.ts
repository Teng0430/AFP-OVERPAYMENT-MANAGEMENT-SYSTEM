export interface Pensioner {
  id: number;
  rank: string;
  name: string;
  serial_number: string;
  account_number: string | null;
  date_of_death: string | null;
  cause_of_stoppage: string;
  agency_name: string;
  monthly_pension: number;
  agency_deduction: number;
  fractional_days: number;
  whole_months: number;
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
