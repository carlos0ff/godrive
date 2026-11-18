import type { Locacao, Usuario, Veiculo } from '@prisma/client'

export function dataISO(data: Date): string {
  return data.toISOString().slice(0, 10)
}

export function formatarUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  }
}

export function formatarVeiculo(veiculo: Veiculo) {
  return {
    id: veiculo.id,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano,
    categoria: veiculo.categoria,
    placa: veiculo.placa,
    cor: veiculo.cor,
    combustivel: veiculo.combustivel,
    lugares: veiculo.lugares,
    quilometragem: veiculo.quilometragem,
    precoDiaria: Number(veiculo.precoDiaria),
    disponivel: veiculo.disponivel,
    imagemUrl: veiculo.imagemUrl,
  }
}

export function formatarLocacao(locacao: Locacao & { veiculo: Veiculo; usuario?: Usuario }) {
  return {
    id: locacao.id,
    veiculo: formatarVeiculo(locacao.veiculo),
    usuario: locacao.usuario ? formatarUsuario(locacao.usuario) : undefined,
    dataRetirada: dataISO(locacao.dataRetirada),
    dataDevolucao: dataISO(locacao.dataDevolucao),
    devolvidoEm: locacao.devolvidoEm,
    valorDiaria: Number(locacao.valorDiaria),
    valorTotal: Number(locacao.valorTotal),
    status: locacao.status.toLowerCase(),
    criadoEm: locacao.criadoEm,
  }
}
