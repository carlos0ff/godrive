import { useSyncExternalStore } from 'react'
import type { Usuario } from './types'

const CHAVE = 'godrive.sessao'

export interface Sessao {
  token: string
  usuario: Usuario
}

const ouvintes = new Set<() => void>()

function ler(): Sessao | null {
  try {
    const salvo = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE)

    return salvo ? (JSON.parse(salvo) as Sessao) : null
  } catch {
    return null
  }
}

let atual = ler()

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

function limparArmazenamento() {
  try {
    localStorage.removeItem(CHAVE)
    sessionStorage.removeItem(CHAVE)
  } catch {
    return
  }
}

export function iniciarSessao(sessao: Sessao, lembrar: boolean) {
  limparArmazenamento()

  try {
    const armazenamento = lembrar ? localStorage : sessionStorage

    armazenamento.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    return
  } finally {
    atual = sessao
    avisar()
  }
}

export function encerrarSessao() {
  limparArmazenamento()
  atual = null
  avisar()
}

export function obterToken(): string | null {
  return atual?.token ?? null
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export function useSessao() {
  const sessao = useSyncExternalStore(inscrever, () => atual)

  return {
    usuario: sessao?.usuario ?? null,
    autenticado: Boolean(sessao),
  }
}
