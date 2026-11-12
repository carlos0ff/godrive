import { useState, type FormEvent } from 'react'
import { IconeEntrar } from '../components/Icones'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      setEnviado(false)
      return
    }

    setErro(null)
    setEnviado(true)
  }

  return (
    <section className="container pagina-estreita">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Acesse sua conta</span>
          <h1>Bem-vindo(a) de volta</h1>
          <p>Entre para reservar veículos e acompanhar suas locações.</p>
        </header>

        <form onSubmit={enviar} noValidate>

          {enviado && (
            <p className="form-sucesso" role="status">
              Formulário válido. Este app é só frontend: o login não é verificado.
            </p>
          )}

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <label className="campo" htmlFor="login-email">
            <span>E-mail</span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </label>

          <label className="campo" htmlFor="login-senha">
            <span>Senha</span>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
          </label>

          <button type="submit" className="botao botao-primario botao-bloco">
            <IconeEntrar width={16} height={16} />
            Entrar
          </button>
        </form>

        <p className="form-rodape">
          Ainda não tem conta? <a href="#/cadastro">Criar conta</a>
        </p>
      </div>
    </section>
  )
}
