import { Shield, Lock, Key, FileText } from 'lucide-react';

interface Badge {
  label: string;
  icon?: typeof Shield;
  description?: string;
}

const badges: Badge[] = [
  { label: 'Secure Login', icon: Lock, description: 'All connections are encrypted' },
  { label: 'RBAC Enabled', icon: Shield, description: 'Role-based access control active' },
  { label: 'AES Encrypted', icon: Key, description: 'Data encrypted at rest and in transit' },
  { label: 'Audit Logging', icon: FileText, description: 'All access is logged and monitored' },
];

function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3" role="list" aria-label="Security indicators">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.label}
            role="listitem"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1"
            title={badge.description}
          >
            {Icon && <Icon className="h-3 w-3 text-[#C9A227]/70" aria-hidden="true" />}
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default SecurityBadges;
