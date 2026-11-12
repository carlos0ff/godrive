import { useState } from 'react'
import type { Veiculo } from '../types'
import { formatarMoeda, formatarNumero } from '../utils/formato'
import { IlustracaoCarro } from './IlustracaoCarro'
import {
  IconeCombustivel,
  IconeCoracao,
  IconeEstrela,
  IconeLugares,
  IconeSeta,
  IconeVelocimetro,
} from './Icones'

interface Props {
  veiculo: Veiculo
  aoReservar: (veiculo: Veiculo) => void
}

export function CartaoVeiculo({ veiculo, aoReservar }: Props) {
  const [imagemFalhou, setImagemFalhou] = useState(false)
  const [favorito, setFavorito] = useState(false)

  return (
    <article className="cartao-veiculo">
      <div className={`veiculo-foto${imagemFalhou || !veiculo.imagemUrl ? ' sem-imagem' : ''}`}>
        {veiculo.imagemUrl && !imagemFalhou ? (
          <img
            src={veiculo.imagemUrl}
            alt={`${veiculo.marca} ${veiculo.modelo}`}
            loading="lazy"
            onError={() => setImagemFalhou(true)}
          />
        ) : (
          <IlustracaoCarro
            categoria={veiculo.categoria}
            cor={veiculo.cor}
            titulo={`${veiculo.marca} ${veiculo.modelo}`}
          />
        )}

        <span className={`selo ${veiculo.disponivel ? 'selo-livre' : 'selo-ocupado'}`}>
          <IconeEstrela width={10} height={10} />
          {veiculo.disponivel ? 'Disponível' : 'Indisponível'}
        </span>

        <button
          type="button"
          className={`favorito${favorito ? ' marcado' : ''}`}
          aria-pressed={favorito}
          aria-label={
            favorito
              ? `Remover ${veiculo.modelo} dos favoritos`
              : `Salvar ${veiculo.modelo} nos favoritos`
          }
          onClick={() => setFavorito((atual) => !atual)}
        >
          <IconeCoracao width={16} height={16} />
        </button>
      </div>

      <div className="veiculo-info">
        <div className="veiculo-titulo">
          <h3>
            {veiculo.marca} {veiculo.modelo}
          </h3>

          <span className="veiculo-placa">{veiculo.placa}</span>
        </div>

        <p className="veiculo-subtitulo">
          {veiculo.categoria} · {veiculo.ano}
        </p>

        <div className="veiculo-specs">
          <span>
            <IconeVelocimetro width={13} height={13} />
            {formatarNumero(veiculo.quilometragem)} km
          </span>

          <span>
            <IconeLugares width={13} height={13} />
            {veiculo.lugares ?? 5} lugares
          </span>

          <span>
            <IconeCombustivel width={13} height={13} />
            {veiculo.combustivel ?? 'Flex'}
          </span>
        </div>

        <div className="veiculo-rodape">
          <p className="preco">
            <small>A partir de</small>
            <strong>{formatarMoeda(veiculo.precoDiaria)}</strong>
            <span>/ dia</span>
          </p>

          <button
            type="button"
            className="botao botao-primario"
            disabled={!veiculo.disponivel}
            onClick={() => aoReservar(veiculo)}
          >
            {veiculo.disponivel ? 'Reservar agora' : 'Indisponível'}
            {veiculo.disponivel && <IconeSeta width={14} height={14} />}
          </button>
        </div>

        <p className="veiculo-nota">
          Proteções e taxa de aluguel (12%) não inclusas.
        </p>
      </div>
    </article>
  )
}
