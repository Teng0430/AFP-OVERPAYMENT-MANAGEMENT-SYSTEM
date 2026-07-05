interface AfpLogoProps {
  className?: string;
  size?: number;
}

function AfpLogo({ className = '', size = 60 }: AfpLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Armed Forces of the Philippines Logo"
      role="img"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8B6F1A" />
        </linearGradient>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1F3A" />
          <stop offset="100%" stopColor="#162D50" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#bg-grad)" stroke="url(#shield-grad)" strokeWidth="3" />
      <path d="M60 20 L45 40 L60 35 L75 40 Z" fill="url(#shield-grad)" opacity="0.9" />
      <path d="M35 55 Q60 30 85 55 L75 85 Q60 95 45 85 Z" fill="none" stroke="url(#shield-grad)" strokeWidth="2" opacity="0.7" />
      <circle cx="60" cy="58" r="18" fill="none" stroke="url(#shield-grad)" strokeWidth="2.5" />
      <circle cx="60" cy="58" r="8" fill="url(#shield-grad)" opacity="0.8" />
      <text x="60" y="104" textAnchor="middle" fill="#C9A227" fontSize="9" fontWeight="bold" letterSpacing="1">AFP</text>
      <rect x="20" y="6" width="80" height="2" rx="1" fill="#C9A227" opacity="0.5" />
      <rect x="20" y="112" width="80" height="2" rx="1" fill="#C9A227" opacity="0.5" />
    </svg>
  );
}

export default AfpLogo;
