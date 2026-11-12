import { EstadoVazio } from '../components/Estados'
import { Link } from '../router/Link'

export function NaoEncontradaPage() {
  return (
    <section className="container pagina-estreita">
      <EstadoVazio
        titulo="Página não encontrada"
        descricao="O endereço acessado não existe ou foi movido."
        acao={
          <Link para="/" className="botao botao-primario">
            Ir para o início
          </Link>
        }
      />
    </section>
  )
}
