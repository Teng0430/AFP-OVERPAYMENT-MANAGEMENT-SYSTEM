import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import LoginCard from '@/components/login/LoginCard';
import HeroSection from '@/components/login/HeroSection';
import SecurityBadges from '@/components/login/SecurityBadges';
import LoginFooter from '@/components/login/LoginFooter';
import EnterpriseAlert, { getErrorTypeFromMessage, type ErrorType } from '@/components/login/EnterpriseAlert';
import AnimatedBackground from '@/components/login/AnimatedBackground';
import type { LoginFormData } from '@/components/login/loginSchema';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);

  const logoutParam = searchParams.get('logout');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError({
        type: getErrorTypeFromMessage(message),
        message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col items-center justify-center px-4 py-8 lg:w-1/2 lg:px-8">
          <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full"
            >
              {logoutParam && (
                <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-xs text-green-200 backdrop-blur-sm" role="alert">
                  {logoutParam}
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={error.type}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md"
                >
                  <EnterpriseAlert
                    type={error.type}
                    onDismiss={() => setError(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <LoginCard onSubmit={handleSubmit} isLoading={isLoading} />

            <SecurityBadges />
          </div>
        </div>

        <HeroSection />
      </div>

      <LoginFooter />
    </div>
  );
}

export default LoginPage;
