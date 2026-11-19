import { useState, type ChangeEvent, type FormEvent } from 'react'
import { api, mensagemDeErro } from '../api'
import { IconeMais } from '../components/Icones'
import { rota } from '../navegacao'

const CATEGORIAS = ['Sedã', 'Hatch', 'SUV', 'Picape', 'Minivan', 'Utilitário']
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico']

const INICIAL = {
  marca: '',
  modelo: '',
  ano: String(new Date().getFullYear()),
  categoria: CATEGORIAS[0],
  placa: '',
  cor: '',
  combustivel: COMBUSTIVEIS[0],
  lugares: '5',
  quilometragem: '0',
  valorDiaria: '',
  imagemUrl: '',
  disponivel: true,
}

type Formulario = typeof INICIAL
type OrigemImagem = 'url' | 'upload'

const TAMANHO_MAXIMO = 5 * 1024 * 1024

export function NovoVeiculoPage() {
  const [form, setForm] = useState<Formulario>(INICIAL)
  const [erro, setErro] = useState<string | null>(null)
  const [cadastrado, setCadastrado] = useState<string | null>(null)
  const [origemImagem, setOrigemImagem] = useState<OrigemImagem>('url')
  const [arquivo, setArquivo] = useState<{ nome: string; dados: string } | null>(null)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const [chaveArquivo, setChaveArquivo] = useState(0)
  const [enviando, setEnviando] = useState(false)

  const urlDigitada = form.imagemUrl.trim()
  const previa =
    origemImagem === 'url'
      ? /^https?:\/\/\S+$/i.test(urlDigitada)
        ? urlDigitada
        : ''
      : (arquivo?.dados ?? '')

  function alterar(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const campo = evento.target
    const valor =
      campo instanceof HTMLInputElement && campo.type === 'checkbox'
        ? campo.checked
        : campo.value

    setForm((atual) => ({ ...atual, [campo.name]: valor }))
  }

  function escolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0]

    setErroArquivo(null)
    setArquivo(null)

    if (!escolhido) return

    if (!escolhido.type.startsWith('image/')) {
      setErroArquivo('Escolha um arquivo de imagem (PNG, JPG, WEBP…).')
      return
    }

    if (escolhido.size > TAMANHO_MAXIMO) {
      setErroArquivo('A imagem precisa ter no máximo 5 MB.')
      return
    }

    const leitor = new FileReader()

    leitor.onload = () => {
      if (typeof leitor.result === 'string')
        setArquivo({ nome: escolhido.name, dados: leitor.result })
    }
    leitor.onerror = () => setErroArquivo('Não foi possível ler a imagem.')
    leitor.readAsDataURL(escolhido)
  }

  function validar(): string | null {
    if (!form.marca.trim()) return 'Informe a marca.'
    if (!form.modelo.trim()) return 'Informe o modelo.'
    if (!/^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/.test(form.placa.trim()))
      return 'Informe uma placa válida (ABC-1D23 ou ABC1234).'

    const ano = Number(form.ano)

    if (!Number.isInteger(ano) || ano < 1950 || ano > new Date().getFullYear() + 1)
      return 'Informe um ano válido.'

    if (!(Number(form.valorDiaria) > 0)) return 'Informe o valor da diária.'

    const url = form.imagemUrl.trim()

    if (origemImagem === 'url' && url && !/^https?:\/\/\S+$/i.test(url))
      return 'Informe uma URL de imagem começando com http:// ou https://.'

    if (origemImagem === 'upload' && erroArquivo) return erroArquivo

    return null
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const problema = validar()

    setErro(problema)
    setCadastrado(null)

    if (problema) return

    setEnviando(true)

    try {
      const veiculo = await api.cadastrarVeiculo({
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: Number(form.ano),
        categoria: form.categoria,
        placa: form.placa.trim().toUpperCase(),
        cor: form.cor.trim() || null,
        combustivel: form.combustivel,
        lugares: Number(form.lugares),
        quilometragem: Number(form.quilometragem),
        valorDiaria: Number(form.valorDiaria),
        disponivel: form.disponivel,
        imagemUrl: (origemImagem === 'url' ? form.imagemUrl.trim() : arquivo?.dados) || null,
      })

      setCadastrado(`${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`)
      setForm(INICIAL)
      setArquivo(null)
      setChaveArquivo((n) => n + 1)
    } catch (falha) {
      setErro(mensagemDeErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="container pagina-media">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Frota</span>
          <h1>Cadastrar veículo</h1>
          <p>Preencha os dados do veículo para incluí-lo no catálogo.</p>
        </header>

        <form onSubmit={enviar} noValidate>
          {cadastrado && (
            <p className="form-sucesso" role="status">
              <span>
                {cadastrado} cadastrado com sucesso. <a href={rota('/veiculos')}>Ver no catálogo</a>
              </span>
            </p>
          )}

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <div className="campo-linha">
            <label className="campo" htmlFor="veiculo-marca">
              <span>Marca</span>
              <input
                id="veiculo-marca"
                name="marca"
                value={form.marca}
                onChange={alterar}
                placeholder="Toyota"
                required
              />
            </label>

            <label className="campo" htmlFor="veiculo-modelo">
              <span>Modelo</span>
              <input
                id="veiculo-modelo"
                name="modelo"
                value={form.modelo}
                onChange={alterar}
                placeholder="Corolla"
                required
              />
            </label>
          </div>

          <div className="campo-linha tres">
            <label className="campo" htmlFor="veiculo-ano">
              <span>Ano</span>
              <input
                id="veiculo-ano"
                name="ano"
                type="number"
                min={1950}
                max={new Date().getFullYear() + 1}
                value={form.ano}
                onChange={alterar}
                required
              />
            </label>

            <label className="campo" htmlFor="veiculo-categoria">
              <span>Categoria</span>
              <select
                id="veiculo-categoria"
                name="categoria"
                value={form.categoria}
                onChange={alterar}
              >
                {CATEGORIAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo" htmlFor="veiculo-placa">
              <span>Placa</span>
              <input
                id="veiculo-placa"
                name="placa"
                value={form.placa}
                onChange={alterar}
                placeholder="ABC-1D23"
                maxLength={8}
                required
              />
            </label>
          </div>

          <div className="campo-linha tres">
            <label className="campo" htmlFor="veiculo-cor">
              <span>Cor</span>
              <input
                id="veiculo-cor"
                name="cor"
                value={form.cor}
                onChange={alterar}
                placeholder="Prata"
              />
            </label>

            <label className="campo" htmlFor="veiculo-combustivel">
              <span>Combustível</span>
              <select
                id="veiculo-combustivel"
                name="combustivel"
                value={form.combustivel}
                onChange={alterar}
              >
                {COMBUSTIVEIS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo" htmlFor="veiculo-lugares">
              <span>Lugares</span>
              <input
                id="veiculo-lugares"
                name="lugares"
                type="number"
                min={1}
                max={9}
                value={form.lugares}
                onChange={alterar}
              />
            </label>
          </div>

          <div className="campo-linha">
            <label className="campo" htmlFor="veiculo-km">
              <span>Quilometragem</span>
              <input
                id="veiculo-km"
                name="quilometragem"
                type="number"
                min={0}
                value={form.quilometragem}
                onChange={alterar}
              />
            </label>

            <label className="campo" htmlFor="veiculo-preco">
              <span>Diária (R$)</span>
              <input
                id="veiculo-preco"
                name="valorDiaria"
                type="number"
                min={1}
                step="0.01"
                value={form.valorDiaria}
                onChange={alterar}
                placeholder="149,90"
                required
              />
            </label>
          </div>

          <fieldset className="campo campo-imagem">
            <legend>Imagem do veículo (opcional)</legend>

            <div className="abas" role="radiogroup" aria-label="Como enviar a imagem">
              <button
                type="button"
                role="radio"
                aria-checked={origemImagem === 'url'}
                className={`aba${origemImagem === 'url' ? ' ativa' : ''}`}
                onClick={() => setOrigemImagem('url')}
              >
                URL da imagem
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={origemImagem === 'upload'}
                className={`aba${origemImagem === 'upload' ? ' ativa' : ''}`}
                onClick={() => setOrigemImagem('upload')}
              >
                Upload da imagem
              </button>
            </div>

            {origemImagem === 'url' ? (
              <input
                id="veiculo-imagem"
                name="imagemUrl"
                type="url"
                aria-label="URL da imagem"
                value={form.imagemUrl}
                onChange={alterar}
                placeholder="https://…/corolla.png"
              />
            ) : (
              <>
                <input
                  key={chaveArquivo}
                  id="veiculo-arquivo"
                  type="file"
                  accept="image/*"
                  aria-label="Arquivo da imagem"
                  onChange={escolherArquivo}
                />
                <small className="campo-dica">
                  {arquivo ? arquivo.nome : 'PNG, JPG ou WEBP, até 5 MB.'}
                </small>
                {erroArquivo && (
                  <small className="campo-erro" role="alert">
                    {erroArquivo}
                  </small>
                )}
              </>
            )}

            {previa && (
              <img className="imagem-previa" src={previa} alt="Prévia da imagem do veículo" />
            )}
          </fieldset>

          <label className="alternador" htmlFor="veiculo-disponivel">
            <input
              id="veiculo-disponivel"
              name="disponivel"
              type="checkbox"
              checked={form.disponivel}
              onChange={alterar}
            />
            Disponível para locação
          </label>

          <div className="acoes-form">
            <a href={rota('/veiculos')} className="botao botao-secundario">
              Cancelar
            </a>

            <button type="submit" className="botao botao-primario" disabled={enviando}>
              <IconeMais width={16} height={16} />
              {enviando ? 'Cadastrando…' : 'Cadastrar veículo'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
