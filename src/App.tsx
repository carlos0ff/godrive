import { Avisos } from './components/Avisos'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { RotaProtegida } from './components/RotaProtegida'
import { CadastroPage } from './pages/CadastroPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { LocacoesPage } from './pages/LocacoesPage'
import { LoginPage } from './pages/LoginPage'
import { NaoEncontradaPage } from './pages/NaoEncontradaPage'
import { NovaLocacaoPage } from './pages/NovaLocacaoPage'
import { NovoVeiculoPage } from './pages/NovoVeiculoPage'
import { useRota } from './router/rotas'
import './App.css'

function Conteudo() {
  const { caminho } = useRota()

  switch (caminho) {
    case '/':
    case '/veiculos':
      return <CatalogoPage />

    case '/login':
      return <LoginPage />

    case '/cadastro':
      return <CadastroPage />

    case '/veiculos/novo':
      return (
        <RotaProtegida somenteAdmin>
          <NovoVeiculoPage />
        </RotaProtegida>
      )

    case '/locacoes':
      return (
        <RotaProtegida>
          <LocacoesPage />
        </RotaProtegida>
      )

    case '/locacoes/nova':
      return (
        <RotaProtegida>
          <NovaLocacaoPage />
        </RotaProtegida>
      )

    default:
      return <NaoEncontradaPage />
  }
}

function App() {
  return (
    <>
      <Header />

      <main id="conteudo">
        <Conteudo />
      </main>

      <Footer />
      <Avisos />
    </>
  )
}

export default App
