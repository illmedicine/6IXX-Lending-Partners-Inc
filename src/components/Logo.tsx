export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Cadillac-style shield outer border */}
      <path
        d="M100 10 L160 40 L170 100 L160 160 L100 190 L40 160 L30 100 L40 40 Z"
        fill="url(#silverGradient)"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      
      {/* Inner shield */}
      <path
        d="M100 20 L155 45 L163 100 L155 155 L100 180 L45 155 L37 100 L45 45 Z"
        fill="url(#goldGradient)"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      
      {/* Dark center background for the 6 */}
      <ellipse
        cx="100"
        cy="100"
        rx="50"
        ry="55"
        fill="#1a1a1a"
        stroke="url(#goldGradient)"
        strokeWidth="3"
      />
      
      {/* The number 6 styled like Cadillac emblem */}
      <text
        x="100"
        y="130"
        fontSize="90"
        fontWeight="bold"
        fontFamily="serif"
        fill="url(#goldGradient)"
        textAnchor="middle"
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
      >
        6
      </text>
      
      {/* Top decorative elements */}
      <circle cx="100" cy="35" r="4" fill="url(#goldGradient)" />
      <circle cx="135" cy="55" r="3" fill="url(#goldGradient)" />
      <circle cx="65" cy="55" r="3" fill="url(#goldGradient)" />
      
      {/* Bottom text banner */}
      <path
        d="M60 165 Q100 172 140 165"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="2"
      />
      <text
        x="100"
        y="170"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="url(#goldGradient)"
        textAnchor="middle"
        letterSpacing="2"
      >
        IXX
      </text>
    </svg>
  );
}
