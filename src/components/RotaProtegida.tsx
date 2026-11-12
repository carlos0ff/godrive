import { useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from '../context/auth'
import { Link } from '../router/Link'
import { navegar, useRota } from '../router/rotas'
import { Carregando } from './Estados'
import { IconeAlerta } from './Icones'

interface Props {
  children: ReactNode
  somenteAdmin?: boolean
}

/* Proteção de navegação: só exibe a página para usuários autenticados
   (e administradores, quando exigido). */
export function RotaProtegida({ children, somenteAdmin = false }: Props) {
  const { autenticado, carregando, ehAdmin } = useAuth()
  const { caminho, parametros } = useRota()

  const precisaEntrar = !carregando && !autenticado
  const consulta = parametros.toString()
  const jaRedirecionou = useRef(false)

  useEffect(() => {
    /* Redireciona uma única vez: sem a trava, um novo disparo depois da troca
       de rota aninharia /login dentro do próprio parâmetro `redir`. */
    if (!precisaEntrar || jaRedirecionou.current || caminho.startsWith('/login')) return

    jaRedirecionou.current = true

    const atual = `${caminho}${consulta ? `?${consulta}` : ''}`

    navegar(`/login?redir=${encodeURIComponent(atual)}`, { substituir: true })
  }, [precisaEntrar, caminho, consulta])

  if (carregando) return <Carregando texto="Verificando sua sessão…" />

  if (precisaEntrar) return <Carregando texto="Redirecionando para o login…" />

  if (somenteAdmin && !ehAdmin) {
    return (
      <section className="container pagina-estreita">
        <div className="estado estado-erro" role="alert">
          <IconeAlerta width={26} height={26} />
          <strong>Acesso restrito</strong>
          <p>Esta área é exclusiva para administradores da frota.</p>

          <Link para="/veiculos" className="botao botao-secundario">
            Voltar ao catálogo
          </Link>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
