import { useEffect, useState } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CadastroPage } from './pages/CadastroPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { LocacoesPage } from './pages/LocacoesPage'
import { LoginPage } from './pages/LoginPage'
import { NaoEncontradaPage } from './pages/NaoEncontradaPage'
import { NovaLocacaoPage } from './pages/NovaLocacaoPage'
import { NovoVeiculoPage } from './pages/NovoVeiculoPage'
import './App.css'

/* Navegação por hash (#/rota?consulta): os links são <a href="#/..."> comuns. */
function useHash() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    function aoMudar() {
      setHash(window.location.hash)
      window.scrollTo({ top: 0 })
    }

    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  const [caminho, consulta = ''] = hash.replace(/^#/, '').split('?')

  return {
    caminho: caminho.replace(/\/+$/, '') || '/',
    parametros: new URLSearchParams(consulta),
  }
}

function App() {
  const { caminho, parametros } = useHash()
  const busca = parametros.get('busca') ?? ''

  let pagina

  switch (caminho) {
    case '/':
    case '/veiculos':
      pagina = <CatalogoPage busca={busca} mostrarHero={caminho === '/'} />
      break
    case '/login':
      pagina = <LoginPage />
      break
    case '/cadastro':
      pagina = <CadastroPage />
      break
    case '/veiculos/novo':
      pagina = <NovoVeiculoPage />
      break
    case '/locacoes':
      pagina = <LocacoesPage />
      break
    case '/locacoes/nova':
      pagina = <NovaLocacaoPage veiculoInicial={parametros.get('veiculo') ?? ''} />
      break
    default:
      pagina = <NaoEncontradaPage />
  }

  /* O login ocupa a tela inteira, sem cabeçalho nem rodapé. */
  if (caminho === '/login') return <LoginPage />

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
