import { useEffect, useRef, useState, type FormEvent } from 'react'
import logoGoDrive from '../assets/godrive.png'
import { useAuth } from '../context/auth'
import { useFeedback } from '../context/feedback'
import { Link } from '../router/Link'
import { navegar, useRota } from '../router/rotas'
import {
  IconeAgenda,
  IconeBusca,
  IconeCarro,
  IconeChevron,
  IconeEntrar,
  IconeMais,
  IconeSair,
  IconeSeta,
  IconeUsuario,
} from './Icones'

export function Header() {
  const { usuario, autenticado, ehAdmin, sair } = useAuth()
  const { sucesso } = useFeedback()
  const { caminho, parametros } = useRota()

  const buscaDaUrl = parametros.get('busca') ?? ''

  const [busca, setBusca] = useState(buscaDaUrl)
  const [contaAberta, setContaAberta] = useState(false)
  const [logoFalhou, setLogoFalhou] = useState(false)
  const [rotaAnterior, setRotaAnterior] = useState(`${caminho}?${buscaDaUrl}`)
  const conta = useRef<HTMLDivElement>(null)

  /* Estado derivado da rota: ajustado na renderização, sem efeito em cascata.
     Ao navegar, o campo acompanha a busca da URL e o menu da conta fecha. */
  const rotaAtual = `${caminho}?${buscaDaUrl}`

  if (rotaAtual !== rotaAnterior) {
    setRotaAnterior(rotaAtual)
    setBusca(buscaDaUrl)
    setContaAberta(false)
  }

  useEffect(() => {
    if (!contaAberta) return

    function aoClicarFora(evento: MouseEvent) {
      if (!conta.current?.contains(evento.target as Node)) setContaAberta(false)
    }

    function aoPressionar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setContaAberta(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoPressionar)

    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoPressionar)
    }
  }, [contaAberta])

  function pesquisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const termo = busca.trim()
    const consulta = new URLSearchParams()

    if (termo) consulta.set('busca', termo)

    navegar(`/veiculos${consulta.size ? `?${consulta}` : ''}`)
  }

  function encerrar() {
    sair()
    setContaAberta(false)
    sucesso('Você saiu da sua conta.')
    navegar('/')
  }

  return (
    <header className="topbar">
      <div className="container nav">
        <a className="brand" href="#/" aria-label="goDrive, início">
          {logoFalhou ? (
            <span className="brand-fallback">
              <span className="brand-mark">
                <IconeCarro width={20} height={20} />
              </span>
              go<em>Drive</em>
            </span>
          ) : (
            <span className="brand-logo">
              <img
                src={logoGoDrive}
                alt="goDrive"
                width={190}
                height={40}
                onError={() => setLogoFalhou(true)}
              />
            </span>
          )}
        </a>

        <form className="nav-search" role="search" onSubmit={pesquisar}>
          <IconeBusca className="search-icon" />

          <input
            id="search-input"
            type="search"
            placeholder="Pesquise por marca ou modelo"
            aria-label="Pesquisar veículos"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />

          <button className="search-submit" type="submit" aria-label="Pesquisar">
            <IconeSeta />
          </button>
        </form>

        <nav className="nav-links" aria-label="Navegação principal">
          <Link para="/veiculos" className="nav-link" classeAtiva="ativo">
            Veículos
          </Link>

          {autenticado && (
            <Link para="/locacoes" className="nav-link" classeAtiva="ativo">
              Minhas locações
            </Link>
          )}

          {ehAdmin && (
            <Link para="/veiculos/novo" className="nav-link" classeAtiva="ativo">
              Cadastrar veículo
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          <div className="account" ref={conta}>
            <button
              className="account-trigger"
              type="button"
              aria-haspopup="menu"
              aria-expanded={contaAberta}
              aria-controls="account-dropdown"
              aria-label="Menu da conta"
              onClick={() => setContaAberta((aberto) => !aberto)}
            >
              <span className="account-avatar">
                <IconeUsuario />
              </span>

              <span className="account-info">
                <small>Bem-vindo(a),</small>
                <strong>{usuario ? usuario.nome.split(' ')[0] : 'Visitante'}</strong>
              </span>

              <IconeChevron className="account-chevron" />
            </button>

            {contaAberta && (
              <div className="account-menu" id="account-dropdown" role="menu">
                {autenticado ? (
                  <>
                    <p className="account-menu-head">
                      <strong>{usuario?.nome}</strong>
                      <span>{usuario?.email}</span>
                      {ehAdmin && <em className="tag-admin">Administrador</em>}
                    </p>

                    <Link para="/locacoes" role="menuitem">
                      <IconeAgenda />
                      <span>Minhas locações</span>
                    </Link>

                    {ehAdmin && (
                      <Link para="/veiculos/novo" role="menuitem">
                        <IconeMais />
                        <span>Cadastrar veículo</span>
                      </Link>
                    )}

                    <button type="button" role="menuitem" onClick={encerrar}>
                      <IconeSair />
                      <span>Sair da conta</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link para="/login" role="menuitem">
                      <IconeEntrar />
                      <span>Entrar na conta</span>
                    </Link>

                    <Link para="/cadastro" role="menuitem">
                      <IconeUsuario />
                      <span>Criar conta</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
