import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getKpis, getCharts } from '@/services/dashboard';
import type { DashboardKpi, DashboardCharts } from '@/types';
import KpiGrid from '@/components/dashboard/KpiGrid';
import MonthlyOverpaymentChart from '@/components/dashboard/MonthlyOverpaymentChart';
import OverpaymentByRankChart from '@/components/dashboard/OverpaymentByRankChart';
import StatusDistributionChart from '@/components/dashboard/StatusDistributionChart';
import CollectionProgressChart from '@/components/dashboard/CollectionProgressChart';
import AgencyRecoveriesChart from '@/components/dashboard/AgencyRecoveriesChart';
import MonthlyRecoveriesHeatmap from '@/components/dashboard/MonthlyRecoveriesHeatmap';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKpi | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [kpiData, chartData] = await Promise.all([
          getKpis(),
          getCharts(),
        ]);
        setKpis(kpiData);
        setCharts(chartData);
      } catch {
        // Error handled by api interceptor
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No dashboard data available</p>
        <p className="text-sm text-muted-foreground">
          Upload pensioner records to see your dashboard metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {user?.name}. Here is your executive overview.
        </p>
      </div>

      <KpiGrid data={kpis} />

      {charts && (
        <div className="grid gap-6 md:grid-cols-2">
          <MonthlyOverpaymentChart data={charts.monthly_overpayment_trend} />
          <OverpaymentByRankChart data={charts.overpayment_by_rank} />
          <StatusDistributionChart data={charts.status_distribution} />
          <CollectionProgressChart data={charts.collection_progress} />
          <AgencyRecoveriesChart data={charts.agency_recoveries} />
          <MonthlyRecoveriesHeatmap data={charts.monthly_recoveries_heatmap} />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
