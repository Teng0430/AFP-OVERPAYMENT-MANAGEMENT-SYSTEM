import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Activity,
  DollarSign,
  Banknote,
  AlertTriangle,
  TrendingUp,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import type { DashboardKpi } from '@/types';

const kpiConfig: {
  key: keyof DashboardKpi;
  icon: LucideIcon;
  label: string;
  accent: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  format?: (v: number) => string;
}[] = [
  { key: 'total_pensioners', icon: Users, label: 'Total Pensioners', accent: 'blue' },
  { key: 'active_monitoring_cases', icon: Activity, label: 'Active Cases', accent: 'orange' },
  { key: 'total_overpayment', icon: DollarSign, label: 'Total Overpayment', accent: 'red', format: (v) => `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
  { key: 'total_amount_collected', icon: Banknote, label: 'Amount Collected', accent: 'green', format: (v) => `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
  { key: 'outstanding_balance', icon: AlertTriangle, label: 'Outstanding Balance', accent: 'red', format: (v) => `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
  { key: 'recovery_rate', icon: TrendingUp, label: 'Recovery Rate', accent: 'green', format: (v) => `${v.toFixed(1)}%` },
  { key: 'newly_uploaded_records', icon: Upload, label: 'New Uploads (30d)', accent: 'blue' },
  { key: 'pending_verification', icon: Clock, label: 'Pending Verification', accent: 'yellow' },
  { key: 'recovered_accounts', icon: CheckCircle, label: 'Recovered', accent: 'green' },
  { key: 'recovered_but_incomplete', icon: AlertCircle, label: 'Recovered (Incomplete)', accent: 'purple' },
];

interface KpiGridProps {
  data: DashboardKpi | null;
  loading?: boolean;
}

function KpiGrid({ data, loading }: KpiGridProps) {
  if (loading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border-l-4 border-muted bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpiConfig.map(({ key, icon: Icon, label, accent, format }) => {
        const value = data[key] as number;
        const trend = data.trends?.[key];
        const sparkline = data.sparklines?.total_overpayment;

        return (
          <KpiCard
            key={key}
            icon={Icon}
            label={label}
            value={format ? format(value) : value.toLocaleString()}
            trend={trend}
            sparkline={key === 'total_overpayment' ? sparkline : undefined}
            accent={accent}
          />
        );
      })}
    </div>
  );
}

export default KpiGrid;
