import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import StatisticsOverlay from './StatisticsOverlay';
import LiveClock from './LiveClock';

function HeroSection() {
  return (
    <div className="hidden lg:flex relative flex-1 flex-col items-center justify-center overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 text-center"
        >
          <LiveClock />
        </motion.div>

        <div className="grid w-full max-w-sm gap-6">
          <StatisticsOverlay />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Secure Financial Monitoring Platform</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#C9A227]/30" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#C9A227]/50">AFP Finance Center</span>
            <span className="h-px w-8 bg-[#C9A227]/30" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default HeroSection;
