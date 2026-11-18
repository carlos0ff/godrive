import type { ReactNode } from 'react'
import { IconeAlerta, IconeCarro } from './Icones'

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="estado estado-carregando" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  )
}

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <div className="estado estado-vazio">
      <IconeCarro width={28} height={28} />
      <strong>{titulo}</strong>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  )
}

export function EstadoErro({
  mensagem,
  aoTentarNovamente,
}: {
  mensagem: string
  aoTentarNovamente?: () => void
}) {
  return (
    <div className="estado estado-erro" role="alert">
      <IconeAlerta width={26} height={26} />
      <strong>Não foi possível carregar</strong>
      <p>{mensagem}</p>

      {aoTentarNovamente && (
        <button type="button" className="botao botao-secundario" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
