export interface HeroStat {
  label: string;
  value: number;
  format: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
}

export const HERO_STATS: HeroStat[] = [
  { label: 'Total Pensioners', value: 12580, format: 'number' },
  { label: 'Recovered Accounts', value: 8742, format: 'number' },
  { label: 'Outstanding Balance', value: 284567890, format: 'currency', prefix: '₱' },
  { label: 'Monthly Collections', value: 12456780, format: 'currency', prefix: '₱' },
  { label: 'Recovery Rate', value: 73.5, format: 'percentage', suffix: '%' },
];

export function formatHeroStat(stat: HeroStat): string {
  switch (stat.format) {
    case 'number':
      return stat.value.toLocaleString('en-PH');
    case 'currency': {
      const formatted = Math.abs(stat.value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${stat.prefix || ''}${formatted}`;
    }
    case 'percentage':
      return `${stat.value.toFixed(1)}${stat.suffix || '%'}`;
    default:
      return String(stat.value);
  }
}
