import { useState, type FormEvent } from 'react'
import { IconeUsuario } from '../components/Icones'

export function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  function validar(): string | null {
    if (nome.trim().length < 3) return 'Informe seu nome completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.'
    if (senha.length < 6) return 'A senha precisa ter ao menos 6 caracteres.'
    if (senha !== confirmacao) return 'As senhas não conferem.'

    return null
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const problema = validar()

    setErro(problema)
    setEnviado(!problema)
  }

  return (
    <section className="container pagina-estreita">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Novo por aqui</span>
          <h1>Criar conta</h1>
          <p>Leva menos de um minuto e já libera as reservas.</p>
        </header>

        <form onSubmit={enviar} noValidate>
          {enviado && (
            <p className="form-sucesso" role="status">
              Dados válidos. Este app é só frontend: nenhuma conta foi criada.
            </p>
          )}

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <label className="campo" htmlFor="cadastro-nome">
            <span>Nome completo</span>
            <input
              id="cadastro-nome"
              type="text"
              autoComplete="name"
              placeholder="Como devemos chamar você"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              required
            />
          </label>

          <label className="campo" htmlFor="cadastro-email">
            <span>E-mail</span>
            <input
              id="cadastro-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </label>

          <div className="campo-linha">
            <label className="campo" htmlFor="cadastro-senha">
              <span>Senha</span>
              <input
                id="cadastro-senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
              />
            </label>

            <label className="campo" htmlFor="cadastro-confirmacao">
              <span>Confirmar senha</span>
              <input
                id="cadastro-confirmacao"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit" className="botao botao-primario botao-bloco">
            <IconeUsuario width={16} height={16} />
            Criar conta
          </button>
        </form>

        <p className="form-rodape">
          Já tem conta? <a href="#/login">Entrar</a>
        </p>
      </div>
    </section>
  )
}
