import { useEffect, useState } from 'react';
import { Download, FileText, BarChart3, PieChart, Calendar } from 'lucide-react';
import { generate } from '@/services/reports';
import { list } from '@/services/pensioners';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_OPTIONS } from '@/types';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [summary, setSummary] = useState({
    totalPensioners: 0,
    totalOverpayment: 0,
    totalCollected: 0,
    outstandingBalance: 0,
  });
  const [agencyData, setAgencyData] = useState<{ name: string; amount: number }[]>([]);
  const [rankData, setRankData] = useState<{ name: string; amount: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');
      const data = await list({ per_page: 1 });
      const total = data.meta.total;

      const allData = await list({ per_page: total });
      const pensioners = allData.pensioners;

      const overpaymentTotal = pensioners.reduce((s, p) => s + p.overpayment_total, 0);
      const collectedTotal = pensioners.reduce((s, p) => s + p.amount_collected, 0);
      const balanceTotal = pensioners.reduce((s, p) => s + p.balance, 0);

      setSummary({
        totalPensioners: total,
        totalOverpayment: overpaymentTotal,
        totalCollected: collectedTotal,
        outstandingBalance: balanceTotal,
      });

      const agencyMap: Record<string, number> = {};
      pensioners.forEach((p) => {
        agencyMap[p.agency_name] = (agencyMap[p.agency_name] ?? 0) + p.overpayment_total;
      });
      setAgencyData(
        Object.entries(agencyMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
      );

      const rankMap: Record<string, number> = {};
      pensioners.forEach((p) => {
        rankMap[p.rank] = (rankMap[p.rank] ?? 0) + p.overpayment_total;
      });
      setRankData(
        Object.entries(rankMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
      );

      const statusMap: Record<string, number> = { recovered: 0, 'not-yet-recovered': 0, 'recovered-but-inc': 0 };
      pensioners.forEach((p) => {
        statusMap[p.status] = (statusMap[p.status] ?? 0) + 1;
      });
      setStatusData(
        Object.entries(statusMap).map(([key, value]) => ({
          name: STATUS_OPTIONS.find((s) => s.value === key)?.label ?? key,
          value,
        })),
      );
    } catch {
      setError('Failed to load reports data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: 'pdf' | 'csv') {
    try {
      if (format === 'pdf') setExportingPdf(true);
      else setExportingCsv(true);

      const blob = await generate({
        type: 'custom',
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        format,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export report.');
    } finally {
      setExportingPdf(false);
      setExportingCsv(false);
    }
  }

  const recoveryRate = summary.totalOverpayment > 0
    ? ((summary.totalCollected / summary.totalOverpayment) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">View and export overpayment reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36" />
            <span className="text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36" />
          </div>
          <Button variant="outline" size="sm" disabled={exportingPdf} onClick={() => handleExport('pdf')}>
            <FileText className="mr-1 h-4 w-4" /> {exportingPdf ? 'Exporting...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" disabled={exportingCsv} onClick={() => handleExport('csv')}>
            <Download className="mr-1 h-4 w-4" /> {exportingCsv ? 'Exporting...' : 'CSV'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pensioners</CardDescription>
              <CardTitle className="text-3xl">{summary.totalPensioners.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Overpayment</CardDescription>
              <CardTitle className="text-3xl">₱{summary.totalOverpayment.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Collected</CardDescription>
              <CardTitle className="text-3xl">₱{summary.totalCollected.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recovery Rate</CardDescription>
              <CardTitle className="text-3xl">{recoveryRate}%</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Tabs defaultValue="agency">
        <TabsList>
          <TabsTrigger value="agency"><BarChart3 className="mr-1 h-4 w-4" /> Agency Summary</TabsTrigger>
          <TabsTrigger value="rank"><BarChart3 className="mr-1 h-4 w-4" /> Rank Summary</TabsTrigger>
          <TabsTrigger value="status"><PieChart className="mr-1 h-4 w-4" /> Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="agency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overpayment by Agency</CardTitle>
              <CardDescription>Total overpayment amount grouped by agency.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : agencyData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">No data available.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agencyData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Overpayment']} />
                      <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rank" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overpayment by Rank</CardTitle>
              <CardDescription>Total overpayment amount grouped by rank.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : rankData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">No data available.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Overpayment']} />
                      <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Number of pensioners by recovery status.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">No data available.</p>
              ) : (
                <div className="flex items-center justify-center h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsPage;
