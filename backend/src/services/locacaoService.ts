import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { formatarLocacao } from '../formatar.js'

const MS_POR_DIA = 24 * 60 * 60 * 1000
const TOLERANCIA_INICIO_MS = 5 * 60 * 1000

const dataHora = (rotulo: string) =>
  z
    .string({ required_error: `Informe a ${rotulo}.`, invalid_type_error: `Informe a ${rotulo}.` })
    .trim()
    .min(1, `Informe a ${rotulo}.`)
    .transform((valor, contexto) => {
      const data = new Date(valor)

      if (Number.isNaN(data.getTime())) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, message: `A ${rotulo} é inválida. Use o formato ISO 8601.` })
        return z.NEVER
      }

      return data
    })

const esquemaRegistro = z.object({
  veiculoId: z.coerce
    .number({ required_error: 'Escolha um veículo.', invalid_type_error: 'Escolha um veículo.' })
    .int('Escolha um veículo.')
    .positive('Escolha um veículo.'),
  dataInicio: dataHora('data de início'),
  dataPrevistaDevolucao: dataHora('data prevista de devolução'),
})

const esquemaFiltro = z.object({
  status: z.enum(['ATIVA', 'FINALIZADA'], { errorMap: () => ({ message: 'Status deve ser ATIVA ou FINALIZADA.' }) }).optional(),
})

const esquemaId = z.coerce
  .number({ invalid_type_error: 'Identificador inválido.' })
  .int('Identificador inválido.')
  .positive('Identificador inválido.')

const incluirVeiculo = { veiculo: true } satisfies Prisma.LocacaoInclude

export function calcularDiarias(inicio: Date, fim: Date): number {
  return Math.ceil((fim.getTime() - inicio.getTime()) / MS_POR_DIA)
}

export const locacaoService = {
  async listar(usuarioId: number, consulta: unknown) {
    const filtro = esquemaFiltro.parse(consulta)

    const locacoes = await prisma.locacao.findMany({
      where: { usuarioId, status: filtro.status },
      include: incluirVeiculo,
      orderBy: { criadoEm: 'desc' },
    })

    return locacoes.map(formatarLocacao)
  },

  async registrar(usuarioId: number, entrada: unknown) {
    const dados = esquemaRegistro.parse(entrada)

    if (dados.dataInicio.getTime() < Date.now() - TOLERANCIA_INICIO_MS)
      throw new ErroApp(400, 'A data de início não pode estar no passado.')

    if (dados.dataPrevistaDevolucao <= dados.dataInicio)
      throw new ErroApp(400, 'A data prevista de devolução deve ser posterior à data de início.')

    const diarias = calcularDiarias(dados.dataInicio, dados.dataPrevistaDevolucao)

    const locacao = await prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.findUnique({ where: { id: dados.veiculoId } })

      if (!veiculo) throw new ErroApp(404, 'Veículo não encontrado.')

      const reservado = await tx.veiculo.updateMany({
        where: { id: veiculo.id, disponivel: true },
        data: { disponivel: false },
      })

      if (reservado.count === 0) throw new ErroApp(409, 'Este veículo não está disponível para locação.')

      const ativas = await tx.locacao.count({ where: { veiculoId: veiculo.id, status: 'ATIVA' } })

      if (ativas > 0) throw new ErroApp(409, 'Este veículo já possui uma locação ativa.')

      return tx.locacao.create({
        data: {
          usuarioId,
          veiculoId: veiculo.id,
          dataInicio: dados.dataInicio,
          dataPrevistaDevolucao: dados.dataPrevistaDevolucao,
          valorDiaria: veiculo.valorDiaria,
          valorTotal: veiculo.valorDiaria.mul(diarias),
        },
        include: incluirVeiculo,
      })
    })

    return formatarLocacao(locacao)
  },

  async finalizar(usuarioId: number, idInformado: unknown) {
    const id = esquemaId.parse(idInformado)

    const locacao = await prisma.$transaction(async (tx) => {
      const existente = await tx.locacao.findFirst({ where: { id, usuarioId } })

      if (!existente) throw new ErroApp(404, 'Locação não encontrada.')

      const encerrada = await tx.locacao.updateMany({
        where: { id: existente.id, status: 'ATIVA' },
        data: { status: 'FINALIZADA', dataDevolucao: new Date() },
      })

      if (encerrada.count === 0) throw new ErroApp(409, 'Esta locação já foi finalizada.')

      await tx.veiculo.update({ where: { id: existente.veiculoId }, data: { disponivel: true } })

      return tx.locacao.findUniqueOrThrow({ where: { id: existente.id }, include: incluirVeiculo })
    })

    return formatarLocacao(locacao)
  },
}
