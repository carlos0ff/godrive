import type { Locacao, Veiculo } from './types'

/* Catálogo fixo exibido pelo frontend. Nada é salvo: o app não tem backend. */
export const VEICULOS: Veiculo[] = [
  { id: 'v1', marca: 'Hyundai', modelo: 'HB20S', ano: 2023, categoria: 'Sedã', placa: 'ABC-1D23', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 45000, precoDiaria: 102.43, disponivel: true, imagemUrl: '/veiculos/HB2C.png' },
  { id: 'v2', marca: 'Fiat', modelo: 'Argo', ano: 2022, categoria: 'Hatch', placa: 'DEF-2E34', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 32000, precoDiaria: 89.9, disponivel: true, imagemUrl: '/veiculos/fiat-argo.png' },
  { id: 'v3', marca: 'Fiat', modelo: 'Pulse', ano: 2024, categoria: 'SUV', placa: 'GHI-3F45', cor: 'Vermelho', combustivel: 'Flex', lugares: 5, quilometragem: 18000, precoDiaria: 149.9, disponivel: true, imagemUrl: '/veiculos/PLSE.png' },
  { id: 'v4', marca: 'Peugeot', modelo: '208', ano: 2023, categoria: 'Hatch', placa: 'JKL-4G56', cor: 'Azul', combustivel: 'Flex', lugares: 5, quilometragem: 27000, precoDiaria: 95.5, disponivel: true, imagemUrl: '/veiculos/PEUA.png' },
  { id: 'v5', marca: 'Jeep', modelo: 'Renegade', ano: 2023, categoria: 'SUV', placa: 'MNO-5H67', cor: 'Prata', combustivel: 'Diesel', lugares: 5, quilometragem: 22000, precoDiaria: 189.9, disponivel: true, imagemUrl: '/veiculos/RENE.png' },
  { id: 'v6', marca: 'Fiat', modelo: 'Toro', ano: 2024, categoria: 'Picape', placa: 'PQR-6I78', cor: 'Grafite', combustivel: 'Diesel', lugares: 5, quilometragem: 34000, precoDiaria: 209.9, disponivel: true, imagemUrl: '/veiculos/TORA.png' },
]

export const LOCACOES: Locacao[] = [
  {
    id: 'l1',
    veiculo: VEICULOS[1],
    dataRetirada: '2026-09-02',
    dataDevolucao: '2026-09-05',
    valorTotal: 269.7,
    status: 'finalizada',
  },
]
