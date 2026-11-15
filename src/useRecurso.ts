import { useCallback, useEffect, useState } from 'react'
import { mensagemDeErro } from './api'

interface Estado<T> {
  dados: T
  carregando: boolean
  erro: string | null
}

export function useRecurso<T>(buscar: () => Promise<T>, inicial: T) {
  const [estado, setEstado] = useState<Estado<T>>({ dados: inicial, carregando: true, erro: null })
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true

    buscar().then(
      (dados) => {
        if (ativo) setEstado({ dados, carregando: false, erro: null })
      },
      (falha) => {
        if (ativo) setEstado((atual) => ({ ...atual, carregando: false, erro: mensagemDeErro(falha) }))
      },
    )

    return () => {
      ativo = false
    }
  }, [buscar, versao])

  const recarregar = useCallback(() => {
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }))
    setVersao((atual) => atual + 1)
  }, [])

  const alterarDados = useCallback((alterar: (dados: T) => T) => {
    setEstado((atual) => ({ ...atual, dados: alterar(atual.dados) }))
  }, [])

  return { ...estado, recarregar, alterarDados }
}
