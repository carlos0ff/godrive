import { createContext, useContext } from 'react'

export type TipoAviso = 'sucesso' | 'erro'

export interface Aviso {
  id: number
  tipo: TipoAviso
  texto: string
}

export interface FeedbackValor {
  avisos: Aviso[]
  sucesso: (texto: string) => void
  erro: (texto: string) => void
  dispensar: (id: number) => void
}

export const FeedbackContext = createContext<FeedbackValor | null>(null)

export function useFeedback(): FeedbackValor {
  const valor = useContext(FeedbackContext)
  if (!valor) throw new Error('useFeedback precisa estar dentro de <FeedbackProvider>.')
  return valor
}
