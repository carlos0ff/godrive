import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { dataISO, formatarLocacao } from '../formatar.js'

const data = (rotulo: string) =>
  z
    .string({ required_error: `Informe a data de ${rotulo}.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `A data de ${rotulo} deve estar no formato AAAA-MM-DD.`)
    .refine((valor) => !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)), `Data de ${rotulo} inválida.`)

const esquemaRegistro = z.object({
  veiculoId: z.coerce.number({ invalid_type_error: 'Escolha um veículo.' }).int().positive('Escolha um veículo.'),
  dataRetirada: data('retirada'),
  dataDevolucao: data('devolução'),
})

const esquemaFinalizacao = z.object({
  quilometragem: z.coerce.number().int().min(0, 'A quilometragem não pode ser negativa.').optional(),
})

const esquemaFiltro = z.object({
  status: z.enum(['ativa', 'finalizada']).optional(),
})

const esquemaId = z.coerce.number().int().positive('Identificador inválido.')

const incluirVeiculo = { veiculo: true } satisfies Prisma.LocacaoInclude

function hojeLocal(): string {
  const agora = new Date()

  return dataISO(new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000))
}

function contarDiarias(inicio: string, fim: string): number {
  const horas = (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 3_600_000

  return Math.ceil(horas / 24)
}

async function buscarDoUsuario(usuarioId: number, idInformado: unknown) {
  const id = esquemaId.parse(idInformado)
  const locacao = await prisma.locacao.findFirst({ where: { id, usuarioId }, include: incluirVeiculo })

  if (!locacao) throw new ErroApp(404, 'Locação não encontrada.')

  return locacao
}

export const locacaoService = {
  async listar(usuarioId: number, consulta: unknown) {
    const filtro = esquemaFiltro.parse(consulta)

    const locacoes = await prisma.locacao.findMany({
      where: {
        usuarioId,
        status: filtro.status ? (filtro.status.toUpperCase() as 'ATIVA' | 'FINALIZADA') : undefined,
      },
      include: incluirVeiculo,
      orderBy: { criadoEm: 'desc' },
    })

    return locacoes.map(formatarLocacao)
  },

  async buscar(usuarioId: number, id: unknown) {
    return formatarLocacao(await buscarDoUsuario(usuarioId, id))
  },

  async registrar(usuarioId: number, entrada: unknown) {
    const dados = esquemaRegistro.parse(entrada)

    if (dados.dataRetirada < hojeLocal()) throw new ErroApp(400, 'A retirada não pode ser em uma data passada.')

    const diarias = contarDiarias(dados.dataRetirada, dados.dataDevolucao)

    if (diarias < 1) throw new ErroApp(400, 'A devolução precisa ser depois da data de retirada.')

    const locacao = await prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.findUnique({ where: { id: dados.veiculoId } })

      if (!veiculo) throw new ErroApp(404, 'Veículo não encontrado.')

      const reservado = await tx.veiculo.updateMany({
        where: { id: veiculo.id, disponivel: true },
        data: { disponivel: false },
      })

      if (reservado.count === 0) throw new ErroApp(409, 'Este veículo não está disponível para locação.')

      return tx.locacao.create({
        data: {
          usuarioId,
          veiculoId: veiculo.id,
          dataRetirada: new Date(`${dados.dataRetirada}T00:00:00Z`),
          dataDevolucao: new Date(`${dados.dataDevolucao}T00:00:00Z`),
          valorDiaria: veiculo.precoDiaria,
          valorTotal: veiculo.precoDiaria.mul(diarias),
        },
        include: incluirVeiculo,
      })
    })

    return formatarLocacao(locacao)
  },

  async finalizar(usuarioId: number, id: unknown, entrada: unknown) {
    const dados = esquemaFinalizacao.parse(entrada ?? {})
    const locacao = await buscarDoUsuario(usuarioId, id)

    if (locacao.status !== 'ATIVA') throw new ErroApp(409, 'Esta locação já foi finalizada.')

    if (dados.quilometragem !== undefined && dados.quilometragem < locacao.veiculo.quilometragem)
      throw new ErroApp(400, 'A quilometragem de devolução não pode ser menor que a atual do veículo.')

    const finalizada = await prisma.$transaction(async (tx) => {
      const encerrada = await tx.locacao.updateMany({
        where: { id: locacao.id, status: 'ATIVA' },
        data: { status: 'FINALIZADA', devolvidoEm: new Date() },
      })

      if (encerrada.count === 0) throw new ErroApp(409, 'Esta locação já foi finalizada.')

      await tx.veiculo.update({
        where: { id: locacao.veiculoId },
        data: { disponivel: true, quilometragem: dados.quilometragem },
      })

      return tx.locacao.findUniqueOrThrow({ where: { id: locacao.id }, include: incluirVeiculo })
    })

    return formatarLocacao(finalizada)
  },
}
