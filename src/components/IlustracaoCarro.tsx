/* Ilustração SVG usada quando o veículo não tem foto ou a imagem falha. */

type Forma = 'hatch' | 'seda' | 'suv' | 'picape'

const CARROCERIA: Record<Forma, string> = {
  hatch: 'M26 104c-7 0-11-4-11-10V78c0-8 5-13 13-15l30-7 24-21c6-5 13-8 21-8h47c9 0 17 4 23 11l20 22 33 8c9 2 14 8 14 16v10c0 6-4 10-11 10z',
  seda: 'M22 104c-7 0-11-4-11-10V76c0-8 5-13 13-15l34-8 27-22c6-5 13-8 21-8h56c9 0 17 4 23 11l22 24 36 8c9 2 14 8 14 16v12c0 6-4 10-11 10z',
  suv: 'M22 104c-7 0-11-4-11-10V68c0-8 5-13 13-15l32-6 20-22c6-6 13-9 22-9h60c9 0 17 3 23 10l21 23 36 7c9 2 14 8 14 16v22c0 6-4 10-11 10z',
  picape: 'M20 104c-7 0-11-4-11-10V70c0-8 5-13 13-15l30-6 20-20c6-6 13-9 22-9h44c9 0 16 3 22 10l18 21v31z M168 72h110c9 0 14 5 14 13v9c0 6-4 10-11 10H168z',
}

const JANELAS: Record<Forma, string> = {
  hatch: 'M62 56c5-4 11-6 18-6h26v26H52zM118 50h26c7 0 13 3 18 8l16 18h-60z',
  seda: 'M64 54c5-4 11-6 18-6h30v28H52zM124 48h30c7 0 13 3 18 8l18 20h-66z',
  suv: 'M58 48c5-5 11-7 18-7h32v30H46zM120 41h32c7 0 13 2 18 7l19 23h-69z',
  picape: 'M56 50c5-5 11-7 18-7h26v30H44zM112 43h26c7 0 13 2 18 7l17 23h-61z',
}

const CORES: Record<string, string> = {
  branco: '#eef1f3',
  prata: '#c3cad1',
  cinza: '#8b949d',
  grafite: '#5b646c',
  preto: '#33383d',
  vermelho: '#d2453f',
  vinho: '#7c2b35',
  laranja: '#dd8238',
  amarelo: '#e8c33f',
  azul: '#2f5ea8',
  verde: '#2f7a4d',
  marrom: '#6d5342',
  bege: '#d8cbb4',
  dourado: '#c3a45b',
}

function resolverCor(cor?: string): string {
  if (!cor) return '#b9c2cc'
  const valor = cor.trim()
  if (valor.startsWith('#') || valor.startsWith('rgb')) return valor
  return CORES[valor.toLowerCase()] ?? '#b9c2cc'
}

function resolverForma(categoria: string): Forma {
  const c = categoria.toLowerCase()
  if (c.startsWith('suv') || c.startsWith('mini') || c.startsWith('util')) return 'suv'
  if (c.startsWith('pica')) return 'picape'
  if (c.startsWith('hat')) return 'hatch'
  return 'seda'
}

interface Props {
  categoria: string
  cor?: string
  titulo?: string
}

export function IlustracaoCarro({ categoria, cor, titulo }: Props) {
  const forma = resolverForma(categoria)

  return (
    <svg
      className="carro-svg"
      viewBox="0 0 310 150"
      role="img"
      aria-label={titulo ?? `Ilustração de um ${categoria}`}
    >
      <ellipse cx="155" cy="128" rx="128" ry="11" fill="#1f3b2a" opacity="0.12" />
      <path d={CARROCERIA[forma]} fill={resolverCor(cor)} />
      <path d={JANELAS[forma]} fill="#1f3b2a" opacity="0.26" />
      <rect x="258" y="78" width="26" height="8" rx="4" fill="#ffd84d" opacity="0.9" />
      <rect x="20" y="80" width="18" height="7" rx="3.5" fill="#fff" opacity="0.55" />
      <g fill="#1b2a23">
        <circle cx="86" cy="104" r="22" />
        <circle cx="226" cy="104" r="22" />
      </g>
      <g fill="#e9eef0">
        <circle cx="86" cy="104" r="9" />
        <circle cx="226" cy="104" r="9" />
      </g>
    </svg>
  )
}
