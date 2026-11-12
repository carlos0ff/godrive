import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import logoGoDrive from '../assets/godrive.png'
import { IconeOlho, IconeOlhoFechado } from './Icones'

interface LayoutProps {
  eyebrow: string
  titulo: string
  descricao: ReactNode
  citacao: string
  subtitulo: string
  carro: { src: string; alt: string }
  children: ReactNode
}

/* Tela de autenticação em duas colunas: painel verde da marca (com o carro
   atravessando a divisa, como no Figma) e o conteúdo à direita. */
export function LayoutAuth({
  eyebrow,
  titulo,
  descricao,
  citacao,
  subtitulo,
  carro,
  children,
}: LayoutProps) {
  return (
    <div className="login">
      <aside className="login-painel">
        <a className="login-logo" href="#/" aria-label="goDrive, voltar ao início">
          <img src={logoGoDrive} alt="goDrive" width={190} height={40} />
        </a>

        <div className="login-citacao">
          <p>{citacao}</p>
          <span className="login-traco" aria-hidden="true" />
          <small>{subtitulo}</small>
        </div>

        <img className="login-carro" src={carro.src} alt={carro.alt} width={420} height={227} />
      </aside>

      <main className="login-conteudo">
        <a className="login-voltar" href="#/">
          ← Voltar ao site
        </a>

        <div className="login-caixa">
          <header className="login-cabecalho">
            <span>{eyebrow}</span>
            <h1>{titulo}</h1>
            <p>{descricao}</p>
          </header>

          {children}
        </div>
      </main>
    </div>
  )
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  rotulo: string
  icone: ReactNode
}

/* Campo com rótulo em caixa alta e ícone à esquerda. Campos de senha ganham
   o botão de mostrar/ocultar. */
export function CampoAuth({ id, rotulo, icone, type = 'text', ...resto }: CampoProps) {
  const [mostrar, setMostrar] = useState(false)
  const ehSenha = type === 'password'

  return (
    <label className="login-campo" htmlFor={id}>
      <span>{rotulo}</span>
      <div className="login-input">
        {icone}
        <input id={id} type={ehSenha && mostrar ? 'text' : type} {...resto} />
        {ehSenha && (
          <button
            type="button"
            className="login-olho"
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrar}
            onClick={() => setMostrar((atual) => !atual)}
          >
            {mostrar ? <IconeOlhoFechado /> : <IconeOlho />}
          </button>
        )}
      </div>
    </label>
  )
}
