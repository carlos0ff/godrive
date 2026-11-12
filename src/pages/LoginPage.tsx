import { useState, type FormEvent } from 'react'
import { mensagemDeErro } from '../dados'
import { useAuth } from '../context/auth'
import { useFeedback } from '../context/feedback'
import { Link } from '../router/Link'
import { navegar, useRota } from '../router/rotas'
import { IconeEntrar } from '../components/Icones'

export function LoginPage() {
  const { entrar } = useAuth()
  const { sucesso, erro: avisarErro } = useFeedback()
  const { parametros } = useRota()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const destino = parametros.get('redir') ?? '/veiculos'

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (enviando) return

    setErro(null)

    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }

    setEnviando(true)

    try {
      const usuario = await entrar({ email: email.trim(), senha })

      sucesso(`Bem-vindo(a) de volta, ${usuario.nome.split(' ')[0]}!`)
      navegar(destino)
    } catch (falha) {
      const texto = mensagemDeErro(falha)

      setErro(texto)
      avisarErro(texto)
    } finally {
      setEnviando(false)
    }
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
          <p className="dica-demo">
            <strong>Como entrar</strong>
            Use qualquer e-mail e senha (mínimo de 4 caracteres). E-mails começando com
            <strong> admin</strong> abrem a área de cadastro de veículos.
          </p>

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

          <button type="submit" className="botao botao-primario botao-bloco" disabled={enviando}>
            <IconeEntrar width={16} height={16} />
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="form-rodape">
          Ainda não tem conta? <Link para="/cadastro">Criar conta</Link>
        </p>
      </div>
    </section>
  )
}
