/* Conjunto de ícones em SVG inline: o projeto não carrega Font Awesome,
   então cada ícone usado na interface é definido aqui. */
import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

function Base({ children, ...props }: Props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconeBusca = (p: Props) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Base>
)

export const IconeSeta = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Base>
)

export const IconeSetaBaixo = (p: Props) => (
  <Base {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </Base>
)

export const IconeUsuario = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
  </Base>
)

export const IconeChevron = (p: Props) => (
  <Base width={14} height={14} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

export const IconeEntrar = (p: Props) => (
  <Base {...p}>
    <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
  </Base>
)

export const IconeSair = (p: Props) => (
  <Base {...p}>
    <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Base>
)

export const IconeCarro = (p: Props) => (
  <Base {...p}>
    <path d="M5 17h14" />
    <path d="M4 17v-4l2-5h12l2 5v4" />
    <circle cx="8" cy="17" r="1.6" />
    <circle cx="16" cy="17" r="1.6" />
  </Base>
)

export const IconeMais = (p: Props) => (
  <Base {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Base>
)

export const IconeAgenda = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </Base>
)

export const IconeEstrela = (p: Props) => (
  <Base fill="currentColor" stroke="none" {...p}>
    <path d="m12 3.6 2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.4l5.4-.8z" />
  </Base>
)

export const IconeEscudo = (p: Props) => (
  <Base {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z" />
  </Base>
)

export const IconeEtiqueta = (p: Props) => (
  <Base {...p}>
    <path d="M20 12.8 12.8 20a2 2 0 0 1-2.8 0l-6-6V4h10l6 6a2 2 0 0 1 0 2.8Z" />
    <circle cx="8" cy="8" r="1.2" />
  </Base>
)

export const IconeSuporte = (p: Props) => (
  <Base {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2.5" y="13" width="4" height="6" rx="1.6" />
    <rect x="17.5" y="13" width="4" height="6" rx="1.6" />
    <path d="M20 19v1a3 3 0 0 1-3 3h-3" />
  </Base>
)

export const IconeVelocimetro = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 12 4-3" />
  </Base>
)

export const IconeLugares = (p: Props) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M18 19c0-2.2-.9-3.8-2.4-4.6" />
  </Base>
)

export const IconeCombustivel = (p: Props) => (
  <Base {...p}>
    <path d="M4 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15" />
    <path d="M3 20h11" />
    <path d="M13 10h3a2 2 0 0 1 2 2v4a1.6 1.6 0 0 0 3 0V9l-3-3" />
  </Base>
)

export const IconeCheck = (p: Props) => (
  <Base {...p}>
    <path d="m5 13 4 4 10-10" />
  </Base>
)

export const IconeAlerta = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.2v.3" />
  </Base>
)

export const IconeFechar = (p: Props) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
)

export const IconeCoracao = (p: Props) => (
  <Base {...p}>
    <path d="M12 20s-7-4.3-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.7-7 9-7 9Z" />
  </Base>
)

export const IconeFiltro = (p: Props) => (
  <Base {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Base>
)

export const IconeEmail = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Base>
)

export const IconeCadeado = (p: Props) => (
  <Base {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Base>
)

export const IconeOlho = (p: Props) => (
  <Base {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)

export const IconeOlhoFechado = (p: Props) => (
  <Base {...p}>
    <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Base>
)
