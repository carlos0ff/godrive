import { useState } from 'react'
import { api, mensagemDeErro } from '../api'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCheck } from '../components/Icones'
import { useSessao } from '../sessao'
import type { Locacao } from '../types'
import { useRecurso } from '../useRecurso'

const ROTULO_STATUS: Record<string, string> = {
  ativa: 'Ativa',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatarData(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR')
}

export function LocacoesPage() {
  const { ehAdmin } = useSessao()
  const {
    dados: locacoes,
    carregando,
    erro,
    recarregar,
    alterarDados,
  } = useRecurso(api.listarLocacoes, [] as Locacao[])
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [devolvendo, setDevolvendo] = useState<number | null>(null)

  async function devolver(locacao: Locacao) {
    setDevolvendo(locacao.id)
    setErroAcao(null)
    setAviso(null)

    try {
      const atualizada = await api.devolverLocacao(locacao.id)

      alterarDados((atuais) => atuais.map((item) => (item.id === atualizada.id ? atualizada : item)))
      setAviso(`Devolução de ${atualizada.veiculo.marca} ${atualizada.veiculo.modelo} registrada.`)
    } catch (falha) {
      setErroAcao(mensagemDeErro(falha))
    } finally {
      setDevolvendo(null)
    }
  }

  const ativas = locacoes.filter((locacao) => locacao.status === 'ativa').length
  const totalGasto = locacoes
    .filter((locacao) => locacao.status !== 'cancelada')
    .reduce((soma, locacao) => soma + locacao.valorTotal, 0)

  return (
    <section className="container">
      <div className="secao-topo">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>{ehAdmin ? 'Locações' : 'Minhas locações'}</h1>
          <p className="secao-subtitulo">
            {ehAdmin
              ? 'Todas as reservas da locadora. Registre a devolução quando o carro voltar.'
              : 'Acompanhe suas reservas e registre a devolução dos veículos.'}
          </p>
        </div>

        <a href="#/locacoes/nova" className="botao botao-primario">
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
            <strong>{ativas}</strong>
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
            <a href="#/veiculos" className="botao botao-primario">
              Ver veículos
            </a>
          }
        />
      )}

      {!carregando && !erro && locacoes.length > 0 && (
        <ul className="lista-locacoes">
          {locacoes.map((locacao) => (
            <li key={locacao.id} className="locacao">
              <div className="locacao-veiculo">
                <strong>
                  {locacao.veiculo
                    ? `${locacao.veiculo.marca} ${locacao.veiculo.modelo}`
                    : 'Veículo'}
                </strong>

                <span>
                  {locacao.veiculo?.categoria}
                  {locacao.veiculo?.placa ? ` · ${locacao.veiculo.placa}` : ''}
                  {ehAdmin && locacao.usuario ? ` · ${locacao.usuario.nome}` : ''}
                </span>
              </div>

              <div className="locacao-periodo">
                <small>Período</small>
                <span>
                  {formatarData(locacao.dataRetirada)} → {formatarData(locacao.dataDevolucao)}
                </span>
              </div>

              <div className="locacao-valor">
                <small>Valor total</small>
                <strong>{moeda.format(locacao.valorTotal)}</strong>
              </div>

              <span className={`status status-${locacao.status}`}>
                {ROTULO_STATUS[locacao.status] ?? locacao.status}
              </span>

              <div className="locacao-acao">
                {locacao.status === 'ativa' ? (
                  <button
                    type="button"
                    className="botao botao-secundario"
                    disabled={devolvendo === locacao.id}
                    onClick={() => devolver(locacao)}
                  >
                    <IconeCheck width={15} height={15} />
                    {devolvendo === locacao.id ? 'Registrando…' : 'Registrar devolução'}
                  </button>
                ) : (
                  <span className="locacao-encerrada">Encerrada</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
