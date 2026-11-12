import { EstadoVazio } from '../components/Estados'
import { IconeAgenda } from '../components/Icones'
import { LOCACOES } from '../catalogo'

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
  const locacoes = LOCACOES
  const ativas = locacoes.filter((locacao) => locacao.status === 'ativa').length
  const totalGasto = locacoes
    .filter((locacao) => locacao.status !== 'cancelada')
    .reduce((soma, locacao) => soma + locacao.valorTotal, 0)

  return (
    <section className="container">
      <div className="secao-topo">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Minhas locações</h1>
          <p className="secao-subtitulo">
            Exemplo de histórico. Este app é só frontend: as reservas não são salvas.
          </p>
        </div>

        <a href="#/locacoes/nova" className="botao botao-primario">
          <IconeAgenda width={16} height={16} />
          Nova locação
        </a>
      </div>

      {locacoes.length > 0 && (
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


      {locacoes.length === 0 && (
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

      {locacoes.length > 0 && (
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
                <strong>{moeda.format(locacao.valorTotal)}</strong>
              </div>

              <span className={`status status-${locacao.status}`}>
                {ROTULO_STATUS[locacao.status] ?? locacao.status}
              </span>

              <div className="locacao-acao">
                <span className="locacao-encerrada">{locacao.status === 'ativa' ? 'Em andamento' : 'Encerrada'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
