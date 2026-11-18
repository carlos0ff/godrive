import { useEffect, useState, type ReactNode } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CadastroPage } from './pages/CadastroPage'
import { ConfirmarEmailPage } from './pages/ConfirmarEmailPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { LocacoesPage } from './pages/LocacoesPage'
import { LoginPage } from './pages/LoginPage'
import { NaoEncontradaPage } from './pages/NaoEncontradaPage'
import { NovaLocacaoPage } from './pages/NovaLocacaoPage'
import { NovoVeiculoPage } from './pages/NovoVeiculoPage'
import { RecuperarPage } from './pages/RecuperarPage'
import { useSessao } from './sessao'
import './App.css'

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
    consulta,
    parametros: new URLSearchParams(consulta),
  }
}

function Redirecionar({ para }: { para: string }) {
  useEffect(() => {
    window.location.replace(`#${para}`)
  }, [para])

  return null
}

function App() {
  const { caminho, consulta, parametros } = useHash()
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
    case '/recuperar':
      return <RecuperarPage />
    case '/confirmar-email':
      return (
        <ConfirmarEmailPage
          key={parametros.toString()}
          email={parametros.get('email') ?? ''}
          origem={parametros.get('origem') ?? ''}
        />
      )
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
