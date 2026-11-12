import type { ReactNode } from 'react'
import { IconeCarro } from './Icones'

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
