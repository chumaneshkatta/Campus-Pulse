export default function BrandMark({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-label="CampusPulse logo"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="campusPulseBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="27" fill="url(#campusPulseBrandGradient)" opacity="0.12" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="url(#campusPulseBrandGradient)" strokeWidth="4" />

      <path
        d="M18 46V18H29.5C38.4 18 45 24.7 45 32C45 39.3 38.4 46 29.5 46H18Z"
        fill="none"
        stroke="url(#campusPulseBrandGradient)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M24 46V18"
        fill="none"
        stroke="url(#campusPulseBrandGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M29.5 32H42.5"
        fill="none"
        stroke="url(#campusPulseBrandGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
