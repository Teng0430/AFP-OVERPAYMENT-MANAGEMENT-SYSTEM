import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; percentage: number };
  sparkline?: number[];
  accent?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
}

const accentMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

const accentBorderMap: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  yellow: 'border-l-yellow-500',
  purple: 'border-l-purple-500',
  orange: 'border-l-orange-500',
};

function KpiCard({ icon: Icon, label, value, trend, sparkline, accent = 'blue' }: KpiCardProps) {
  const sparkData = sparkline?.map((v, i) => ({ i, v })) ?? [];

  return (
    <Card
      className={cn(
        'border-l-4 overflow-hidden',
        accentBorderMap[accent],
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-lg p-2 text-white', accentMap[accent])}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600',
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.percentage.toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-2xl font-bold">{value}</span>
          {sparkData.length > 0 && (
            <div className="w-24 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id={`sparkline-grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-color, #3b82f6)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent-color, #3b82f6)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--accent-color, #3b82f6)"
                    fill={`url(#sparkline-grad-${label})`}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiCard;
