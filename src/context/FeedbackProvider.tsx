import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { FeedbackContext, type Aviso, type TipoAviso } from './feedback'

const DURACAO = 4500

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximoId = useRef(1)

  const dispensar = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id))
  }, [])

  const adicionar = useCallback(
    (tipo: TipoAviso, texto: string) => {
      const id = proximoId.current++
      setAvisos((atuais) => [...atuais, { id, tipo, texto }])
      window.setTimeout(() => dispensar(id), DURACAO)
    },
    [dispensar],
  )

  const sucesso = useCallback((texto: string) => adicionar('sucesso', texto), [adicionar])
  const erro = useCallback((texto: string) => adicionar('erro', texto), [adicionar])

  const valor = useMemo(
    () => ({ avisos, sucesso, erro, dispensar }),
    [avisos, sucesso, erro, dispensar],
  )

  return <FeedbackContext.Provider value={valor}>{children}</FeedbackContext.Provider>
}
