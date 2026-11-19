export interface Veiculo {
  id: number
  marca: string
  modelo: string
  placa: string
  ano: number
  valorDiaria: number
  disponivel: boolean
  categoria: string
  cor?: string | null
  combustivel?: string | null
  lugares?: number
  quilometragem?: number
  imagemUrl?: string | null
}

export type NovoVeiculo = Omit<Veiculo, 'id'>

export interface Usuario {
  id: number
  nome: string
  email: string
  criadoEm: string
}

export type StatusLocacao = 'ATIVA' | 'FINALIZADA'

export interface Locacao {
  id: number
  veiculo: Veiculo
  dataInicio: string
  dataPrevistaDevolucao: string
  dataDevolucao: string | null
  valorDiaria: number
  valorTotal: number
  status: StatusLocacao
  criadoEm: string
}
