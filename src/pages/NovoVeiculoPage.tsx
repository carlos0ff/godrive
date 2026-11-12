import { useState, type ChangeEvent, type FormEvent } from 'react'
import { cadastrarVeiculo, mensagemDeErro } from '../dados'
import { IconeMais } from '../components/Icones'
import { useFeedback } from '../context/feedback'
import { navegar } from '../router/rotas'
import type { NovoVeiculo } from '../types'

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
  precoDiaria: '',
  imagemUrl: '',
  disponivel: true,
}

type Formulario = typeof INICIAL

export function NovoVeiculoPage() {
  const { sucesso, erro: avisarErro } = useFeedback()

  const [form, setForm] = useState<Formulario>(INICIAL)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function alterar(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const campo = evento.target
    const valor =
      campo instanceof HTMLInputElement && campo.type === 'checkbox'
        ? campo.checked
        : campo.value

    setForm((atual) => ({ ...atual, [campo.name]: valor }))
  }

  function validar(): string | null {
    if (!form.marca.trim()) return 'Informe a marca.'
    if (!form.modelo.trim()) return 'Informe o modelo.'
    if (!/^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/.test(form.placa.trim()))
      return 'Informe uma placa válida (ABC-1D23 ou ABC1234).'

    const ano = Number(form.ano)

    if (!Number.isInteger(ano) || ano < 1950 || ano > new Date().getFullYear() + 1)
      return 'Informe um ano válido.'

    if (!(Number(form.precoDiaria) > 0)) return 'Informe o valor da diária.'

    return null
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (enviando) return

    const problema = validar()

    if (problema) {
      setErro(problema)
      return
    }

    setErro(null)
    setEnviando(true)

    const dados: NovoVeiculo = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      categoria: form.categoria,
      placa: form.placa.trim().toUpperCase(),
      cor: form.cor.trim() || undefined,
      combustivel: form.combustivel,
      lugares: Number(form.lugares) || undefined,
      quilometragem: Number(form.quilometragem) || 0,
      precoDiaria: Number(form.precoDiaria),
      imagemUrl: form.imagemUrl.trim() || undefined,
      disponivel: form.disponivel,
    }

    try {
      const criado = await cadastrarVeiculo(dados)

      sucesso(`${criado.marca} ${criado.modelo} cadastrado na frota.`)
      setForm(INICIAL)
      navegar('/veiculos')
    } catch (falha) {
      const texto = mensagemDeErro(falha)

      setErro(texto)
      avisarErro(texto)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="container pagina-media">
      <div className="cartao-form">
        <header className="form-cabecalho">
          <span className="eyebrow">Administração</span>
          <h1>Cadastrar veículo</h1>
          <p>O veículo entra na frota e passa a aparecer no catálogo.</p>
        </header>

        <form onSubmit={enviar} noValidate>
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
                name="precoDiaria"
                type="number"
                min={1}
                step="0.01"
                value={form.precoDiaria}
                onChange={alterar}
                placeholder="149,90"
                required
              />
            </label>
          </div>

          <label className="campo" htmlFor="veiculo-imagem">
            <span>URL da imagem (opcional)</span>
            <input
              id="veiculo-imagem"
              name="imagemUrl"
              type="url"
              value={form.imagemUrl}
              onChange={alterar}
              placeholder="https://…/corolla.png"
            />
          </label>

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
            <button
              type="button"
              className="botao botao-secundario"
              onClick={() => navegar('/veiculos')}
            >
              Cancelar
            </button>

            <button type="submit" className="botao botao-primario" disabled={enviando}>
              <IconeMais width={16} height={16} />
              {enviando ? 'Salvando…' : 'Cadastrar veículo'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
