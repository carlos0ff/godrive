import { useState } from 'react'
import { api, mensagemDeErro } from '../api'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCheck } from '../components/Icones'
import type { Locacao } from '../types'
import { useRecurso } from '../useRecurso'
import { rota } from '../navegacao'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function formatar(iso: string | null) {
  return iso ? dataHora.format(new Date(iso)) : '—'
}

function ItemLocacao({
  locacao,
  finalizando,
  aoFinalizar,
}: {
  locacao: Locacao
  finalizando: boolean
  aoFinalizar: (locacao: Locacao) => void
}) {
  const ativa = locacao.status === 'ATIVA'

  return (
    <li className="locacao">
      <div className="locacao-veiculo">
        <strong>
          {locacao.veiculo.marca} {locacao.veiculo.modelo}
        </strong>
        <span>
          {locacao.veiculo.categoria} · {locacao.veiculo.placa}
        </span>
      </div>

      <div className="locacao-periodo">
        <small>{ativa ? 'Início → devolução prevista' : 'Início → devolução'}</small>
        <span>
          {formatar(locacao.dataInicio)} → {formatar(ativa ? locacao.dataPrevistaDevolucao : locacao.dataDevolucao)}
        </span>
        {!ativa && <small>Prevista: {formatar(locacao.dataPrevistaDevolucao)}</small>}
      </div>

      <div className="locacao-valor">
        <small>Valor total</small>
        <strong>{moeda.format(locacao.valorTotal)}</strong>
        <small>{moeda.format(locacao.valorDiaria)}/dia</small>
      </div>

      <span className={`status status-${ativa ? 'ativa' : 'finalizada'}`}>{ativa ? 'Ativa' : 'Finalizada'}</span>

      <div className="locacao-acao">
        {ativa ? (
          <button
            type="button"
            className="botao botao-secundario"
            disabled={finalizando}
            onClick={() => aoFinalizar(locacao)}
          >
            <IconeCheck width={15} height={15} />
            {finalizando ? 'Finalizando…' : 'Finalizar locação'}
          </button>
        ) : (
          <span className="locacao-encerrada">Devolvido</span>
        )}
      </div>
    </li>
  )
}

export function LocacoesPage() {
  const {
    dados: locacoes,
    carregando,
    erro,
    recarregar,
    alterarDados,
  } = useRecurso(api.listarLocacoes, [] as Locacao[])
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [finalizando, setFinalizando] = useState<number | null>(null)

  async function finalizar(locacao: Locacao) {
    setFinalizando(locacao.id)
    setErroAcao(null)
    setAviso(null)

    try {
      const atualizada = await api.finalizarLocacao(locacao.id)

      alterarDados((atuais) => atuais.map((item) => (item.id === atualizada.id ? atualizada : item)))
      setAviso(
        `Locação de ${atualizada.veiculo.marca} ${atualizada.veiculo.modelo} finalizada em ${formatar(atualizada.dataDevolucao)}. O veículo está disponível novamente.`,
      )
    } catch (falha) {
      setErroAcao(mensagemDeErro(falha))
      recarregar()
    } finally {
      setFinalizando(null)
    }
  }

  const ativas = locacoes.filter((locacao) => locacao.status === 'ATIVA')
  const finalizadas = locacoes.filter((locacao) => locacao.status === 'FINALIZADA')
  const totalGasto = locacoes.reduce((soma, locacao) => soma + locacao.valorTotal, 0)

  return (
    <section className="container">
      <div className="secao-topo">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Minhas locações</h1>
          <p className="secao-subtitulo">Acompanhe suas locações ativas, finalize as devoluções e consulte o histórico.</p>
        </div>

        <a href={rota('/locacoes/nova')} className="botao botao-primario">
          <IconeAgenda width={16} height={16} />
          Nova locação
        </a>
      </div>

      {aviso && (
        <p className="form-sucesso" role="status">
          {aviso}
        </p>
      )}

      {erroAcao && (
        <p className="form-erro" role="alert">
          {erroAcao}
        </p>
      )}

      {carregando && <Carregando texto="Carregando locações…" />}

      {!carregando && erro && <EstadoErro mensagem={erro} aoTentarNovamente={recarregar} />}

      {!carregando && !erro && locacoes.length > 0 && (
        <div className="resumo-cards">
          <div>
            <small>Locações</small>
            <strong>{locacoes.length}</strong>
          </div>

          <div>
            <small>Ativas</small>
            <strong>{ativas.length}</strong>
          </div>

          <div>
            <small>Total</small>
            <strong>{moeda.format(totalGasto)}</strong>
          </div>
        </div>
      )}

      {!carregando && !erro && locacoes.length === 0 && (
        <EstadoVazio
          titulo="Você ainda não tem locações"
          descricao="Escolha um veículo no catálogo para fazer a primeira reserva."
          acao={
            <a href={rota('/veiculos')} className="botao botao-primario">
              Ver veículos
            </a>
          }
        />
      )}

      {!carregando && !erro && locacoes.length > 0 && (
        <>
          <h2 className="locacoes-titulo">Ativas ({ativas.length})</h2>

          {ativas.length === 0 ? (
            <p className="locacoes-vazio">Nenhuma locação ativa no momento.</p>
          ) : (
            <ul className="lista-locacoes">
              {ativas.map((locacao) => (
                <ItemLocacao
                  key={locacao.id}
                  locacao={locacao}
                  finalizando={finalizando === locacao.id}
                  aoFinalizar={finalizar}
                />
              ))}
            </ul>
          )}

          <h2 className="locacoes-titulo">Histórico de locações finalizadas ({finalizadas.length})</h2>

          {finalizadas.length === 0 ? (
            <p className="locacoes-vazio">Nenhuma locação finalizada ainda.</p>
          ) : (
            <ul className="lista-locacoes">
              {finalizadas.map((locacao) => (
                <ItemLocacao key={locacao.id} locacao={locacao} finalizando={false} aoFinalizar={finalizar} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
