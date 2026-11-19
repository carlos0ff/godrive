import { useState, type FormEvent } from 'react'
import { api, mensagemDeErro } from '../api'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCarro } from '../components/Icones'
import type { Locacao, Veiculo } from '../types'
import { useRecurso } from '../useRecurso'
import { rota } from '../navegacao'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const MS_POR_DIA = 24 * 60 * 60 * 1000

function paraCampo(data: Date): string {
  return new Date(data.getTime() - data.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function proximaHora(): string {
  const data = new Date()

  data.setHours(data.getHours() + 1, 0, 0, 0)

  return paraCampo(data)
}

function contarDiarias(inicio: string, fim: string): number {
  const diferenca = new Date(fim).getTime() - new Date(inicio).getTime()

  return diferenca > 0 ? Math.ceil(diferenca / MS_POR_DIA) : 0
}

export function NovaLocacaoPage({ veiculoInicial }: { veiculoInicial: string }) {
  const [veiculoId, setVeiculoId] = useState(veiculoInicial)
  const [inicio, setInicio] = useState(proximaHora)
  const [devolucao, setDevolucao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState<Locacao | null>(null)
  const [enviando, setEnviando] = useState(false)
  const {
    dados: veiculos,
    carregando,
    erro: erroCarga,
    recarregar,
  } = useRecurso(api.listarVeiculosDisponiveis, [] as Veiculo[])

  const selecionado = veiculos.find((veiculo) => String(veiculo.id) === veiculoId) ?? null
  const diarias = inicio && devolucao ? contarDiarias(inicio, devolucao) : 0
  const total = selecionado ? diarias * selecionado.valorDiaria : 0

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    let problema: string | null = null

    if (!selecionado) problema = 'Escolha um veículo.'
    else if (!inicio || !devolucao) problema = 'Informe a data de início e a data prevista de devolução.'
    else if (diarias < 1) problema = 'A data prevista de devolução deve ser posterior à data de início.'

    setErro(problema)
    setConfirmada(null)

    if (problema || !selecionado) return

    setEnviando(true)

    try {
      const locacao = await api.criarLocacao(
        selecionado.id,
        new Date(inicio).toISOString(),
        new Date(devolucao).toISOString(),
      )

      setConfirmada(locacao)
      setVeiculoId('')
      setDevolucao('')
      recarregar()
    } catch (falha) {
      setErro(mensagemDeErro(falha))
      recarregar()
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

        {carregando && <Carregando texto="Carregando veículos…" />}

        {!carregando && erroCarga && <EstadoErro mensagem={erroCarga} aoTentarNovamente={recarregar} />}

        {confirmada && (
          <p className="form-sucesso" role="status">
            <span>
              Locação de {confirmada.veiculo.marca} {confirmada.veiculo.modelo} registrada de{' '}
              {dataHora.format(new Date(confirmada.dataInicio))} a{' '}
              {dataHora.format(new Date(confirmada.dataPrevistaDevolucao))}. Valor calculado pelo sistema:{' '}
              <strong>{moeda.format(confirmada.valorTotal)}</strong>. <a href={rota('/locacoes')}>Ver minhas locações</a>
            </span>
          </p>
        )}

        {!carregando && !erroCarga && veiculos.length === 0 && (
          <EstadoVazio
            titulo="Nenhum veículo disponível"
            descricao="Toda a frota está locada no momento."
            acao={
              <a href={rota('/veiculos')} className="botao botao-secundario">
                Ver catálogo
              </a>
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
                    {moeda.format(veiculo.valorDiaria)}/dia
                  </option>
                ))}
              </select>
            </label>

            <div className="campo-linha">
              <label className="campo" htmlFor="locacao-inicio">
                <span>Data de início</span>
                <input
                  id="locacao-inicio"
                  type="datetime-local"
                  value={inicio}
                  onChange={(evento) => setInicio(evento.target.value)}
                  required
                />
              </label>

              <label className="campo" htmlFor="locacao-devolucao">
                <span>Data prevista de devolução</span>
                <input
                  id="locacao-devolucao"
                  type="datetime-local"
                  min={inicio}
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
                  <dd>{selecionado ? moeda.format(selecionado.valorDiaria) : '—'}</dd>
                </div>

                <div>
                  <dt>Diárias</dt>
                  <dd>{diarias > 0 ? `${diarias}` : '—'}</dd>
                </div>

                <div className="resumo-total">
                  <dt>Valor estimado</dt>
                  <dd>{total > 0 ? moeda.format(total) : '—'}</dd>
                </div>
              </dl>

              <p className="resumo-nota">
                Cada fração de 24 horas conta como uma diária completa. O valor final é calculado pelo sistema ao confirmar.
              </p>
            </div>

            <div className="acoes-form">
              <a href={rota('/veiculos')} className="botao botao-secundario">
                Voltar ao catálogo
              </a>

              <button type="submit" className="botao botao-primario" disabled={enviando}>
                {enviando ? 'Confirmando…' : 'Confirmar locação'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
