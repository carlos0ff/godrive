import type { Locacao, Usuario, Veiculo } from '@prisma/client'

export function formatarUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm,
  }
}

export function formatarVeiculo(veiculo: Veiculo) {
  return {
    id: veiculo.id,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    placa: veiculo.placa,
    ano: veiculo.ano,
    valorDiaria: Number(veiculo.valorDiaria),
    disponivel: veiculo.disponivel,
    categoria: veiculo.categoria,
    cor: veiculo.cor,
    combustivel: veiculo.combustivel,
    lugares: veiculo.lugares,
    quilometragem: veiculo.quilometragem,
    imagemUrl: veiculo.imagemUrl,
  }
}

export function formatarLocacao(locacao: Locacao & { veiculo: Veiculo }) {
  return {
    id: locacao.id,
    veiculo: formatarVeiculo(locacao.veiculo),
    dataInicio: locacao.dataInicio,
    dataPrevistaDevolucao: locacao.dataPrevistaDevolucao,
    dataDevolucao: locacao.dataDevolucao,
    valorDiaria: Number(locacao.valorDiaria),
    valorTotal: Number(locacao.valorTotal),
    status: locacao.status,
    criadoEm: locacao.criadoEm,
  }
}
