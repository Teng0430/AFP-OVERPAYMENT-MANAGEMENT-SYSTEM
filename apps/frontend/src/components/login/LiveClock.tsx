import { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = time.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="text-center" aria-label={`Philippine Time: ${timeStr}, ${dateStr}`} role="timer">
      <p className="text-2xl font-bold tracking-wider text-white/90">{timeStr}</p>
      <p className="mt-1 text-xs text-white/60">{dateStr}</p>
      <p className="mt-0.5 text-[10px] text-[#C9A227]/70 font-medium uppercase tracking-widest">PHT (UTC+8)</p>
    </div>
  );
}

export default LiveClock;
