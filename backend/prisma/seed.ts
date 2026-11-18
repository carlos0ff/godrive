import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const veiculos = [
  { marca: 'Hyundai', modelo: 'HB20S', ano: 2023, categoria: 'Sedã', placa: 'ABC-1D23', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 45000, precoDiaria: 102.43, imagemUrl: '/veiculos/HB2C.png' },
  { marca: 'Fiat', modelo: 'Argo', ano: 2022, categoria: 'Hatch', placa: 'DEF-2E34', cor: 'Prata', combustivel: 'Flex', lugares: 5, quilometragem: 32000, precoDiaria: 89.9, imagemUrl: '/veiculos/fiat-argo.png' },
  { marca: 'Fiat', modelo: 'Pulse', ano: 2024, categoria: 'SUV', placa: 'GHI-3F45', cor: 'Vermelho', combustivel: 'Flex', lugares: 5, quilometragem: 18000, precoDiaria: 149.9, imagemUrl: '/veiculos/PLSE.png' },
  { marca: 'Peugeot', modelo: '208', ano: 2023, categoria: 'Hatch', placa: 'JKL-4G56', cor: 'Azul', combustivel: 'Flex', lugares: 5, quilometragem: 27000, precoDiaria: 95.5, imagemUrl: '/veiculos/PEUA.png' },
  { marca: 'Jeep', modelo: 'Renegade', ano: 2023, categoria: 'SUV', placa: 'MNO-5H67', cor: 'Prata', combustivel: 'Diesel', lugares: 5, quilometragem: 22000, precoDiaria: 189.9, imagemUrl: '/veiculos/RENE.png' },
  { marca: 'Fiat', modelo: 'Toro', ano: 2024, categoria: 'Picape', placa: 'PQR-6I78', cor: 'Grafite', combustivel: 'Diesel', lugares: 5, quilometragem: 34000, precoDiaria: 209.9, imagemUrl: '/veiculos/TORA.png' },
  { marca: 'Volkswagen', modelo: 'Polo', ano: 2024, categoria: 'Hatch', placa: 'STU-7J89', cor: 'Branco', combustivel: 'Flex', lugares: 5, quilometragem: 12000, precoDiaria: 99.9 },
  { marca: 'Toyota', modelo: 'Corolla', ano: 2023, categoria: 'Sedã', placa: 'VWX-8K90', cor: 'Preto', combustivel: 'Híbrido', lugares: 5, quilometragem: 26000, precoDiaria: 179.9 },
  { marca: 'Honda', modelo: 'HR-V', ano: 2024, categoria: 'SUV', placa: 'YZA-9L01', cor: 'Cinza', combustivel: 'Flex', lugares: 5, quilometragem: 15000, precoDiaria: 169.9 },
  { marca: 'Chevrolet', modelo: 'Spin', ano: 2023, categoria: 'Minivan', placa: 'BCD-0M12', cor: 'Prata', combustivel: 'Flex', lugares: 7, quilometragem: 41000, precoDiaria: 139.9 },
]

const usuarios = [
  { nome: 'Administrador goDrive', email: 'admin@godrive.com', senha: 'admin123', papel: 'ADMIN' as const },
  { nome: 'Cliente Demonstração', email: 'cliente@godrive.com', senha: 'cliente123', papel: 'CLIENTE' as const },
]

async function main() {
  for (const { senha, ...usuario } of usuarios) {
    const senhaHash = await bcrypt.hash(senha, 10)

    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: { ...usuario, senhaHash, emailConfirmado: true },
    })
  }

  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({ where: { placa: veiculo.placa }, update: {}, create: veiculo })
  }

  console.log(`Seed concluído: ${usuarios.length} usuários e ${veiculos.length} veículos.`)
}

main()
  .catch((erro) => {
    console.error(erro)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
