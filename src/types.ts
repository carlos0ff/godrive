export type Papel = 'admin' | 'cliente'

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: Papel
}

export interface Veiculo {
  id: string
  marca: string
  modelo: string
  ano: number
  categoria: string
  placa: string
  cor?: string
  combustivel?: string
  lugares?: number
  quilometragem?: number
  precoDiaria: number
  disponivel: boolean
  imagemUrl?: string
}

export type StatusLocacao = 'ativa' | 'finalizada' | 'cancelada'

export interface Locacao {
  id: string
  veiculo: Veiculo
  usuarioId?: string
  dataRetirada: string
  dataDevolucao: string
  valorTotal: number
  status: StatusLocacao
  criadaEm?: string
}

export interface Pagina<T> {
  itens: T[]
  total: number
  pagina: number
  porPagina: number
}

export interface Credenciais {
  email: string
  senha: string
}

export interface NovoUsuario extends Credenciais {
  nome: string
}

export interface FiltrosVeiculos {
  busca?: string
  categoria?: string
  disponivel?: boolean
  ordenar?: string
  pagina?: number
  porPagina?: number
}

export interface NovoVeiculo {
  marca: string
  modelo: string
  ano: number
  categoria: string
  placa: string
  cor?: string
  combustivel?: string
  lugares?: number
  quilometragem?: number
  precoDiaria: number
  disponivel: boolean
  imagemUrl?: string
}

export interface NovaLocacao {
  veiculoId: string
  dataRetirada: string
  dataDevolucao: string
}
