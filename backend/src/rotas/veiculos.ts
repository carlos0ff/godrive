import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { formatarVeiculo } from '../formatar.js'
import { autenticar, exigirAdmin } from '../middlewares/autenticacao.js'

const anoMaximo = new Date().getFullYear() + 1

const textoOpcional = z
  .string()
  .trim()
  .max(30)
  .optional()
  .nullable()
  .transform((valor) => valor || null)

const esquemaVeiculo = z.object({
  marca: z.string({ required_error: 'Informe a marca.' }).trim().min(1, 'Informe a marca.').max(60),
  modelo: z.string({ required_error: 'Informe o modelo.' }).trim().min(1, 'Informe o modelo.').max(60),
  ano: z.coerce.number({ invalid_type_error: 'Informe um ano válido.' }).int('Informe um ano válido.').min(1950, 'Informe um ano válido.').max(anoMaximo, 'Informe um ano válido.'),
  categoria: z.string({ required_error: 'Informe a categoria.' }).trim().min(1, 'Informe a categoria.').max(30),
  placa: z
    .string({ required_error: 'Informe a placa.' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/, 'Informe uma placa válida (ABC-1D23 ou ABC1234).')
    .transform((placa) => (placa.includes('-') ? placa : `${placa.slice(0, 3)}-${placa.slice(3)}`)),
  cor: textoOpcional,
  combustivel: textoOpcional,
  lugares: z.coerce.number().int().min(1).max(9).default(5),
  quilometragem: z.coerce.number().int().min(0, 'A quilometragem não pode ser negativa.').default(0),
  precoDiaria: z.coerce.number({ invalid_type_error: 'Informe o valor da diária.' }).positive('Informe o valor da diária.'),
  disponivel: z.boolean().default(true),
  imagemUrl: z
    .string()
    .trim()
    .refine(
      (valor) => valor === '' || /^(https?:\/\/|\/)\S+$/i.test(valor) || valor.startsWith('data:image/'),
      'Informe uma URL de imagem começando com http:// ou https://.',
    )
    .optional()
    .nullable()
    .transform((valor) => valor || null),
})

const esquemaFiltro = z.object({
  busca: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  disponivel: z.enum(['true', 'false']).optional(),
})

const esquemaId = z.coerce.number().int().positive('Identificador inválido.')

async function buscarVeiculo(id: number) {
  const veiculo = await prisma.veiculo.findUnique({ where: { id } })

  if (!veiculo) throw new ErroApp(404, 'Veículo não encontrado.')

  return veiculo
}

export const rotasVeiculos = Router()

rotasVeiculos.get('/', async (req, res) => {
  const filtro = esquemaFiltro.parse(req.query)
  const where: Prisma.VeiculoWhereInput = {}

  if (filtro.busca) where.OR = [{ marca: { contains: filtro.busca } }, { modelo: { contains: filtro.busca } }]
  if (filtro.categoria) where.categoria = filtro.categoria
  if (filtro.disponivel) where.disponivel = filtro.disponivel === 'true'

  const veiculos = await prisma.veiculo.findMany({ where, orderBy: { id: 'asc' } })

  res.json(veiculos.map(formatarVeiculo))
})

rotasVeiculos.get('/:id', async (req, res) => {
  res.json(formatarVeiculo(await buscarVeiculo(esquemaId.parse(req.params.id))))
})

rotasVeiculos.post('/', autenticar, exigirAdmin, async (req, res) => {
  const dados = esquemaVeiculo.parse(req.body)
  const placaEmUso = await prisma.veiculo.findUnique({ where: { placa: dados.placa } })

  if (placaEmUso) throw new ErroApp(409, `Já existe um veículo com a placa ${dados.placa}.`)

  const veiculo = await prisma.veiculo.create({ data: dados })

  res.status(201).json(formatarVeiculo(veiculo))
})

rotasVeiculos.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = esquemaId.parse(req.params.id)
  const dados = esquemaVeiculo.parse(req.body)

  await buscarVeiculo(id)

  const placaEmUso = await prisma.veiculo.findFirst({ where: { placa: dados.placa, NOT: { id } } })

  if (placaEmUso) throw new ErroApp(409, `Já existe um veículo com a placa ${dados.placa}.`)

  const veiculo = await prisma.veiculo.update({ where: { id }, data: dados })

  res.json(formatarVeiculo(veiculo))
})

rotasVeiculos.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = esquemaId.parse(req.params.id)

  await buscarVeiculo(id)

  const locacoes = await prisma.locacao.count({ where: { veiculoId: id } })

  if (locacoes > 0) throw new ErroApp(409, 'O veículo tem locações registradas e não pode ser excluído.')

  await prisma.veiculo.delete({ where: { id } })

  res.status(204).end()
})
