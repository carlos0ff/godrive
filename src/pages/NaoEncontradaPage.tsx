import { EstadoVazio } from '../components/Estados'

export function NaoEncontradaPage() {
  return (
    <section className="container pagina-estreita">
      <EstadoVazio
        titulo="Página não encontrada"
        descricao="O endereço acessado não existe ou foi movido."
        acao={
          <a href="#/" className="botao botao-primario">
            Ir para o início
          </a>
        }
      />
    </section>
  )
}
