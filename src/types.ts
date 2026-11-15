export interface Veiculo {
  id: number
  marca: string
  modelo: string
  ano: number
  categoria: string
  placa: string
  cor?: string | null
  combustivel?: string | null
  lugares?: number
  quilometragem?: number
  precoDiaria: number
  disponivel: boolean
  imagemUrl?: string | null
}

export type NovoVeiculo = Omit<Veiculo, 'id'>

export type Papel = 'ADMIN' | 'CLIENTE'

export interface Usuario {
  id: number
  nome: string
  email: string
  papel: Papel
}

export type StatusLocacao = 'ativa' | 'finalizada' | 'cancelada'

export interface Locacao {
  id: number
  veiculo: Veiculo
  usuario?: Usuario
  dataRetirada: string
  dataDevolucao: string
  devolvidoEm?: string | null
  valorDiaria: number
  valorTotal: number
  status: StatusLocacao
}
