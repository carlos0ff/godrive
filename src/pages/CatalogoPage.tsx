import { useCallback, useEffect, useMemo, useState } from 'react'
import { listarVeiculos, mensagemDeErro } from '../dados'
import { Carregando, EstadoErro, EstadoVazio } from '../components/Estados'
import { CartaoVeiculo } from '../components/CartaoVeiculo'
import { HeroArte } from '../components/HeroArte'
import {
  IconeEscudo,
  IconeEtiqueta,
  IconeSetaBaixo,
  IconeSuporte,
} from '../components/Icones'
import { useAuth } from '../context/auth'
import { navegar, useRota } from '../router/rotas'
import type { Pagina, Veiculo } from '../types'

const POR_PAGINA = 6

type Consulta =
  | { estado: 'carregando' }
  | { estado: 'pronto'; dados: Pagina<Veiculo> }
  | { estado: 'erro'; mensagem: string }

const ORDENACOES = [
  { valor: 'recomendados', rotulo: 'Ordenar: recomendados' },
  { valor: 'menor-preco', rotulo: 'Ordenar: menor diária' },
  { valor: 'maior-preco', rotulo: 'Ordenar: maior diária' },
  { valor: 'mais-novos', rotulo: 'Ordenar: mais novos' },
]

export function CatalogoPage() {
  const { autenticado } = useAuth()
  const { caminho, parametros } = useRota()

  const busca = parametros.get('busca') ?? ''

  const [categoria, setCategoria] = useState('')
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(true)
  const [ordenar, setOrdenar] = useState('recomendados')
  const [pagina, setPagina] = useState(1)
  const [recarregar, setRecarregar] = useState(0)
  const [consulta, setConsulta] = useState<Consulta>({ estado: 'carregando' })
  const [categoriasVistas, setCategoriasVistas] = useState<string[]>([])

  /* Assinatura dos filtros: muda a cada novo critério de busca. */
  const filtros = `${busca}|${categoria}|${somenteDisponiveis}|${ordenar}`
  const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtros)
  const [chaveAnterior, setChaveAnterior] = useState(`${filtros}|${pagina}|${recarregar}`)

  /* Estado derivado ajustado na renderização: trocar de filtro volta para a
     primeira página e recoloca a lista em carregamento, sem efeito em cascata. */
  if (filtros !== filtrosAnteriores) {
    setFiltrosAnteriores(filtros)
    setPagina(1)
  }

  const chave = `${filtros}|${pagina}|${recarregar}`

  if (chave !== chaveAnterior) {
    setChaveAnterior(chave)
    setConsulta({ estado: 'carregando' })
  }

  useEffect(() => {
    const controlador = new AbortController()

    listarVeiculos(
      {
        busca: busca || undefined,
        categoria: categoria || undefined,
        disponivel: somenteDisponiveis ? true : undefined,
        ordenar,
        pagina,
        porPagina: POR_PAGINA,
      },
      controlador.signal,
    )
      .then((dados) => {
        setConsulta({ estado: 'pronto', dados })

        setCategoriasVistas((atuais) => {
          const unicas = new Set([...atuais, ...dados.itens.map((v) => v.categoria)])
          return [...unicas].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'))
        })
      })
      .catch((falha) => {
        if (controlador.signal.aborted) return

        setConsulta({ estado: 'erro', mensagem: mensagemDeErro(falha) })
      })

    return () => controlador.abort()
  }, [busca, categoria, somenteDisponiveis, ordenar, pagina, recarregar])

  const resultado = consulta.estado === 'pronto' ? consulta.dados : null

  const totalPaginas = useMemo(() => {
    if (!resultado) return 1

    return Math.max(1, Math.ceil(resultado.total / (resultado.porPagina || POR_PAGINA)))
  }, [resultado])

  const reservar = useCallback(
    (veiculo: Veiculo) => {
      const destino = `/locacoes/nova?veiculo=${encodeURIComponent(veiculo.id)}`

      if (!autenticado) {
        navegar(`/login?redir=${encodeURIComponent(destino)}`)
        return
      }

      navegar(destino)
    },
    [autenticado],
  )

  const itens = resultado?.itens ?? []
  const carregando = consulta.estado === 'carregando'
  const erro = consulta.estado === 'erro' ? consulta.mensagem : null
  const mostrarHero = caminho === '/'

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

            {categoriasVistas.map((nome) => (
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
              <strong>{resultado?.total ?? 0}</strong> veículos
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

        {carregando && <Carregando texto="Buscando veículos…" />}

        {!carregando && erro && (
          <EstadoErro mensagem={erro} aoTentarNovamente={() => setRecarregar((n) => n + 1)} />
        )}

        {!carregando && !erro && itens.length === 0 && (
          <EstadoVazio
            titulo="Nenhum veículo encontrado"
            descricao="Ajuste a busca ou os filtros para ver outras opções."
          />
        )}

        {!carregando && !erro && itens.length > 0 && (
          <div className="grade-veiculos">
            {itens.map((veiculo) => (
              <CartaoVeiculo key={veiculo.id} veiculo={veiculo} aoReservar={reservar} />
            ))}
          </div>
        )}

        {!carregando && !erro && totalPaginas > 1 && (
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
