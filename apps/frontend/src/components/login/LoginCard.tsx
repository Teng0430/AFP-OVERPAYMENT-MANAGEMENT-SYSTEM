import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginSchema, type LoginFormData } from './loginSchema';
import AfpLogo from './AfpLogo';
import { cn } from '@/lib/utils';

interface LoginCardProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
}

function LoginCard({ onSubmit, isLoading }: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isLoading) {
      reset((formValues) => ({
        ...formValues,
        password: '',
      }));
    }
  }, [isLoading, reset]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="glass-card rounded-2xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <AfpLogo size={72} />
          </div>
          <h1 className="text-xl font-bold text-white" id="login-heading">
            AFP Pension Overpayment<br />Monitoring System
          </h1>
          <p className="mt-2 text-sm text-white/60">Finance Center &mdash; Secure Financial Monitoring Platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate aria-labelledby="login-heading">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              className={cn(
                'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30',
                'backdrop-blur-sm transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.email ? 'border-red-400/50' : 'border-white/10',
              )}
              placeholder="Enter your email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-400" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                data-testid="password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className={cn(
                  'w-full rounded-xl border bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/30',
                  'backdrop-blur-sm transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.password ? 'border-red-400/50' : 'border-white/10',
                )}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/50 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {capsLock && (
              <div className="mt-1 flex items-center gap-1 text-xs text-yellow-400" role="alert">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                <span>Caps Lock is on</span>
              </div>
            )}
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-400" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#C9A227] focus:ring-[#C9A227]/50 focus:ring-2"
                {...register('rememberMe')}
              />
              <span className="text-xs text-white/60">Remember me</span>
            </label>
            <a
              href="#"
              className="text-xs text-[#C9A227]/70 hover:text-[#C9A227] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/50 rounded"
              onClick={(e) => e.preventDefault()}
              aria-label="Forgot password"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={cn(
              'relative w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200',
              'bg-gradient-to-r from-[#C9A227] to-[#8B6F1A]',
              'hover:from-[#D4B43A] hover:to-[#9C7F2E]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'overflow-hidden',
            )}
            aria-label={isLoading ? 'Authenticating...' : 'Sign in'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-2 text-center">
            <a
              href="#"
              className="text-xs text-white/40 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
              onClick={(e) => e.preventDefault()}
            >
              Need Help?
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default LoginCard;
