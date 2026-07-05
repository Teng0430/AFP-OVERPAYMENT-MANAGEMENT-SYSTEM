import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface MonthlyRecoveriesHeatmapProps {
  data: { year: number; month: number; amount: number }[];
}

function MonthlyRecoveriesHeatmap({ data }: MonthlyRecoveriesHeatmapProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: `${MONTH_NAMES[d.month - 1] ?? ''} ${d.year}`,
    key: `${d.year}-${String(d.month).padStart(2, '0')}`,
  }));

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

  const getColor = (amount: number) => {
    if (amount === 0) return '#f3f4f6';
    const intensity = Math.min(amount / maxAmount, 1);
    if (intensity < 0.25) return '#bbf7d0';
    if (intensity < 0.5) return '#4ade80';
    if (intensity < 0.75) return '#16a34a';
    return '#15803d';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Recoveries Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Collected']}
              />
              <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.amount)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyRecoveriesHeatmap;
