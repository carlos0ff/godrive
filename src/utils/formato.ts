const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const data = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const numero = new Intl.NumberFormat('pt-BR')

export function formatarMoeda(valor?: number): string {
  return typeof valor !== 'number' || Number.isNaN(valor) ? '—' : moeda.format(valor)
}

export function formatarNumero(valor?: number): string {
  return typeof valor !== 'number' || Number.isNaN(valor) ? '—' : numero.format(valor)
}

export function formatarData(valor?: string): string {
  if (!valor) return '—'

  const d = new Date(valor.length <= 10 ? `${valor}T12:00:00` : valor)

  return Number.isNaN(d.getTime()) ? valor : data.format(d)
}

/* Número de diárias entre duas datas ISO (AAAA-MM-DD); 0 se inválido. */
export function contarDiarias(inicio: string, fim: string): number {
  const a = new Date(`${inicio}T12:00:00`)
  const b = new Date(`${fim}T12:00:00`)

  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0

  const dias = Math.round((b.getTime() - a.getTime()) / 86_400_000)

  return dias > 0 ? dias : 0
}

/* Data de hoje no fuso local, no formato AAAA-MM-DD. */
export function hojeISO(): string {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000

  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10)
}
