import { createContext, useContext } from 'react'
import type { Credenciais, NovoUsuario, Usuario } from '../types'

export interface AuthValor {
  usuario: Usuario | null
  autenticado: boolean
  ehAdmin: boolean
  carregando: boolean
  entrar: (credenciais: Credenciais) => Promise<Usuario>
  cadastrar: (dados: NovoUsuario) => Promise<Usuario>
  sair: () => void
}

export const AuthContext = createContext<AuthValor | null>(null)

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return valor
}
