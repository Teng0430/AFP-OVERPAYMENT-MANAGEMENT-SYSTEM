import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgencyRecoveriesChartProps {
  data: { agency: string; total_overpayment: number; collected: number }[];
}

function AgencyRecoveriesChart({ data }: AgencyRecoveriesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agency Recoveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="agency" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_overpayment"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Total Overpayment"
              />
              <Bar
                dataKey="collected"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                name="Collected"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgencyRecoveriesChart;
