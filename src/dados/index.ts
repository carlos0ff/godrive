/* Camada de dados 100% no navegador: catálogo de demonstração em memória,
   persistido no localStorage. Nenhuma chamada de rede é feita. */
import type {
  Credenciais,
  FiltrosVeiculos,
  Locacao,
  NovaLocacao,
  NovoUsuario,
  NovoVeiculo,
  Pagina,
  Usuario,
  Veiculo,
} from '../types'
import { contarDiarias } from '../utils/formato'
import { LOCACOES_INICIAIS, VEICULOS_INICIAIS } from './catalogo'

const CHAVE = 'godrive:dados'
const VERSAO = 3
const ATRASO = 200

interface Banco {
  versao: number
  veiculos: Veiculo[]
  locacoes: Locacao[]
  usuario: Usuario | null
}

function bancoInicial(): Banco {
  return {
    versao: VERSAO,
    veiculos: VEICULOS_INICIAIS.map((v) => ({ ...v })),
    locacoes: LOCACOES_INICIAIS.map((l) => ({ ...l, veiculo: { ...l.veiculo } })),
    usuario: null,
  }
}

function carregar(): Banco {
  try {
    const salvo = localStorage.getItem(CHAVE)

    if (salvo) {
      const dados = JSON.parse(salvo) as Partial<Banco>

      if (dados.versao === VERSAO) return { ...bancoInicial(), ...dados, versao: VERSAO }

      return { ...bancoInicial(), usuario: dados.usuario ?? null }
    }
  } catch {
    /* armazenamento indisponível ou corrompido: começa do zero */
  }

  return bancoInicial()
}

const banco = carregar()

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco))
  } catch {
    /* sem armazenamento: os dados ficam só em memória */
  }
}

function ok<T>(valor: T): Promise<T> {
  return new Promise((resolver) => setTimeout(() => resolver(valor), ATRASO))
}

function falha<T = never>(mensagem: string): Promise<T> {
  return new Promise((_, rejeitar) => setTimeout(() => rejeitar(new Error(mensagem)), ATRASO))
}

function novoId(prefixo: string): string {
  return `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function criarUsuario(nome: string, email: string): Usuario {
  return {
    id: novoId('u'),
    nome,
    email,
    papel: email.toLowerCase().startsWith('admin') ? 'admin' : 'cliente',
  }
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro inesperado. Tente novamente.'
}

/* ---------- autenticação ---------- */

export function usuarioAtual(): Usuario | null {
  return banco.usuario
}

export function entrar({ email, senha }: Credenciais): Promise<Usuario> {
  if (senha.length < 4) return falha('A senha precisa ter ao menos 4 caracteres.')

  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  const nome = base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Visitante'

  banco.usuario = criarUsuario(nome, email)
  salvar()

  return ok(banco.usuario)
}

export function cadastrar({ nome, email }: NovoUsuario): Promise<Usuario> {
  banco.usuario = criarUsuario(nome, email)
  salvar()

  return ok(banco.usuario)
}

export function sair() {
  banco.usuario = null
  salvar()
}

/* ---------- veículos ---------- */

const ORDENACOES: Record<string, (a: Veiculo, b: Veiculo) => number> = {
  'menor-preco': (a, b) => a.precoDiaria - b.precoDiaria,
  'maior-preco': (a, b) => b.precoDiaria - a.precoDiaria,
  'mais-novos': (a, b) => b.ano - a.ano,
}

export function listarVeiculos(
  filtros: FiltrosVeiculos = {},
  sinal?: AbortSignal,
): Promise<Pagina<Veiculo>> {
  if (sinal?.aborted) return falha('Operação cancelada.')

  const termo = filtros.busca?.trim().toLowerCase() ?? ''

  let itens = banco.veiculos.filter((v) => {
    const nome = `${v.marca} ${v.modelo}`.toLowerCase()

    if (termo && !nome.includes(termo)) return false
    if (filtros.categoria && v.categoria !== filtros.categoria) return false
    if (filtros.disponivel && !v.disponivel) return false

    return true
  })

  const ordenar = filtros.ordenar ? ORDENACOES[filtros.ordenar] : undefined
  if (ordenar) itens = [...itens].sort(ordenar)

  const pagina = filtros.pagina ?? 1
  const porPagina = filtros.porPagina ?? Math.max(itens.length, 1)

  return ok({
    itens: itens.slice((pagina - 1) * porPagina, pagina * porPagina).map((v) => ({ ...v })),
    total: itens.length,
    pagina,
    porPagina,
  })
}

export function cadastrarVeiculo(dados: NovoVeiculo): Promise<Veiculo> {
  if (!banco.usuario) return falha('Entre na sua conta para cadastrar veículos.')
  if (banco.usuario.papel !== 'admin') return falha('Você não tem permissão para esta operação.')

  const placa = dados.placa.toUpperCase()

  if (banco.veiculos.some((v) => v.placa.toUpperCase() === placa))
    return falha('Já existe um veículo com essa placa.')

  const veiculo: Veiculo = { ...dados, placa, id: novoId('v') }

  banco.veiculos = [veiculo, ...banco.veiculos]
  salvar()

  return ok({ ...veiculo })
}

/* ---------- locações ---------- */

export function listarLocacoes(sinal?: AbortSignal): Promise<Locacao[]> {
  if (sinal?.aborted) return falha('Operação cancelada.')
  if (!banco.usuario) return falha('Entre na sua conta para ver suas locações.')

  return ok(banco.locacoes.map((l) => ({ ...l })))
}

export function registrarLocacao(dados: NovaLocacao): Promise<Locacao> {
  if (!banco.usuario) return falha('Entre na sua conta para reservar.')

  const veiculo = banco.veiculos.find((v) => v.id === dados.veiculoId)

  if (!veiculo) return falha('Veículo não encontrado.')
  if (!veiculo.disponivel) return falha('Este veículo já está locado.')

  const diarias = contarDiarias(dados.dataRetirada, dados.dataDevolucao)

  if (diarias < 1) return falha('O período informado é inválido.')

  const locacao: Locacao = {
    id: novoId('l'),
    veiculo: { ...veiculo },
    usuarioId: banco.usuario.id,
    dataRetirada: dados.dataRetirada,
    dataDevolucao: dados.dataDevolucao,
    valorTotal: Number((diarias * veiculo.precoDiaria).toFixed(2)),
    status: 'ativa',
    criadaEm: new Date().toISOString(),
  }

  veiculo.disponivel = false
  banco.locacoes = [locacao, ...banco.locacoes]
  salvar()

  return ok({ ...locacao })
}

export function finalizarLocacao(id: string): Promise<Locacao> {
  const locacao = banco.locacoes.find((l) => l.id === id)

  if (!locacao) return falha('Locação não encontrada.')
  if (locacao.status !== 'ativa') return falha('Esta locação já foi encerrada.')

  locacao.status = 'finalizada'

  const veiculo = banco.veiculos.find((v) => v.id === locacao.veiculo.id)
  if (veiculo) veiculo.disponivel = true

  salvar()

  return ok({ ...locacao })
}
