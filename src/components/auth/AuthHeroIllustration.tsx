/**
 * Colorful onboarding-style hero for auth — hills + lake + delivery (Nainital-ish vibe).
 */
export function AuthHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="authSky" x1="0" y1="0" x2="400" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b21b6" />
          <stop offset="0.35" stopColor="#7c3aed" />
          <stop offset="0.65" stopColor="#c026d3" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="authHillBack" x1="200" y1="180" x2="200" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="authHillFront" x1="200" y1="200" x2="200" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="authLake" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0284c7" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="authSun" x1="280" y1="40" x2="340" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="authSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <rect width="400" height="340" fill="url(#authSky)" />

      {/* Sun */}
      <circle cx="310" cy="72" r="36" fill="url(#authSun)" opacity="0.95" />
      <circle cx="310" cy="72" r="48" fill="#fef08a" opacity="0.25" />

      {/* Clouds */}
      <g opacity="0.92" filter="url(#authSoft)">
        <ellipse cx="72" cy="58" rx="38" ry="18" fill="white" />
        <ellipse cx="95" cy="52" rx="28" ry="16" fill="white" />
        <ellipse cx="48" cy="55" rx="22" ry="14" fill="white" />
      </g>
      <g opacity="0.85" filter="url(#authSoft)">
        <ellipse cx="220" cy="42" rx="32" ry="14" fill="white" />
        <ellipse cx="240" cy="38" rx="24" ry="12" fill="white" />
      </g>

      {/* Far hills */}
      <path
        d="M0 210 C80 170 120 195 200 175 C280 155 320 185 400 165 V340 H0 Z"
        fill="url(#authHillBack)"
        opacity="0.9"
      />

      {/* Lake */}
      <path
        d="M0 248 C100 235 180 262 280 245 C330 236 370 250 400 242 V340 H0 Z"
        fill="url(#authLake)"
      />
      <path
        d="M20 258 Q100 252 180 262 T340 255"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Near hills */}
      <path
        d="M0 280 C60 255 100 275 160 260 C220 245 280 270 340 252 C370 243 390 258 400 250 V340 H0 Z"
        fill="url(#authHillFront)"
      />

      {/* Decorative trees */}
      <g fill="#065f46">
        <path d="M48 268 L58 230 L68 268 Z" />
        <rect x="56" y="265" width="4" height="14" rx="1" fill="#14532d" />
      </g>
      <g fill="#047857">
        <path d="M332 272 L344 238 L356 272 Z" />
        <rect x="340" y="268" width="5" height="16" rx="1" fill="#14532d" />
      </g>

      {/* Scooter + rider — simple illustration */}
      <g transform="translate(118, 218)">
        {/* Ground shadow */}
        <ellipse cx="88" cy="78" rx="62" ry="8" fill="#000" opacity="0.12" />
        {/* Scooter body */}
        <path
          d="M28 52 L95 52 L102 38 L118 38 L122 48 L138 48 L142 58 L148 58 L152 68 H24 L28 52Z"
          fill="#1e1b4b"
        />
        <path d="M32 52 L92 52 L88 62 H36 Z" fill="#4c1d95" />
        {/* Seat */}
        <ellipse cx="58" cy="48" rx="22" ry="8" fill="#312e81" />
        {/* Handle */}
        <path d="M118 38 L128 28 L132 32 L122 42" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
        {/* Delivery box */}
        <rect x="108" y="18" width="36" height="28" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <path d="M118 28 H134" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        {/* Wheels */}
        <circle cx="42" cy="72" r="14" fill="#1f2937" />
        <circle cx="42" cy="72" r="6" fill="#6b7280" />
        <circle cx="128" cy="72" r="14" fill="#1f2937" />
        <circle cx="128" cy="72" r="6" fill="#6b7280" />
        {/* Rider head */}
        <circle cx="78" cy="28" r="14" fill="#fecaca" />
        <path
          d="M68 24 Q78 18 88 24"
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Helmet */}
        <path
          d="M64 26 C64 12 78 8 92 14 C96 22 94 30 88 32"
          fill="#ef4444"
          stroke="#b91c1c"
          strokeWidth="2"
        />
      </g>

      {/* Floating sparkles */}
      <circle cx="160" cy="120" r="3" fill="#fef08a" opacity="0.9" />
      <circle cx="180" cy="100" r="2" fill="#fde68a" opacity="0.8" />
      <circle cx="88" cy="140" r="2.5" fill="#f0abfc" opacity="0.85" />
      <circle cx="320" cy="200" r="2" fill="#a7f3d0" opacity="0.9" />
    </svg>
  );
}
