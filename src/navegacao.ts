import { useSyncExternalStore } from 'react'

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')
const EVENTO = 'godrive:navegacao'

export function rota(caminho: string): string {
  return `${BASE}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

export function navegar(caminho: string, opcoes: { substituir?: boolean } = {}) {
  const destino = rota(caminho)

  if (opcoes.substituir) window.history.replaceState(null, '', destino)
  else window.history.pushState(null, '', destino)

  window.dispatchEvent(new Event(EVENTO))
  window.scrollTo({ top: 0 })
}

function lerEndereco(): string {
  const { pathname, search } = window.location
  const relativo = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname

  return `${relativo || '/'}${search}`
}

function inscrever(aoMudar: () => void) {
  window.addEventListener('popstate', aoMudar)
  window.addEventListener(EVENTO, aoMudar)

  return () => {
    window.removeEventListener('popstate', aoMudar)
    window.removeEventListener(EVENTO, aoMudar)
  }
}

export function useLocalizacao() {
  const endereco = useSyncExternalStore(inscrever, lerEndereco)
  const [caminho, consulta = ''] = endereco.split('?')

  return {
    caminho: caminho.replace(/\/+$/, '') || '/',
    consulta,
    parametros: new URLSearchParams(consulta),
  }
}

export function interceptarLinks() {
  document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.button !== 0) return
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return

    const link = (evento.target as Element | null)?.closest('a')

    if (!link || link.target || link.hasAttribute('download')) return

    const url = new URL(link.href, window.location.href)

    if (url.origin !== window.location.origin) return
    if (url.pathname !== BASE && !url.pathname.startsWith(`${BASE}/`)) return
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return

    evento.preventDefault()
    navegar(`${url.pathname.slice(BASE.length) || '/'}${url.search}`)
  })
}
