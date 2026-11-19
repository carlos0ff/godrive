import { useState, type FormEvent } from 'react'
import { api, mensagemDeErro } from '../api'
import { IconeCadeado, IconeEmail, IconeSeta } from '../components/Icones'
import { CampoAuth, LayoutAuth } from '../components/LayoutAuth'
import { iniciarSessao } from '../sessao'

export function LoginPage({ volta }: { volta: string }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    let problema: string | null = null

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) problema = 'Informe um e-mail válido.'
    else if (!senha) problema = 'Informe a senha.'

    setErro(problema)

    if (problema) return

    setEnviando(true)

    try {
      const sessao = await api.login(email.trim(), senha)

      iniciarSessao(sessao, lembrar)
      window.location.hash = volta.startsWith('/') ? volta : '/'
    } catch (falha) {
      setErro(mensagemDeErro(falha))
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth
      eyebrow="Bem-vindo de volta!"
      titulo="Acesse sua conta"
      descricao="Entre para reservar veículos e acompanhar suas locações."
      citacao="“Seu próximo destino começa com a chave certa.”"
      subtitulo="Carros selecionados, diárias claras e reserva em poucos passos."
      carro={{ src: '/veiculos/PEUA.png', alt: 'Peugeot 208 azul' }}
    >
      <form className="login-form" onSubmit={enviar} noValidate>
        {erro && (
          <p className="form-erro" role="alert">
            {erro}
          </p>
        )}

        <CampoAuth
          id="login-email"
          rotulo="E-mail"
          icone={<IconeEmail />}
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />

        <CampoAuth
          id="login-senha"
          rotulo="Senha"
          icone={<IconeCadeado />}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
        />

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
        </div>

        <button type="submit" className="login-entrar" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
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
    </LayoutAuth>
  )
}
