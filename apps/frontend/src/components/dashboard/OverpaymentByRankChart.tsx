import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverpaymentByRankChartProps {
  data: { rank: string; amount: number }[];
}

function OverpaymentByRankChart({ data }: OverpaymentByRankChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overpayment by Rank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="rank"
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip />
              <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default OverpaymentByRankChart;
