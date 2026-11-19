import { encerrarSessao, obterToken, type Sessao } from './sessao'
import type { Locacao, NovoVeiculo, Veiculo } from './types'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ErroApi extends Error {
  status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

async function requisitar<T>(caminho: string, opcoes: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {}
  const token = obterToken()

  if (opcoes.corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (token) cabecalhos.Authorization = `Bearer ${token}`

  let resposta: Response

  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: cabecalhos,
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    })
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar à API. Verifique se o backend está rodando.')
  }

  if (resposta.status === 204) return undefined as T

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    if (resposta.status === 401 && token) encerrarSessao()

    throw new ErroApi(resposta.status, dados?.erro ?? `Erro ${resposta.status} na requisição.`)
  }

  return dados as T
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.'
}

export const api = {
  login: (email: string, senha: string) =>
    requisitar<Sessao>('/auth/login', { metodo: 'POST', corpo: { email, senha } }),

  cadastrar: (nome: string, email: string, senha: string) =>
    requisitar<{ mensagem: string }>('/auth/register', { metodo: 'POST', corpo: { nome, email, senha } }),

  listarVeiculos: () => requisitar<Veiculo[]>('/veiculos'),

  listarVeiculosDisponiveis: () => requisitar<Veiculo[]>('/veiculos/disponiveis'),

  cadastrarVeiculo: (veiculo: NovoVeiculo) =>
    requisitar<Veiculo>('/veiculos', { metodo: 'POST', corpo: veiculo }),

  listarLocacoes: () => requisitar<Locacao[]>('/locacoes'),

  criarLocacao: (veiculoId: number, dataInicio: string, dataPrevistaDevolucao: string) =>
    requisitar<Locacao>('/locacoes', { metodo: 'POST', corpo: { veiculoId, dataInicio, dataPrevistaDevolucao } }),

  finalizarLocacao: (id: number) => requisitar<Locacao>(`/locacoes/${id}/finalizar`, { metodo: 'PATCH' }),
}
