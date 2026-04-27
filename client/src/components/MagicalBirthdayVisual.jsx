/**
 * Original animated centerpiece — aurora sky, moon, stars, and a gift of light (no external meme assets).
 */
export function MagicalBirthdayVisual() {
  return (
    <div className="magical-visual" aria-hidden="true">
      <svg className="magical-visual__svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mv-aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#ec4899" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
          </linearGradient>
          <radialGradient id="mv-moon" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="55%" stopColor="#fde7f3" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.3" />
          </radialGradient>
          <filter id="mv-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="400" height="240" fill="url(#mv-aurora)" opacity="0.35" className="magical-visual__aurora" />

        <circle cx="72" cy="58" r="36" fill="url(#mv-moon)" className="magical-visual__moon" />

        {[32, 88, 132, 188, 242, 298, 352].map((x, i) => (
          <circle
            key={i}
            className="magical-visual__star"
            style={{ animationDelay: `${i * 0.22}s` }}
            cx={x}
            cy={26 + (i % 5) * 16}
            r={1.6 + (i % 3) * 0.7}
            fill="#fff"
            opacity="0.9"
            filter="url(#mv-glow)"
          />
        ))}

        <g className="magical-visual__gift" transform="translate(200 128)">
          <rect x="-52" y="-8" width="104" height="72" rx="10" fill="#fff6fb" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
          <rect x="-8" y="-48" width="16" height="112" rx="3" fill="#fda4c6" opacity="0.95" />
          <rect x="-52" y="24" width="104" height="16" rx="3" fill="#fda4c6" opacity="0.95" />
          <rect className="magical-visual__lid" x="-58" y="-58" width="116" height="28" rx="8" fill="#ffe4f4" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
          <circle cx="0" cy="-42" r="10" fill="#fff" opacity="0.9" className="magical-visual__orb" />
        </g>

        <text x="200" y="218" textAnchor="middle" className="magical-visual__caption" fill="rgba(255,255,255,0.92)" fontSize="13" fontWeight="700" letterSpacing="0.14em">
          FOR VANSHIKA
        </text>
      </svg>
    </div>
  );
}
