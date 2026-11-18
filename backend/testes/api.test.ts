import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { app } from '../src/app.js'
import { prisma } from '../src/prisma.js'

if (!/test/i.test(new URL(process.env.DATABASE_URL ?? '').pathname))
  throw new Error('Os testes só rodam em um banco de teste.')

function dataDaqui(dias: number): string {
  const agora = new Date()
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)

  local.setUTCDate(local.getUTCDate() + dias)

  return local.toISOString().slice(0, 10)
}

async function criarUsuario(email: string, senha = 'segredo1') {
  return prisma.usuario.create({
    data: { nome: 'Usuário Teste', email, senhaHash: await bcrypt.hash(senha, 4), emailConfirmado: true },
  })
}

async function entrar(email: string, senha = 'segredo1'): Promise<string> {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha })

  return resposta.body.token
}

async function criarVeiculo(placa = 'TST-1A23', precoDiaria = 100) {
  return prisma.veiculo.create({
    data: { marca: 'Fiat', modelo: 'Argo', ano: 2024, categoria: 'Hatch', placa, precoDiaria },
  })
}

beforeEach(async () => {
  await prisma.locacao.deleteMany()
  await prisma.codigoVerificacao.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.veiculo.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Autenticação', () => {
  it('cadastra, confirma o e-mail e faz login sem expor o hash', async () => {
    const cadastro = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Ana Souza', email: 'ana@teste.com', senha: 'segredo1' })

    expect(cadastro.status).toBe(201)
    expect(cadastro.body.usuario).not.toHaveProperty('senhaHash')

    const semConfirmar = await request(app).post('/api/auth/login').send({ email: 'ana@teste.com', senha: 'segredo1' })

    expect(semConfirmar.status).toBe(403)

    const registro = await prisma.codigoVerificacao.findFirstOrThrow({ where: { usadoEm: null } })
    const confirmacao = await request(app)
      .post('/api/auth/confirmar-email')
      .send({ email: 'ana@teste.com', codigo: registro.codigo })

    expect(confirmacao.status).toBe(200)

    const login = await request(app).post('/api/auth/login').send({ email: 'ana@teste.com', senha: 'segredo1' })

    expect(login.status).toBe(200)
    expect(login.body.token).toEqual(expect.any(String))
    expect(Object.keys(login.body.usuario).sort()).toEqual(['email', 'id', 'nome', 'papel'])

    const salvo = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@teste.com' } })

    expect(salvo.senhaHash).not.toBe('segredo1')
    expect(await bcrypt.compare('segredo1', salvo.senhaHash)).toBe(true)
  })

  it('recusa senha errada com 401 e e-mail duplicado com 409', async () => {
    await criarUsuario('bia@teste.com')

    const login = await request(app).post('/api/auth/login').send({ email: 'bia@teste.com', senha: 'errada' })
    const duplicado = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Outra Bia', email: 'bia@teste.com', senha: 'segredo1' })

    expect(login.status).toBe(401)
    expect(duplicado.status).toBe(409)
  })

  it('recusa rotas protegidas sem token ou com token inválido', async () => {
    expect((await request(app).get('/api/veiculos')).status).toBe(401)
    expect((await request(app).get('/api/locacoes')).status).toBe(401)
    expect((await request(app).get('/api/locacoes').set('Authorization', 'Bearer invalido')).status).toBe(401)
  })
})

describe('Veículos', () => {
  it('cadastra veículo e valida placa única e diária positiva', async () => {
    await criarUsuario('carlos@teste.com')
    const token = await entrar('carlos@teste.com')
    const veiculo = { marca: 'Toyota', modelo: 'Corolla', ano: 2024, categoria: 'Sedã', placa: 'abc1d23', precoDiaria: 199.9 }

    const criado = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${token}`).send(veiculo)

    expect(criado.status).toBe(201)
    expect(criado.body).toMatchObject({ placa: 'ABC-1D23', disponivel: true, precoDiaria: 199.9 })

    const repetido = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${token}`).send(veiculo)
    const diariaNegativa = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...veiculo, placa: 'XYZ1A23', precoDiaria: -10 })

    expect(repetido.status).toBe(409)
    expect(diariaNegativa.status).toBe(400)
  })

  it('lista apenas os disponíveis com ?disponivel=true', async () => {
    await criarUsuario('davi@teste.com')
    const token = await entrar('davi@teste.com')

    await criarVeiculo('AAA-1A11')
    await prisma.veiculo.update({ where: { id: (await criarVeiculo('BBB-2B22')).id }, data: { disponivel: false } })

    const todos = await request(app).get('/api/veiculos').set('Authorization', `Bearer ${token}`)
    const disponiveis = await request(app).get('/api/veiculos?disponivel=true').set('Authorization', `Bearer ${token}`)

    expect(todos.body).toHaveLength(2)
    expect(disponiveis.body).toHaveLength(1)
    expect(disponiveis.body[0].placa).toBe('AAA-1A11')
  })
})

describe('Locações', () => {
  it('registra locação, calcula o valor e deixa o veículo indisponível', async () => {
    await criarUsuario('eva@teste.com')
    const token = await entrar('eva@teste.com')
    const veiculo = await criarVeiculo('CCC-3C33', 89.9)

    const resposta = await request(app)
      .post('/api/locacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(3) })

    expect(resposta.status).toBe(201)
    expect(resposta.body).toMatchObject({ status: 'ativa', valorTotal: 269.7 })
    expect(resposta.body.veiculo.id).toBe(veiculo.id)
    expect((await prisma.veiculo.findUniqueOrThrow({ where: { id: veiculo.id } })).disponivel).toBe(false)
  })

  it('valida datas, veículo inexistente e veículo indisponível', async () => {
    await criarUsuario('fabio@teste.com')
    const token = await entrar('fabio@teste.com')
    const veiculo = await criarVeiculo('DDD-4D44')
    const enviar = (corpo: object) =>
      request(app).post('/api/locacoes').set('Authorization', `Bearer ${token}`).send(corpo)

    expect((await enviar({ veiculoId: veiculo.id, dataRetirada: dataDaqui(3), dataDevolucao: dataDaqui(1) })).status).toBe(400)
    expect((await enviar({ veiculoId: veiculo.id, dataRetirada: dataDaqui(2), dataDevolucao: dataDaqui(2) })).status).toBe(400)
    expect((await enviar({ veiculoId: 999999, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(1) })).status).toBe(404)
    expect((await enviar({ veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(1) })).status).toBe(201)
    expect((await enviar({ veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(1) })).status).toBe(409)
  })

  it('aceita só uma de várias locações simultâneas do mesmo veículo', async () => {
    await criarUsuario('gil@teste.com')
    const token = await entrar('gil@teste.com')
    const veiculo = await criarVeiculo('EEE-5E55')
    const corpo = { veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(2) }

    const respostas = await Promise.all(
      Array.from({ length: 5 }, () => request(app).post('/api/locacoes').set('Authorization', `Bearer ${token}`).send(corpo)),
    )
    const codigos = respostas.map((resposta) => resposta.status).sort()

    expect(codigos).toEqual([201, 409, 409, 409, 409])
    expect(await prisma.locacao.count({ where: { veiculoId: veiculo.id } })).toBe(1)
  })

  it('não deixa um usuário ver ou finalizar a locação de outro', async () => {
    await criarUsuario('dono@teste.com')
    await criarUsuario('outro@teste.com')
    const tokenDono = await entrar('dono@teste.com')
    const tokenOutro = await entrar('outro@teste.com')
    const veiculo = await criarVeiculo('FFF-6F66')

    const criada = await request(app)
      .post('/api/locacoes')
      .set('Authorization', `Bearer ${tokenDono}`)
      .send({ veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(1) })

    const lista = await request(app).get('/api/locacoes').set('Authorization', `Bearer ${tokenOutro}`)
    const detalhe = await request(app).get(`/api/locacoes/${criada.body.id}`).set('Authorization', `Bearer ${tokenOutro}`)
    const finalizar = await request(app)
      .patch(`/api/locacoes/${criada.body.id}/devolucao`)
      .set('Authorization', `Bearer ${tokenOutro}`)

    expect(lista.body).toHaveLength(0)
    expect(detalhe.status).toBe(404)
    expect(finalizar.status).toBe(404)
  })

  it('finaliza a locação, libera o veículo e impede finalizar de novo', async () => {
    await criarUsuario('hugo@teste.com')
    const token = await entrar('hugo@teste.com')
    const veiculo = await criarVeiculo('GGG-7G77')

    const criada = await request(app)
      .post('/api/locacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ veiculoId: veiculo.id, dataRetirada: dataDaqui(0), dataDevolucao: dataDaqui(2) })

    const finalizada = await request(app)
      .patch(`/api/locacoes/${criada.body.id}/devolucao`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quilometragem: 100 })

    expect(finalizada.status).toBe(200)
    expect(finalizada.body.status).toBe('finalizada')
    expect(finalizada.body.devolvidoEm).not.toBeNull()
    expect(await prisma.veiculo.findUniqueOrThrow({ where: { id: veiculo.id } })).toMatchObject({
      disponivel: true,
      quilometragem: 100,
    })

    const repetida = await request(app)
      .patch(`/api/locacoes/${criada.body.id}/devolucao`)
      .set('Authorization', `Bearer ${token}`)

    expect(repetida.status).toBe(409)

    const historico = await request(app).get('/api/locacoes').set('Authorization', `Bearer ${token}`)

    expect(historico.body.map((locacao: { status: string }) => locacao.status)).toEqual(['finalizada'])
  })
})
