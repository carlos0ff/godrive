import { Router, type Request } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { dataISO, formatarLocacao } from '../formatar.js'
import { autenticar } from '../middlewares/autenticacao.js'

const data = (rotulo: string) =>
  z
    .string({ required_error: `Informe a data de ${rotulo}.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `A data de ${rotulo} deve estar no formato AAAA-MM-DD.`)
    .refine((valor) => !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)), `Data de ${rotulo} inválida.`)

const esquemaLocacao = z.object({
  veiculoId: z.coerce.number({ invalid_type_error: 'Escolha um veículo.' }).int().positive('Escolha um veículo.'),
  dataRetirada: data('retirada'),
  dataDevolucao: data('devolução'),
})

const esquemaDevolucao = z.object({
  quilometragem: z.coerce.number().int().min(0, 'A quilometragem não pode ser negativa.').optional(),
})

const esquemaFiltro = z.object({
  status: z.enum(['ativa', 'finalizada', 'cancelada']).optional(),
})

const esquemaId = z.coerce.number().int().positive('Identificador inválido.')

const incluir = { veiculo: true, usuario: true } satisfies Prisma.LocacaoInclude

function hojeLocal(): string {
  const agora = new Date()

  return dataISO(new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000))
}

function contarDiarias(inicio: string, fim: string): number {
  return Math.round((Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86_400_000)
}

async function buscarLocacaoPermitida(req: Request) {
  const id = esquemaId.parse(req.params.id)
  const locacao = await prisma.locacao.findUnique({ where: { id }, include: incluir })
  const usuario = req.usuario!

  if (!locacao || (usuario.papel !== 'ADMIN' && locacao.usuarioId !== usuario.id))
    throw new ErroApp(404, 'Locação não encontrada.')

  return locacao
}

export const rotasLocacoes = Router()

rotasLocacoes.use(autenticar)

rotasLocacoes.get('/', async (req, res) => {
  const filtro = esquemaFiltro.parse(req.query)
  const usuario = req.usuario!
  const where: Prisma.LocacaoWhereInput = {}

  if (usuario.papel !== 'ADMIN') where.usuarioId = usuario.id
  if (filtro.status) where.status = filtro.status.toUpperCase() as Prisma.LocacaoWhereInput['status']

  const locacoes = await prisma.locacao.findMany({ where, include: incluir, orderBy: { criadoEm: 'desc' } })

  res.json(locacoes.map(formatarLocacao))
})

rotasLocacoes.get('/:id', async (req, res) => {
  res.json(formatarLocacao(await buscarLocacaoPermitida(req)))
})

rotasLocacoes.post('/', async (req, res) => {
  const dados = esquemaLocacao.parse(req.body)

  if (dados.dataRetirada < hojeLocal()) throw new ErroApp(400, 'A retirada não pode ser em uma data passada.')

  const diarias = contarDiarias(dados.dataRetirada, dados.dataDevolucao)

  if (diarias < 1) throw new ErroApp(400, 'A devolução precisa ser pelo menos um dia depois da retirada.')

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
        usuarioId: req.usuario!.id,
        veiculoId: veiculo.id,
        dataRetirada: new Date(`${dados.dataRetirada}T00:00:00Z`),
        dataDevolucao: new Date(`${dados.dataDevolucao}T00:00:00Z`),
        valorDiaria: veiculo.precoDiaria,
        valorTotal: veiculo.precoDiaria.mul(diarias),
      },
      include: incluir,
    })
  })

  res.status(201).json(formatarLocacao(locacao))
})

rotasLocacoes.patch('/:id/devolucao', async (req, res) => {
  const dados = esquemaDevolucao.parse(req.body ?? {})
  const locacao = await buscarLocacaoPermitida(req)

  if (locacao.status !== 'ATIVA') throw new ErroApp(409, 'Esta locação já foi encerrada.')

  if (dados.quilometragem !== undefined && dados.quilometragem < locacao.veiculo.quilometragem)
    throw new ErroApp(400, 'A quilometragem de devolução não pode ser menor que a atual do veículo.')

  const atualizada = await prisma.$transaction(async (tx) => {
    await tx.veiculo.update({
      where: { id: locacao.veiculoId },
      data: { disponivel: true, quilometragem: dados.quilometragem ?? undefined },
    })

    return tx.locacao.update({
      where: { id: locacao.id },
      data: { status: 'FINALIZADA', devolvidoEm: new Date() },
      include: incluir,
    })
  })

  res.json(formatarLocacao(atualizada))
})

rotasLocacoes.patch('/:id/cancelamento', async (req, res) => {
  const locacao = await buscarLocacaoPermitida(req)

  if (locacao.status !== 'ATIVA') throw new ErroApp(409, 'Esta locação já foi encerrada.')

  const atualizada = await prisma.$transaction(async (tx) => {
    await tx.veiculo.update({ where: { id: locacao.veiculoId }, data: { disponivel: true } })

    return tx.locacao.update({
      where: { id: locacao.id },
      data: { status: 'CANCELADA' },
      include: incluir,
    })
  })

  res.json(formatarLocacao(atualizada))
})
