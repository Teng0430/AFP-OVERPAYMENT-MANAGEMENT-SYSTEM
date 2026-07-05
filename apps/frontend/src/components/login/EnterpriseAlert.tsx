/* eslint-disable react-refresh/only-export-components */
import { AlertCircle, AlertTriangle, WifiOff, ShieldAlert, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorType = 'invalid-credentials' | 'network-error' | 'server-unavailable' | 'account-locked' | 'session-expired';

interface EnterpriseAlertProps {
  type: ErrorType;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<ErrorType, { icon: typeof AlertCircle; title: string; message: string; variant: 'destructive' | 'warning' | 'info' }> = {
  'invalid-credentials': {
    icon: AlertCircle,
    title: 'Authentication Failed',
    message: 'Invalid username or password. Please check your credentials and try again.',
    variant: 'destructive',
  },
  'network-error': {
    icon: WifiOff,
    title: 'Network Error',
    message: 'Unable to connect. Please check your internet connection and try again.',
    variant: 'warning',
  },
  'server-unavailable': {
    icon: AlertTriangle,
    title: 'Service Unavailable',
    message: 'Service temporarily unavailable. Please try again in a few minutes.',
    variant: 'warning',
  },
  'account-locked': {
    icon: ShieldAlert,
    title: 'Account Locked',
    message: 'Account locked. Please contact your system administrator to unlock your account.',
    variant: 'destructive',
  },
  'session-expired': {
    icon: Clock,
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    variant: 'info',
  },
};

function EnterpriseAlert({ type, onDismiss, className }: EnterpriseAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  const variantClasses = {
    destructive: 'border-red-500/30 bg-red-500/10 text-red-200',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  };

  const iconColors = {
    destructive: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'relative flex items-start gap-3 rounded-xl border p-4 backdrop-blur-sm',
        variantClasses[config.variant],
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[config.variant])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{config.title}</p>
        <p className="mt-1 text-xs opacity-90">{config.message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status === 401) return 'invalid-credentials';
  if (status === 403 || status === 423) return 'account-locked';
  if (status >= 500) return 'server-unavailable';
  return 'network-error';
}

export function getErrorTypeFromMessage(message: string): ErrorType {
  const lower = message.toLowerCase();
  if (lower.includes('locked')) return 'account-locked';
  if (lower.includes('expired') || lower.includes('session')) return 'session-expired';
  if (lower.includes('network') || lower.includes('connect') || lower.includes('failed to fetch')) return 'network-error';
  if (lower.includes('unavailable') || lower.includes('503') || lower.includes('500')) return 'server-unavailable';
  return 'invalid-credentials';
}

export default EnterpriseAlert;
