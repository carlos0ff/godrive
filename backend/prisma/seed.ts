import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const veiculos = [
  { marca: 'Hyundai', modelo: 'HB20S', ano: 2023, categoria: 'Sedã', placa: 'ABC-1D23', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 45000, valorDiaria: 102.43, imagemUrl: '/veiculos/HB2C.png' },
  { marca: 'Fiat', modelo: 'Argo', ano: 2022, categoria: 'Hatch', placa: 'DEF-2E34', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 32000, valorDiaria: 89.9, imagemUrl: '/veiculos/fiat-argo.png' },
  { marca: 'Fiat', modelo: 'Pulse', ano: 2024, categoria: 'SUV', placa: 'GHI-3F45', cor: 'Vermelho', combustivel: 'Flex', lugares: 5, quilometragem: 18000, valorDiaria: 149.9, imagemUrl: '/veiculos/PLSE.png' },
  { marca: 'Peugeot', modelo: '208', ano: 2023, categoria: 'Hatch', placa: 'JKL-4G56', cor: 'Azul', combustivel: 'Flex', lugares: 5, quilometragem: 27000, valorDiaria: 95.5, imagemUrl: '/veiculos/PEUA.png' },
  { marca: 'Jeep', modelo: 'Renegade', ano: 2023, categoria: 'SUV', placa: 'MNO-5H67', cor: 'Prata', combustivel: 'Diesel', lugares: 5, quilometragem: 22000, valorDiaria: 189.9, imagemUrl: '/veiculos/RENE.png' },
  { marca: 'Fiat', modelo: 'Toro', ano: 2024, categoria: 'Picape', placa: 'PQR-6I78', cor: 'Grafite', combustivel: 'Diesel', lugares: 5, quilometragem: 34000, valorDiaria: 209.9, imagemUrl: '/veiculos/TORA.png' },
  { marca: 'Volkswagen', modelo: 'Polo', ano: 2024, categoria: 'Hatch', placa: 'STU-7J89', cor: 'Branco', combustivel: 'Flex', lugares: 5, quilometragem: 12000, valorDiaria: 99.9 },
  { marca: 'Toyota', modelo: 'Corolla', ano: 2023, categoria: 'Sedã', placa: 'VWX-8K90', cor: 'Preto', combustivel: 'Híbrido', lugares: 5, quilometragem: 26000, valorDiaria: 179.9 },
  { marca: 'Honda', modelo: 'HR-V', ano: 2024, categoria: 'SUV', placa: 'YZA-9L01', cor: 'Cinza', combustivel: 'Flex', lugares: 5, quilometragem: 15000, valorDiaria: 169.9 },
  { marca: 'Chevrolet', modelo: 'Spin', ano: 2023, categoria: 'Minivan', placa: 'BCD-0M12', cor: 'Prata', combustivel: 'Flex', lugares: 7, quilometragem: 41000, valorDiaria: 139.9 },
]

const usuarios = [
  { nome: 'Administrador GoDrive', email: 'admin@godrive.com', senha: 'admin123', papel: 'ADMIN' as const },
  { nome: 'Cliente Demonstração', email: 'cliente@godrive.com', senha: 'cliente123', papel: 'CLIENTE' as const },
  { nome: 'Maria Oliveira', email: 'maria@godrive.com', senha: 'maria123', papel: 'CLIENTE' as const },
]

const MS_POR_DIA = 24 * 60 * 60 * 1000

function diasAtras(dias: number, hora: number): Date {
  const data = new Date(Date.now() - dias * MS_POR_DIA)

  data.setHours(hora, 0, 0, 0)

  return data
}

async function criarLocacoesDeExemplo() {
  const cliente = await prisma.usuario.findUniqueOrThrow({ where: { email: 'cliente@godrive.com' } })

  if ((await prisma.locacao.count({ where: { usuarioId: cliente.id } })) > 0) return

  const argo = await prisma.veiculo.findUniqueOrThrow({ where: { placa: 'DEF-2E34' } })
  const pulse = await prisma.veiculo.findUniqueOrThrow({ where: { placa: 'GHI-3F45' } })

  await prisma.$transaction([
    prisma.locacao.create({
      data: {
        usuarioId: cliente.id,
        veiculoId: argo.id,
        dataInicio: diasAtras(10, 9),
        dataPrevistaDevolucao: diasAtras(7, 9),
        dataDevolucao: diasAtras(7, 8),
        valorDiaria: argo.valorDiaria,
        valorTotal: argo.valorDiaria.mul(3),
        status: 'FINALIZADA',
      },
    }),
    prisma.locacao.create({
      data: {
        usuarioId: cliente.id,
        veiculoId: pulse.id,
        dataInicio: diasAtras(1, 10),
        dataPrevistaDevolucao: diasAtras(-2, 10),
        valorDiaria: pulse.valorDiaria,
        valorTotal: pulse.valorDiaria.mul(3),
        status: 'ATIVA',
      },
    }),
    prisma.veiculo.update({ where: { id: pulse.id }, data: { disponivel: false } }),
  ])
}

async function main() {
  for (const { senha, ...usuario } of usuarios) {
    const senhaHash = await bcrypt.hash(senha, 10)

    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: { papel: usuario.papel },
      create: { ...usuario, senhaHash },
    })
  }

  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({ where: { placa: veiculo.placa }, update: {}, create: veiculo })
  }

  await criarLocacoesDeExemplo()

  console.log(`Seed concluído: ${usuarios.length} usuários, ${veiculos.length} veículos e locações de exemplo.`)
}

main()
  .catch((erro) => {
    console.error(erro)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
