import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HERO_STATS, formatHeroStat } from './heroStats';

function AnimatedStat({ value, formatStat }: { value: number; formatStat: (val: number) => string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return <>{formatStat(displayValue)}</>;
}

function StatisticsOverlay() {
  return (
    <div className="space-y-4">
      {HERO_STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.5, ease: 'easeOut' }}
          className="glass rounded-xl border border-white/10 p-4"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">{stat.label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-white">
            <AnimatedStat value={stat.value} formatStat={formatHeroStat} />
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default StatisticsOverlay;
