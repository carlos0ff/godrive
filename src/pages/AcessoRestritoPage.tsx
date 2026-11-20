import { EstadoVazio } from '../components/Estados'
import { rota } from '../navegacao'

export function AcessoRestritoPage() {
  return (
    <section className="container pagina-estreita">
      <EstadoVazio
        titulo="Acesso restrito"
        descricao="Somente administradores podem cadastrar veículos."
        acao={
          <a href={rota('/veiculos')} className="botao botao-primario">
            Ver veículos
          </a>
        }
      />
    </section>
  )
}
