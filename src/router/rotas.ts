import { useSyncExternalStore } from 'react'

/* Roteamento por hash (#/rota?consulta): funciona em qualquer hospedagem estática. */

function lerHash(): string {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : '/'
}

function assinar(aoMudar: () => void) {
  window.addEventListener('hashchange', aoMudar)
  return () => window.removeEventListener('hashchange', aoMudar)
}

export function navegar(destino: string, opcoes: { substituir?: boolean } = {}) {
  const alvo = `#${destino.startsWith('/') ? destino : `/${destino}`}`

  if (opcoes.substituir) {
    window.history.replaceState(null, '', alvo)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = alvo
  }

  window.scrollTo({ top: 0 })
}

export function useRota() {
  const hash = useSyncExternalStore(assinar, lerHash, () => '/')
  const [caminho, consulta = ''] = hash.split('?')

  return {
    caminho: caminho.replace(/\/+$/, '') || '/',
    parametros: new URLSearchParams(consulta),
  }
}
