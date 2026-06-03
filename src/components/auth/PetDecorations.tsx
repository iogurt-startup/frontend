/* ═══════════════════════════════════════════════════
   Shared SVG Pet Decorations
   ─────────────────────────────────────────────────
   Chubby, rounded pet icons matching the prototype:
   - Fat paw with big round pads
   - Plump round fish with cute tail
   - Chunky bone with fat round ends
   ═══════════════════════════════════════════════════ */

/* Paw print — triangular rounded pad pointing up + 3 small toe beans */
export function PawSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 230" fill="#F5B8D0">
      {/* Main pad — rounded triangle pointing up-right */}
      <path d="M95,5 C155,5 185,50 185,100 C185,140 155,160 95,160 C40,160 10,130 10,85 C10,35 45,5 95,5 Z" />
      {/* 3 small toe beans at the bottom */}
      <circle cx="50" cy="195" r="22" />
      <circle cx="105" cy="205" r="22" />
      <circle cx="158" cy="195" r="22" />
    </svg>
  )
}

/* Fish — plump round body, chunky tail, cute eye */
export function FishSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 220 160" fill="#F5B8D0">
      {/* Fat round body */}
      <ellipse cx="95" cy="80" rx="80" ry="65" />
      {/* Chunky round tail */}
      <ellipse cx="185" cy="50" rx="30" ry="28" />
      <ellipse cx="185" cy="110" rx="30" ry="28" />
      {/* Tail connector */}
      <ellipse cx="165" cy="80" rx="25" ry="40" />
      {/* Cute big eye */}
      <circle cx="55" cy="65" r="14" fill="white" />
      <circle cx="52" cy="62" r="7" fill="white" opacity="0.8" />
    </svg>
  )
}

/* Bone — chunky with big fat round knobs */
export function BoneSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 120" fill="#F5B8D0">
      {/* Left fat knobs */}
      <circle cx="32" cy="30" r="28" />
      <circle cx="32" cy="90" r="28" />
      {/* Right fat knobs */}
      <circle cx="168" cy="30" r="28" />
      <circle cx="168" cy="90" r="28" />
      {/* Fat shaft connecting them */}
      <rect x="32" y="28" width="136" height="64" rx="10" />
    </svg>
  )
}

/* Cat face — dot of the "i" in logo */
export function CatFaceSvg() {
  return (
    <svg className="auth-logo-cat" viewBox="0 0 100 100" fill="#F5A9C8">
      {/* Ears */}
      <polygon points="15,45 25,5 50,30" />
      <polygon points="85,45 75,5 50,30" />
      {/* Head */}
      <circle cx="50" cy="58" r="35" />
      {/* Eyes - Solid teal/green-blue */}
      <circle cx="38" cy="52" r="5" fill="#3CD8B6" />
      <circle cx="62" cy="52" r="5" fill="#3CD8B6" />
    </svg>
  )
}
