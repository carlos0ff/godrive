import { Link } from '../router/Link'

export function Footer() {
  return (
    <footer className="rodape">
      <div className="container rodape-inner">
        <strong className="rodape-marca">goDrive</strong>

        <p className="rodape-nota">
          Preços por diária. Proteções e taxa de aluguel (12%) não inclusas.
        </p>

        <nav className="rodape-links" aria-label="Links do rodapé">
          <Link para="/veiculos">Ver veículos</Link>
          <Link para="/locacoes">Minhas locações</Link>
          <a href="#/veiculos">Fale conosco</a>
        </nav>
      </div>
    </footer>
  )
}
