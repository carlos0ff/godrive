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
  dataRetirada: string
  dataDevolucao: string
  valorTotal: number
  status: StatusLocacao
}
