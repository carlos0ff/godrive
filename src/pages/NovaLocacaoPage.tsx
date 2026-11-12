import { useState, type FormEvent } from 'react'
import { EstadoVazio } from '../components/Estados'
import { IconeAgenda, IconeCarro } from '../components/Icones'
import { VEICULOS } from '../catalogo'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/* Data de hoje no fuso local, no formato AAAA-MM-DD. */
function hojeISO(): string {
  const agora = new Date()
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

/* Número de diárias entre duas datas AAAA-MM-DD; 0 se inválido. */
function contarDiarias(inicio: string, fim: string): number {
  const dias = Math.round(
    (new Date(`${fim}T12:00:00`).getTime() - new Date(`${inicio}T12:00:00`).getTime()) / 86_400_000,
  )
  return dias > 0 ? dias : 0
}

const veiculos = VEICULOS.filter((veiculo) => veiculo.disponivel)

export function NovaLocacaoPage({ veiculoInicial }: { veiculoInicial: string }) {
  const [veiculoId, setVeiculoId] = useState(veiculoInicial)
  const [retirada, setRetirada] = useState(hojeISO())
  const [devolucao, setDevolucao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState(false)

  const selecionado = veiculos.find((veiculo) => veiculo.id === veiculoId) ?? null
  const diarias = retirada && devolucao ? contarDiarias(retirada, devolucao) : 0
  const total = selecionado ? diarias * selecionado.precoDiaria : 0

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    let problema: string | null = null

    if (!veiculoId) problema = 'Escolha um veículo.'
    else if (!retirada || !devolucao) problema = 'Informe as datas de retirada e devolução.'
    else if (diarias < 1) problema = 'A devolução precisa ser pelo menos um dia depois da retirada.'

    setErro(problema)
    setConfirmada(!problema)
  }

  return (
    <section className="container pagina-media">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Reserva</span>
          <h1>Nova locação</h1>
          <p>Escolha o veículo, defina o período e confirme o valor.</p>
        </header>

        {veiculos.length === 0 && (
          <EstadoVazio
            titulo="Nenhum veículo disponível"
            descricao="Toda a frota está locada no momento."
            acao={
              <a href="#/veiculos" className="botao botao-secundario">
                Ver catálogo
              </a>
            }
          />
        )}

        {veiculos.length > 0 && (
          <form onSubmit={enviar} noValidate>
            {confirmada && selecionado && (
              <p className="form-sucesso" role="status">
                Reserva de {selecionado.marca} {selecionado.modelo} por {diarias} diária(s):{' '}
                {moeda.format(total)}. Este app é só frontend: nada foi salvo.
              </p>
            )}

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
                    {moeda.format(veiculo.precoDiaria)}/dia
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
                  <dd>{selecionado ? moeda.format(selecionado.precoDiaria) : '—'}</dd>
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
                Valor estimado pelo número de diárias.
              </p>
            </div>

            <div className="acoes-form">
              <a href="#/veiculos" className="botao botao-secundario">
                Voltar ao catálogo
              </a>

              <button type="submit" className="botao botao-primario">
                Confirmar locação
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
