import { useState, type FormEvent } from 'react'
import logoGoDrive from '../assets/godrive.png'
import {
  IconeCadeado,
  IconeEmail,
  IconeOlho,
  IconeOlhoFechado,
  IconeSeta,
} from '../components/Icones'

/* Tela de login em duas colunas: painel da marca com o Peugeot 208 à esquerda
   e o formulário à direita. App só frontend: os dados não são verificados. */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.')
      setAviso(null)
      return
    }

    if (!senha) {
      setErro('Informe a senha.')
      setAviso(null)
      return
    }

    setErro(null)
    setAviso('Formulário válido. Este app é só frontend: o login não é verificado.')
  }

  return (
    <div className="login">
      <aside className="login-painel">
        <a className="login-logo" href="#/" aria-label="goDrive, voltar ao início">
          <img src={logoGoDrive} alt="goDrive" width={190} height={40} />
        </a>

        <div className="login-citacao">
          <p>“Seu próximo destino começa com a chave certa.”</p>
          <span className="login-traco" aria-hidden="true" />
          <small>Carros selecionados, diárias claras e reserva em poucos passos.</small>
        </div>

        <img
          className="login-carro"
          src="/veiculos/PEUA.png"
          alt="Peugeot 208 azul"
          width={420}
          height={227}
        />
      </aside>

      <main className="login-conteudo">
        <a className="login-voltar" href="#/">
          ← Voltar ao site
        </a>

        <div className="login-caixa">
          <header className="login-cabecalho">
            <span>Bem-vindo de volta!</span>
            <h1>Acesse sua conta</h1>
            <p>Entre para reservar veículos e acompanhar suas locações.</p>
          </header>

          <form className="login-form" onSubmit={enviar} noValidate>
            {aviso && (
              <p className="form-sucesso" role="status">
                {aviso}
              </p>
            )}

            {erro && (
              <p className="form-erro" role="alert">
                {erro}
              </p>
            )}

            <label className="login-campo" htmlFor="login-email">
              <span>E-mail</span>
              <div className="login-input">
                <IconeEmail />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  required
                />
              </div>
            </label>

            <label className="login-campo" htmlFor="login-senha">
              <span>Senha</span>
              <div className="login-input">
                <IconeCadeado />
                <input
                  id="login-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-olho"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                >
                  {mostrarSenha ? <IconeOlhoFechado /> : <IconeOlho />}
                </button>
              </div>
            </label>

            <div className="login-opcoes">
              <label htmlFor="login-lembrar">
                <input
                  id="login-lembrar"
                  type="checkbox"
                  checked={lembrar}
                  onChange={(evento) => setLembrar(evento.target.checked)}
                />
                Lembrar-me
              </label>

              <button
                type="button"
                className="login-link"
                onClick={() => {
                  setErro(null)
                  setAviso('A recuperação de senha ainda não está disponível.')
                }}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" className="login-entrar">
              Entrar
              <IconeSeta width={16} height={16} />
            </button>
          </form>

          <p className="login-cadastro">
            Ainda não tem conta? <a href="#/cadastro">Criar conta</a>
          </p>

          <p className="login-termos">
            Ao entrar, você concorda com nossos <a href="#/">Termos de Uso</a> e{' '}
            <a href="#/">Política de Privacidade</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
