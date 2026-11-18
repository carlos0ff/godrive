import { useState, type FormEvent } from 'react'
import { api, mensagemDeErro } from '../api'
import { IconeEmail, IconeSeta } from '../components/Icones'
import { CampoAuth, LayoutAuth } from '../components/LayoutAuth'

export function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.')
      return
    }

    setErro(null)
    setEnviando(true)

    try {
      await api.recuperarSenha(email.trim())
      window.location.hash = `/confirmar-email?email=${encodeURIComponent(email.trim())}&origem=recuperar`
    } catch (falha) {
      setErro(mensagemDeErro(falha))
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth
      eyebrow="Esqueceu a senha?"
      titulo="Recuperar acesso"
      descricao="Informe o e-mail da sua conta e enviaremos um código de verificação."
      citacao="“Perdeu a chave? A gente tem uma reserva.”"
      subtitulo="Em poucos passos você volta a reservar seu próximo carro."
      carro={{ src: '/veiculos/RENE.png', alt: 'Jeep Renegade prata' }}
    >
      <form className="login-form" onSubmit={enviar} noValidate>
        {erro && (
          <p className="form-erro" role="alert">
            {erro}
          </p>
        )}

        <CampoAuth
          id="recuperar-email"
          rotulo="E-mail"
          icone={<IconeEmail />}
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />

        <button type="submit" className="login-entrar" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar código'}
          <IconeSeta width={16} height={16} />
        </button>
      </form>

      <p className="login-cadastro">
        Lembrou a senha? <a href="#/login">Voltar ao login</a>
      </p>
    </LayoutAuth>
  )
}
