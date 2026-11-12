import { useMemo, useState } from 'react'
import { EstadoVazio } from '../components/Estados'
import { CartaoVeiculo } from '../components/CartaoVeiculo'
import { HeroArte } from '../components/HeroArte'
import {
  IconeEscudo,
  IconeEtiqueta,
  IconeSetaBaixo,
  IconeSuporte,
} from '../components/Icones'
import { VEICULOS } from '../catalogo'
import type { Veiculo } from '../types'

const POR_PAGINA = 6

const ORDENACOES = [
  { valor: 'recomendados', rotulo: 'Ordenar: recomendados' },
  { valor: 'menor-preco', rotulo: 'Ordenar: menor diária' },
  { valor: 'maior-preco', rotulo: 'Ordenar: maior diária' },
  { valor: 'mais-novos', rotulo: 'Ordenar: mais novos' },
]

const COMPARAR: Record<string, (a: Veiculo, b: Veiculo) => number> = {
  'menor-preco': (a, b) => a.precoDiaria - b.precoDiaria,
  'maior-preco': (a, b) => b.precoDiaria - a.precoDiaria,
  'mais-novos': (a, b) => b.ano - a.ano,
}

const CATEGORIAS = [...new Set(VEICULOS.map((v) => v.categoria))].sort((a, b) =>
  a.localeCompare(b, 'pt-BR'),
)

function reservar(veiculo: Veiculo) {
  window.location.hash = `/locacoes/nova?veiculo=${encodeURIComponent(veiculo.id)}`
}

interface Props {
  busca: string
  mostrarHero: boolean
}

export function CatalogoPage({ busca, mostrarHero }: Props) {
  const [categoria, setCategoria] = useState('')
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(true)
  const [ordenar, setOrdenar] = useState('recomendados')
  const [pagina, setPagina] = useState(1)

  /* Trocar um filtro volta para a primeira página. */
  const filtros = `${busca}|${categoria}|${somenteDisponiveis}|${ordenar}`
  const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtros)

  if (filtros !== filtrosAnteriores) {
    setFiltrosAnteriores(filtros)
    setPagina(1)
  }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    const lista = VEICULOS.filter((v) => {
      if (termo && !`${v.marca} ${v.modelo}`.toLowerCase().includes(termo)) return false
      if (categoria && v.categoria !== categoria) return false
      if (somenteDisponiveis && !v.disponivel) return false
      return true
    })

    const comparar = COMPARAR[ordenar]

    return comparar ? [...lista].sort(comparar) : lista
  }, [busca, categoria, somenteDisponiveis, ordenar])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const itens = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)


  return (
    <>
      {mostrarHero && (
        <section className="container">
          <div className="hero">
            <div className="hero-copy">
              <span className="hero-eyebrow">Mobilidade do seu jeito</span>

              <h1>
                Seu próximo destino
                <br />
                começa aqui.
              </h1>

              <p>
                Escolha entre carros selecionados, compare opções e encontre a diária
                ideal para a sua viagem.
              </p>

              <a className="botao botao-destaque" href="#catalogo">
                Encontrar meu carro
                <IconeSetaBaixo width={15} height={15} />
              </a>
            </div>

            <div className="hero-arte" aria-hidden="true">
              <HeroArte />
            </div>
          </div>

          <ul className="beneficios">
            <li>
              <span className="beneficio-icone">
                <IconeEscudo width={16} height={16} />
              </span>
              <div>
                <strong>Aluguel confiável</strong>
                <span>Mais tranquilidade na estrada</span>
              </div>
            </li>

            <li>
              <span className="beneficio-icone">
                <IconeEtiqueta width={16} height={16} />
              </span>
              <div>
                <strong>Opções para cada bolso</strong>
                <span>Preços claros por diária</span>
              </div>
            </li>

            <li>
              <span className="beneficio-icone">
                <IconeSuporte width={16} height={16} />
              </span>
              <div>
                <strong>Conte com a gente</strong>
                <span>Suporte quando precisar</span>
              </div>
            </li>
          </ul>
        </section>
      )}

      <section className="container" id="catalogo">
        <div className="secao-topo">
          <div>
            <span className="eyebrow">Escolha o seu</span>
            <h2>Carros disponíveis</h2>
            <p className="secao-subtitulo">
              {busca
                ? `Resultados para “${busca}”.`
                : 'Encontre o modelo que combina com o seu caminho.'}
            </p>
          </div>

          <span className="pilula-estoque">
            <i aria-hidden="true" />
            Disponibilidade atualizada
          </span>
        </div>

        <div className="ferramentas">
          <div className="abas" role="tablist" aria-label="Categorias">
            <button
              type="button"
              role="tab"
              aria-selected={categoria === ''}
              className={`aba${categoria === '' ? ' ativa' : ''}`}
              onClick={() => setCategoria('')}
            >
              Todos
            </button>

            {CATEGORIAS.map((nome) => (
              <button
                key={nome}
                type="button"
                role="tab"
                aria-selected={categoria === nome}
                className={`aba${categoria === nome ? ' ativa' : ''}`}
                onClick={() => setCategoria(nome)}
              >
                {nome}
              </button>
            ))}
          </div>

          <div className="controles">
            <span className="contagem">
              <strong>{filtrados.length}</strong> veículos
            </span>

            <label className="alternador" htmlFor="filtro-disponiveis">
              <input
                id="filtro-disponiveis"
                type="checkbox"
                checked={somenteDisponiveis}
                onChange={(evento) => setSomenteDisponiveis(evento.target.checked)}
              />
              Somente disponíveis
            </label>

            <label className="sr-only" htmlFor="filtro-ordenar">
              Ordenação
            </label>

            <select
              id="filtro-ordenar"
              className="seletor"
              value={ordenar}
              onChange={(evento) => setOrdenar(evento.target.value)}
            >
              {ORDENACOES.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {itens.length === 0 && (
          <EstadoVazio
            titulo="Nenhum veículo encontrado"
            descricao="Ajuste a busca ou os filtros para ver outras opções."
          />
        )}

        {itens.length > 0 && (
          <div className="grade-veiculos">
            {itens.map((veiculo) => (
              <CartaoVeiculo key={veiculo.id} veiculo={veiculo} aoReservar={reservar} />
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <nav className="paginacao" aria-label="Paginação">
            <button
              type="button"
              className="pagina-btn"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
            >
              ‹ Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`pagina-btn${numero === pagina ? ' ativa' : ''}`}
                aria-current={numero === pagina ? 'page' : undefined}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}

            <button
              type="button"
              className="pagina-btn"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
            >
              Próximo ›
            </button>
          </nav>
        )}
      </section>
    </>
  )
}
