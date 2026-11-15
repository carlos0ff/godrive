import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { api, mensagemDeErro } from '../api'
import { IconeCadeado, IconeCheck, IconeSeta } from '../components/Icones'
import { CampoAuth, LayoutAuth } from '../components/LayoutAuth'

const DIGITOS = 6
const ESPERA_REENVIO = 30

interface Props {
  email: string
  origem: string
}

type Etapa = 'codigo' | 'nova-senha' | 'concluido'

export function ConfirmarEmailPage({ email, origem }: Props) {
  const recuperando = origem === 'recuperar'

  const [digitos, setDigitos] = useState<string[]>(Array(DIGITOS).fill(''))
  const [etapa, setEtapa] = useState<Etapa>('codigo')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [espera, setEspera] = useState(ESPERA_REENVIO)
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campos = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (espera <= 0) return

    const id = window.setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [espera])

  function focar(indice: number) {
    campos.current[Math.max(0, Math.min(DIGITOS - 1, indice))]?.focus()
  }

  function alterar(indice: number, valor: string) {
    const numero = valor.replace(/\D/g, '').slice(-1)

    setDigitos((atuais) => atuais.map((d, i) => (i === indice ? numero : d)))
    if (numero) focar(indice + 1)
  }

  function teclar(indice: number, evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Backspace' && !digitos[indice]) focar(indice - 1)
    if (evento.key === 'ArrowLeft') focar(indice - 1)
    if (evento.key === 'ArrowRight') focar(indice + 1)
  }

  function colar(evento: ClipboardEvent<HTMLInputElement>) {
    const colado = evento.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITOS)

    if (!colado) return

    evento.preventDefault()
    setDigitos(Array.from({ length: DIGITOS }, (_, i) => colado[i] ?? ''))
    focar(colado.length)
  }

  const finalidade = recuperando ? 'RECUPERAR_SENHA' : 'CONFIRMAR_EMAIL'
  const codigo = digitos.join('')

  async function reenviar() {
    setEspera(ESPERA_REENVIO)
    setErro(null)

    try {
      await api.reenviarCodigo(email, finalidade)
      setAviso(`Enviamos um novo código para ${email || 'seu e-mail'}.`)
    } catch (falha) {
      setErro(mensagemDeErro(falha))
    }
  }

  async function confirmarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (digitos.some((d) => !d)) {
      setErro(`Digite os ${DIGITOS} números do código.`)
      return
    }

    setEnviando(true)

    try {
      if (recuperando) await api.verificarCodigo(email, codigo, finalidade)
      else await api.confirmarEmail(email, codigo)

      setErro(null)
      setAviso(null)
      setEtapa(recuperando ? 'nova-senha' : 'concluido')
    } catch (falha) {
      setErro(mensagemDeErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  async function salvarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (senha.length < 6) {
      setErro('A senha precisa ter ao menos 6 caracteres.')
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não conferem.')
      return
    }

    setEnviando(true)

    try {
      await api.redefinirSenha(email, codigo, senha)
      setErro(null)
      setEtapa('concluido')
    } catch (falha) {
      setErro(mensagemDeErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  const textos = {
    codigo: {
      eyebrow: 'Verificação',
      titulo: 'Confirme seu e-mail',
      descricao: (
        <>
          Enviamos um código de {DIGITOS} dígitos para <strong>{email || 'seu e-mail'}</strong>.
        </>
      ),
    },
    'nova-senha': {
      eyebrow: 'Código confirmado',
      titulo: 'Crie uma nova senha',
      descricao: 'Escolha uma senha com ao menos 6 caracteres.',
    },
    concluido: {
      eyebrow: 'Tudo certo!',
      titulo: recuperando ? 'Senha redefinida' : 'E-mail confirmado',
      descricao: recuperando
        ? 'Sua nova senha foi definida. Entre com ela para continuar.'
        : 'Sua conta está pronta. Entre para reservar seu carro.',
    },
  }[etapa]

  return (
    <LayoutAuth
      {...textos}
      citacao="“Só falta um passo para pegar a estrada.”"
      subtitulo="O código garante que só você tem acesso à sua conta."
      carro={{ src: '/veiculos/HB2C.png', alt: 'Hyundai HB20S prata' }}
    >
      {etapa === 'codigo' && (
        <form className="login-form" onSubmit={confirmarCodigo} noValidate>
          {aviso && (
            <p className="form-sucesso" role="status">
              {aviso}
            </p>
          )}

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <fieldset className="codigo">
            <legend>Código de verificação</legend>

            <div className="codigo-digitos">
              {digitos.map((digito, indice) => (
                <input
                  key={indice}
                  ref={(el) => {
                    campos.current[indice] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={indice === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  aria-label={`Dígito ${indice + 1}`}
                  value={digito}
                  onChange={(evento) => alterar(indice, evento.target.value)}
                  onKeyDown={(evento) => teclar(indice, evento)}
                  onPaste={colar}
                  onFocus={(evento) => evento.target.select()}
                />
              ))}
            </div>

            <small className="codigo-dica">
              O código vale por 15 minutos.
            </small>
          </fieldset>

          <button type="submit" className="login-entrar" disabled={enviando}>
            {enviando ? 'Verificando…' : 'Confirmar código'}
            <IconeSeta width={16} height={16} />
          </button>

          <p className="codigo-reenviar">
            Não recebeu?{' '}
            {espera > 0 ? (
              <span>Reenviar em {espera}s</span>
            ) : (
              <button type="button" className="login-link" onClick={reenviar}>
                Reenviar código
              </button>
            )}
          </p>
        </form>
      )}

      {etapa === 'nova-senha' && (
        <form className="login-form" onSubmit={salvarSenha} noValidate>
          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <CampoAuth
            id="nova-senha"
            rotulo="Nova senha"
            icone={<IconeCadeado />}
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />

          <CampoAuth
            id="nova-senha-confirmacao"
            rotulo="Confirmar nova senha"
            icone={<IconeCadeado />}
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmacao}
            onChange={(evento) => setConfirmacao(evento.target.value)}
          />

          <button type="submit" className="login-entrar" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar nova senha'}
            <IconeSeta width={16} height={16} />
          </button>
        </form>
      )}

      {etapa === 'concluido' && (
        <div className="login-form">
          <div className="codigo-ok" aria-hidden="true">
            <IconeCheck width={28} height={28} />
          </div>

          <a href="#/login" className="login-entrar">
            Ir para o login
            <IconeSeta width={16} height={16} />
          </a>
        </div>
      )}

      <p className="login-cadastro">
        {recuperando ? (
          <>
            Lembrou a senha? <a href="#/login">Voltar ao login</a>
          </>
        ) : (
          <>
            E-mail errado? <a href="#/cadastro">Voltar ao cadastro</a>
          </>
        )}
      </p>
    </LayoutAuth>
  )
}
