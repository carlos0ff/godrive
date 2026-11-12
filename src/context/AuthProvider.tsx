import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as dados from '../dados'
import type { Credenciais, NovoUsuario } from '../types'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState(dados.usuarioAtual)

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const u = await dados.entrar(credenciais)
    setUsuario(u)
    return u
  }, [])

  const cadastrar = useCallback(async (novo: NovoUsuario) => {
    const u = await dados.cadastrar(novo)
    setUsuario(u)
    return u
  }, [])

  const sair = useCallback(() => {
    dados.sair()
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null,
      ehAdmin: usuario?.papel === 'admin',
      carregando: false,
      entrar,
      cadastrar,
      sair,
    }),
    [usuario, entrar, cadastrar, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
