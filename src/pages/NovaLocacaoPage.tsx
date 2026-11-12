import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { listarVeiculos, mensagemDeErro, registrarLocacao } from '../dados'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCarro } from '../components/Icones'
import { useFeedback } from '../context/feedback'
import { Link } from '../router/Link'
import { navegar, useRota } from '../router/rotas'
import type { Veiculo } from '../types'
import { contarDiarias, formatarMoeda, hojeISO } from '../utils/formato'

export function NovaLocacaoPage() {
  const { parametros } = useRota()
  const { sucesso, erro: avisarErro } = useFeedback()

  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [tentativaAnterior, setTentativaAnterior] = useState(0)

  const [veiculoId, setVeiculoId] = useState(parametros.get('veiculo') ?? '')
  const [retirada, setRetirada] = useState(hojeISO())
  const [devolucao, setDevolucao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  /* Recarregar é estado derivado: ajustado na renderização, não em efeito. */
  if (tentativa !== tentativaAnterior) {
    setTentativaAnterior(tentativa)
    setCarregando(true)
    setErroCarga(null)
  }

  useEffect(() => {
    const controlador = new AbortController()

    listarVeiculos({ disponivel: true, porPagina: 100 }, controlador.signal)
      .then((dados) => {
        setVeiculos(dados.itens)
        setErroCarga(null)
      })
      .catch((falha) => {
        if (!controlador.signal.aborted) setErroCarga(mensagemDeErro(falha))
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false)
      })

    return () => controlador.abort()
  }, [tentativa])

  const selecionado = useMemo(
    () => veiculos.find((veiculo) => veiculo.id === veiculoId) ?? null,
    [veiculos, veiculoId],
  )

  const diarias = retirada && devolucao ? contarDiarias(retirada, devolucao) : 0
  const total = selecionado ? diarias * selecionado.precoDiaria : 0

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (enviando) return

    if (!veiculoId) {
      setErro('Escolha um veículo.')
      return
    }

    if (!retirada || !devolucao) {
      setErro('Informe as datas de retirada e devolução.')
      return
    }

    if (diarias < 1) {
      setErro('A devolução precisa ser pelo menos um dia depois da retirada.')
      return
    }

    setErro(null)
    setEnviando(true)

    try {
      await registrarLocacao({
        veiculoId,
        dataRetirada: retirada,
        dataDevolucao: devolucao,
      })

      sucesso('Locação registrada com sucesso.')
      navegar('/locacoes')
    } catch (falha) {
      const texto = mensagemDeErro(falha)

      setErro(texto)
      avisarErro(texto)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="container pagina-media">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Reserva</span>
          <h1>Nova locação</h1>
          <p>Escolha o veículo, defina o período e confirme o valor.</p>
        </header>

        {carregando && <Carregando texto="Carregando veículos disponíveis…" />}

        {!carregando && erroCarga && (
          <EstadoErro mensagem={erroCarga} aoTentarNovamente={() => setTentativa((n) => n + 1)} />
        )}

        {!carregando && !erroCarga && veiculos.length === 0 && (
          <EstadoVazio
            titulo="Nenhum veículo disponível"
            descricao="Toda a frota está locada no momento."
            acao={
              <Link para="/veiculos" className="botao botao-secundario">
                Ver catálogo
              </Link>
            }
          />
        )}

        {!carregando && !erroCarga && veiculos.length > 0 && (
          <form onSubmit={enviar} noValidate>
            {erro && (
              <p className="form-erro" role="alert">
                {erro}
              </p>
            )}

            <label className="campo" htmlFor="locacao-veiculo">
              <span>Veículo</span>
              <select
                id="locacao-veiculo"
                value={veiculoId}
                onChange={(evento) => setVeiculoId(evento.target.value)}
                required
              >
                <option value="">Selecione um veículo</option>

                {veiculos.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.marca} {veiculo.modelo} · {veiculo.ano} ·{' '}
                    {formatarMoeda(veiculo.precoDiaria)}/dia
                  </option>
                ))}
              </select>
            </label>

            <div className="campo-linha">
              <label className="campo" htmlFor="locacao-retirada">
                <span>Data de retirada</span>
                <input
                  id="locacao-retirada"
                  type="date"
                  min={hojeISO()}
                  value={retirada}
                  onChange={(evento) => setRetirada(evento.target.value)}
                  required
                />
              </label>

              <label className="campo" htmlFor="locacao-devolucao">
                <span>Data de devolução</span>
                <input
                  id="locacao-devolucao"
                  type="date"
                  min={retirada || hojeISO()}
                  value={devolucao}
                  onChange={(evento) => setDevolucao(evento.target.value)}
                  required
                />
              </label>
            </div>

            <div className="resumo">
              <h2>
                <IconeAgenda width={16} height={16} />
                Resumo da reserva
              </h2>

              <dl>
                <div>
                  <dt>
                    <IconeCarro width={14} height={14} />
                    Veículo
                  </dt>
                  <dd>
                    {selecionado
                      ? `${selecionado.marca} ${selecionado.modelo}`
                      : 'Nenhum selecionado'}
                  </dd>
                </div>

                <div>
                  <dt>Diária</dt>
                  <dd>{selecionado ? formatarMoeda(selecionado.precoDiaria) : '—'}</dd>
                </div>

                <div>
                  <dt>Diárias</dt>
                  <dd>{diarias > 0 ? `${diarias}` : '—'}</dd>
                </div>

                <div className="resumo-total">
                  <dt>Valor estimado</dt>
                  <dd>{total > 0 ? formatarMoeda(total) : '—'}</dd>
                </div>
              </dl>

              <p className="resumo-nota">
                O valor final é confirmado no registro da locação.
              </p>
            </div>

            <div className="acoes-form">
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => navegar('/veiculos')}
              >
                Voltar ao catálogo
              </button>

              <button type="submit" className="botao botao-primario" disabled={enviando}>
                {enviando ? 'Registrando…' : 'Confirmar locação'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
