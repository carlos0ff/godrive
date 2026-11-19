import { rota } from '../navegacao'

export function Footer() {
  return (
    <footer className="rodape">
      <div className="container rodape-inner">
        <strong className="rodape-marca">goDrive</strong>

        <p className="rodape-nota">
          Preços por diária. Proteções e taxa de aluguel (12%) não inclusas.
        </p>

        <nav className="rodape-links" aria-label="Links do rodapé">
          <a href={rota('/veiculos')}>Ver veículos</a>
          <a href={rota('/locacoes')}>Minhas locações</a>
          <a href={rota('/veiculos')}>Fale conosco</a>
        </nav>
      </div>
    </footer>
  )
}
