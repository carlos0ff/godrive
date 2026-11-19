import { useEffect, type ReactNode } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CadastroPage } from './pages/CadastroPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { LocacoesPage } from './pages/LocacoesPage'
import { LoginPage } from './pages/LoginPage'
import { NaoEncontradaPage } from './pages/NaoEncontradaPage'
import { NovaLocacaoPage } from './pages/NovaLocacaoPage'
import { NovoVeiculoPage } from './pages/NovoVeiculoPage'
import { navegar, useLocalizacao } from './navegacao'
import { useSessao } from './sessao'
import './App.css'

function Redirecionar({ para }: { para: string }) {
  useEffect(() => {
    navegar(para, { substituir: true })
  }, [para])

  return null
}

function App() {
  const { caminho, consulta, parametros } = useLocalizacao()
  const { autenticado } = useSessao()
  const busca = parametros.get('busca') ?? ''
  const destino = `${caminho}${consulta ? `?${consulta}` : ''}`

  function exigirLogin(conteudo: ReactNode) {
    return autenticado ? conteudo : <Redirecionar para={`/login?volta=${encodeURIComponent(destino)}`} />
  }

  let pagina

  switch (caminho) {
    case '/':
    case '/veiculos':
      pagina = <CatalogoPage busca={busca} mostrarHero={caminho === '/'} />
      break
    case '/veiculos/novo':
      pagina = exigirLogin(<NovoVeiculoPage />)
      break
    case '/locacoes':
      pagina = exigirLogin(<LocacoesPage />)
      break
    case '/locacoes/nova':
      pagina = exigirLogin(<NovaLocacaoPage veiculoInicial={parametros.get('veiculo') ?? ''} />)
      break
    default:
      pagina = <NaoEncontradaPage />
  }

  switch (caminho) {
    case '/login':
      return <LoginPage volta={parametros.get('volta') ?? ''} />
    case '/cadastro':
      return <CadastroPage />
  }

  return (
    <>
      <Header caminho={caminho} busca={busca} />
      <main id="conteudo" key={caminho}>
        {pagina}
      </main>
      <Footer />
    </>
  )
}

export default App
