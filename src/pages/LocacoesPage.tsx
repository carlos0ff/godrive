import { useCallback, useEffect, useMemo, useState } from 'react'
import { finalizarLocacao, listarLocacoes, mensagemDeErro } from '../dados'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCheck } from '../components/Icones'
import { useFeedback } from '../context/feedback'
import { Link } from '../router/Link'
import type { Locacao } from '../types'
import { formatarData, formatarMoeda } from '../utils/formato'

const ROTULO_STATUS: Record<string, string> = {
  ativa: 'Ativa',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

export function LocacoesPage() {
  const { sucesso, erro: avisarErro } = useFeedback()

  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [tentativaAnterior, setTentativaAnterior] = useState(0)
  const [finalizando, setFinalizando] = useState<string | null>(null)

  /* Recarregar é estado derivado: ajustado na renderização, não em efeito. */
  if (tentativa !== tentativaAnterior) {
    setTentativaAnterior(tentativa)
    setCarregando(true)
    setErro(null)
  }

  useEffect(() => {
    const controlador = new AbortController()

    listarLocacoes(controlador.signal)
      .then((dados) => {
        setLocacoes(Array.isArray(dados) ? dados : [])
        setErro(null)
      })
      .catch((falha) => {
        if (!controlador.signal.aborted) setErro(mensagemDeErro(falha))
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false)
      })

    return () => controlador.abort()
  }, [tentativa])

  const finalizar = useCallback(
    async (locacao: Locacao) => {
      setFinalizando(locacao.id)

      try {
        const atualizada = await finalizarLocacao(locacao.id)

        /* Atualiza a lista localmente, sem recarregar a página. */
        setLocacoes((atuais) =>
          atuais.map((item) => (item.id === locacao.id ? { ...item, ...atualizada } : item)),
        )

        sucesso('Locação finalizada. O veículo voltou para a frota.')
      } catch (falha) {
        avisarErro(mensagemDeErro(falha))
      } finally {
        setFinalizando(null)
      }
    },
    [sucesso, avisarErro],
  )

  const ativas = useMemo(
    () => locacoes.filter((locacao) => locacao.status === 'ativa').length,
    [locacoes],
  )

  const totalGasto = useMemo(
    () =>
      locacoes
        .filter((locacao) => locacao.status !== 'cancelada')
        .reduce((soma, locacao) => soma + (locacao.valorTotal ?? 0), 0),
    [locacoes],
  )

  return (
    <section className="container">
      <div className="secao-topo">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Minhas locações</h1>
          <p className="secao-subtitulo">
            Acompanhe as reservas registradas e finalize as que já terminaram.
          </p>
        </div>

        <Link para="/locacoes/nova" className="botao botao-primario">
          <IconeAgenda width={16} height={16} />
          Nova locação
        </Link>
      </div>

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
            <strong>{formatarMoeda(totalGasto)}</strong>
          </div>
        </div>
      )}

      {carregando && <Carregando texto="Carregando suas locações…" />}

      {!carregando && erro && (
        <EstadoErro mensagem={erro} aoTentarNovamente={() => setTentativa((n) => n + 1)} />
      )}

      {!carregando && !erro && locacoes.length === 0 && (
        <EstadoVazio
          titulo="Você ainda não tem locações"
          descricao="Escolha um veículo no catálogo para fazer a primeira reserva."
          acao={
            <Link para="/veiculos" className="botao botao-primario">
              Ver veículos
            </Link>
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
                <strong>{formatarMoeda(locacao.valorTotal)}</strong>
              </div>

              <span className={`status status-${locacao.status}`}>
                {ROTULO_STATUS[locacao.status] ?? locacao.status}
              </span>

              <div className="locacao-acao">
                {locacao.status === 'ativa' ? (
                  <button
                    type="button"
                    className="botao botao-secundario"
                    disabled={finalizando === locacao.id}
                    onClick={() => finalizar(locacao)}
                  >
                    <IconeCheck width={15} height={15} />
                    {finalizando === locacao.id ? 'Finalizando…' : 'Finalizar'}
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
