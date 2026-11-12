import { useState, type FormEvent } from 'react'
import logoGoDrive from '../assets/godrive.png'
import { IconeBusca, IconeCarro, IconeEntrar, IconeSeta } from './Icones'

interface Props {
  caminho: string
  busca: string
}

const LINKS = [
  { para: '/veiculos', rotulo: 'Veículos' },
  { para: '/locacoes', rotulo: 'Minhas locações' },
  { para: '/veiculos/novo', rotulo: 'Cadastrar veículo' },
]

export function Header({ caminho, busca: buscaDaUrl }: Props) {
  const [busca, setBusca] = useState(buscaDaUrl)
  const [buscaAnterior, setBuscaAnterior] = useState(buscaDaUrl)
  const [logoFalhou, setLogoFalhou] = useState(false)

  /* O campo acompanha a busca da URL quando ela muda. */
  if (buscaDaUrl !== buscaAnterior) {
    setBuscaAnterior(buscaDaUrl)
    setBusca(buscaDaUrl)
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
          {LINKS.map((link) => (
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
          <a href="#/login" className="botao botao-primario">
            <IconeEntrar width={16} height={16} />
            Entrar
          </a>
        </div>
      </div>
    </header>
  )
}
