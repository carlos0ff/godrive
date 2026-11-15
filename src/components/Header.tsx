import { useEffect, useRef, useState, type FormEvent } from 'react'
import logoGoDrive from '../assets/godrive-escuro.png'
import { encerrarSessao, useSessao } from '../sessao'
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

interface Props {
  caminho: string
  busca: string
}

const LINKS = [
  { para: '/veiculos', rotulo: 'Veículos' },
  { para: '/locacoes', rotulo: 'Minhas locações' },
  { para: '/veiculos/novo', rotulo: 'Cadastrar veículo', somenteAdmin: true },
]

export function Header({ caminho, busca: buscaDaUrl }: Props) {
  const [busca, setBusca] = useState(buscaDaUrl)
  const [buscaAnterior, setBuscaAnterior] = useState(buscaDaUrl)
  const [logoFalhou, setLogoFalhou] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const [caminhoAnterior, setCaminhoAnterior] = useState(caminho)
  const conta = useRef<HTMLDivElement>(null)
  const { usuario, autenticado, ehAdmin } = useSessao()

  if (buscaDaUrl !== buscaAnterior) {
    setBuscaAnterior(buscaDaUrl)
    setBusca(buscaDaUrl)
  }

  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho)
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

  function sair() {
    encerrarSessao()
    setContaAberta(false)
    window.location.hash = '/'
  }

  function pesquisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const termo = busca.trim()

    window.location.hash = termo ? `/veiculos?busca=${encodeURIComponent(termo)}` : '/veiculos'
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
                width={156}
                height={34}
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
          {LINKS.filter((link) => !link.somenteAdmin || ehAdmin).map((link) => (
            <a
              key={link.para}
              href={`#${link.para}`}
              className={`nav-link${caminho === link.para ? ' ativo' : ''}`}
              aria-current={caminho === link.para ? 'page' : undefined}
            >
              {link.rotulo}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          {!autenticado && (
            <a href="#/login" className="botao botao-primario">
              <IconeEntrar width={16} height={16} />
              Entrar
            </a>
          )}

          {autenticado && usuario && (
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
                  <strong>{usuario.nome.split(' ')[0]}</strong>
                </span>

                <IconeChevron className="account-chevron" />
              </button>

              {contaAberta && (
                <div className="account-menu" id="account-dropdown" role="menu">
                  <p className="account-menu-head">
                    <strong>{usuario.nome}</strong>
                    <span>{usuario.email}</span>
                    {ehAdmin && <em className="tag-admin">Administrador</em>}
                  </p>

                  <a href="#/locacoes" role="menuitem">
                    <IconeAgenda />
                    <span>Minhas locações</span>
                  </a>

                  {ehAdmin && (
                    <a href="#/veiculos/novo" role="menuitem">
                      <IconeMais />
                      <span>Cadastrar veículo</span>
                    </a>
                  )}

                  <button type="button" role="menuitem" onClick={sair}>
                    <IconeSair />
                    <span>Sair da conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
