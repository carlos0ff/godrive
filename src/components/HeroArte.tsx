/* Ilustração do herói em SVG: não depende de imagem externa nem de rede. */
export function HeroArte() {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 420 240"
      role="img"
      aria-label="Ilustração de um carro"
    >
      <defs>
        <linearGradient id="hero-carroceria" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#d9e8df" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <ellipse cx="210" cy="206" rx="170" ry="18" fill="#04341d" opacity="0.35" />

      <path
        d="M44 168c-10 0-16-6-16-15v-18c0-11 7-18 18-21l44-11 36-29c9-7 19-11 31-11h78c13 0 25 5 34 15l29 31 48 11c13 3 20 11 20 23v10c0 9-6 15-16 15z"
        fill="url(#hero-carroceria)"
      />

      <path
        d="M131 72c6-5 13-8 22-8h40v40h-98zM205 64h33c9 0 17 3 23 10l26 30H205z"
        fill="#0f3d26"
        opacity="0.22"
      />

      <rect x="296" y="124" width="36" height="11" rx="5" fill="#ffd84d" />
      <rect x="58" y="126" width="24" height="9" rx="4" fill="#9fd3b4" opacity="0.8" />

      <g fill="#10261c">
        <circle cx="124" cy="168" r="30" />
        <circle cx="300" cy="168" r="30" />
      </g>

      <g fill="#e7efe9">
        <circle cx="124" cy="168" r="13" />
        <circle cx="300" cy="168" r="13" />
      </g>
    </svg>
  )
}
