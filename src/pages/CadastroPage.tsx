import { useState, type FormEvent } from 'react'
import { IconeCadeado, IconeEmail, IconeSeta, IconeUsuario } from '../components/Icones'
import { CampoAuth, LayoutAuth } from '../components/LayoutAuth'

export function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [aceite, setAceite] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function validar(): string | null {
    if (nome.trim().length < 3) return 'Informe seu nome completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.'
    if (senha.length < 6) return 'A senha precisa ter ao menos 6 caracteres.'
    if (senha !== confirmacao) return 'As senhas não conferem.'
    if (!aceite) return 'Aceite os Termos de Uso para continuar.'

    return null
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const problema = validar()

    setErro(problema)

    if (!problema) {
      window.location.hash = `/confirmar-email?email=${encodeURIComponent(email.trim())}`
    }
  }

  return (
    <LayoutAuth
      eyebrow="Novo por aqui?"
      titulo="Crie sua conta"
      descricao="Leva menos de um minuto e já libera as reservas."
      citacao="“A estrada é sua. A gente cuida do resto.”"
      subtitulo="Cadastre-se e escolha entre hatches, sedãs, SUVs e picapes."
      carro={{ src: '/veiculos/TORA.png', alt: 'Fiat Toro grafite' }}
    >
      <form className="login-form" onSubmit={enviar} noValidate>
        {erro && (
          <p className="form-erro" role="alert">
            {erro}
          </p>
        )}

        <CampoAuth
          id="cadastro-nome"
          rotulo="Nome completo"
          icone={<IconeUsuario />}
          autoComplete="name"
          placeholder="Como devemos chamar você"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />

        <CampoAuth
          id="cadastro-email"
          rotulo="E-mail"
          icone={<IconeEmail />}
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />

        <div className="login-linha">
          <CampoAuth
            id="cadastro-senha"
            rotulo="Senha"
            icone={<IconeCadeado />}
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 6"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />

          <CampoAuth
            id="cadastro-confirmacao"
            rotulo="Confirmar senha"
            icone={<IconeCadeado />}
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmacao}
            onChange={(evento) => setConfirmacao(evento.target.value)}
          />
        </div>

        <div className="login-opcoes">
          <label htmlFor="cadastro-aceite">
            <input
              id="cadastro-aceite"
              type="checkbox"
              checked={aceite}
              onChange={(evento) => setAceite(evento.target.checked)}
            />
            <span>
              Li e aceito os <a href="#/cadastro">Termos de Uso</a>
            </span>
          </label>
        </div>

        <button type="submit" className="login-entrar">
          Criar conta
          <IconeSeta width={16} height={16} />
        </button>
      </form>

      <p className="login-cadastro">
        Já tem conta? <a href="#/login">Entrar</a>
      </p>
    </LayoutAuth>
  )
}
