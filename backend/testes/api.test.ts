import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { app } from '../src/app.js'
import { prisma } from '../src/prisma.js'
import { calcularDiarias } from '../src/services/locacaoService.js'

if (!/test/i.test(new URL(process.env.DATABASE_URL ?? '').pathname))
  throw new Error('Os testes só rodam em um banco de teste.')

const HORA = 60 * 60 * 1000
const DIA = 24 * HORA

function daqui(ms: number): string {
  return new Date(Date.now() + ms).toISOString()
}

async function criarUsuario(email: string, senha = 'segredo1', papel: 'ADMIN' | 'CLIENTE' = 'CLIENTE') {
  return prisma.usuario.create({
    data: { nome: 'Usuário Teste', email, senhaHash: await bcrypt.hash(senha, 4), papel },
  })
}

async function entrar(email: string, senha = 'segredo1'): Promise<string> {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha })

  return resposta.body.token
}

async function usuarioComToken(email: string, papel: 'ADMIN' | 'CLIENTE' = 'CLIENTE') {
  const usuario = await criarUsuario(email, 'segredo1', papel)

  return { usuario, token: await entrar(email) }
}

async function criarVeiculo(placa = 'TST-1A23', valorDiaria = 100, disponivel = true) {
  return prisma.veiculo.create({
    data: { marca: 'Fiat', modelo: 'Argo', ano: 2024, categoria: 'Hatch', placa, valorDiaria, disponivel },
  })
}

function alugar(token: string, veiculoId: number, inicio = daqui(HORA), fim = daqui(HORA + 3 * DIA)) {
  return request(app)
    .post('/api/locacoes')
    .set('Authorization', `Bearer ${token}`)
    .send({ veiculoId, dataInicio: inicio, dataPrevistaDevolucao: fim })
}

beforeEach(async () => {
  await prisma.locacao.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.veiculo.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Autenticação', () => {
  it('cadastra, faz login e nunca expõe a senha ou o hash', async () => {
    const cadastro = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Ana Souza', email: 'Ana@Teste.com', senha: 'segredo1' })

    expect(cadastro.status).toBe(201)
    expect(cadastro.body.usuario.email).toBe('ana@teste.com')
    expect(cadastro.body.usuario).not.toHaveProperty('senha')
    expect(cadastro.body.usuario).not.toHaveProperty('senhaHash')

    const login = await request(app).post('/api/auth/login').send({ email: 'ana@teste.com', senha: 'segredo1' })

    expect(login.status).toBe(200)
    expect(login.body.token).toEqual(expect.any(String))
    expect(Object.keys(login.body.usuario).sort()).toEqual(['criadoEm', 'email', 'id', 'nome', 'papel'])
    expect(login.body.usuario.papel).toBe('CLIENTE')

    const salvo = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@teste.com' } })

    expect(salvo.senhaHash).not.toBe('segredo1')
    expect(salvo.senhaHash.startsWith('$2b$')).toBe(true)
    expect(await bcrypt.compare('segredo1', salvo.senhaHash)).toBe(true)

    const perfil = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`)

    expect(perfil.status).toBe(200)
    expect(perfil.body.id).toBe(salvo.id)
    expect(perfil.body).not.toHaveProperty('senhaHash')
  })

  it('valida os dados, recusa e-mail duplicado (409) e senha errada (401)', async () => {
    await criarUsuario('bia@teste.com')

    const invalido = await request(app).post('/api/auth/register').send({ nome: 'Bi', email: 'x', senha: '1' })
    const duplicado = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Bia Lima', email: 'BIA@teste.com', senha: 'segredo1' })
    const senhaErrada = await request(app).post('/api/auth/login').send({ email: 'bia@teste.com', senha: 'errada' })
    const inexistente = await request(app).post('/api/auth/login').send({ email: 'nao@teste.com', senha: 'segredo1' })

    expect(invalido.status).toBe(400)
    expect(duplicado.status).toBe(409)
    expect(senhaErrada.status).toBe(401)
    expect(inexistente.status).toBe(401)
    expect(senhaErrada.body.erro).toBe(inexistente.body.erro)
  })

  it('bloqueia rotas protegidas sem token, com token inválido ou mal formatado', async () => {
    const semToken = await request(app).get('/api/veiculos')
    const tokenInvalido = await request(app).get('/api/locacoes').set('Authorization', 'Bearer abc.def.ghi')
    const semBearer = await request(app).post('/api/veiculos').set('Authorization', 'abc').send({})

    expect(semToken.status).toBe(401)
    expect(tokenInvalido.status).toBe(401)
    expect(semBearer.status).toBe(401)
  })
})

describe('Veículos', () => {
  it('cadastra veículo validando placa única e diária positiva', async () => {
    const { token } = await usuarioComToken('carlos@teste.com', 'ADMIN')
    const novo = { marca: 'Toyota', modelo: 'Yaris', ano: 2024, categoria: 'Hatch', placa: 'abc1d23', valorDiaria: 150 }

    const criado = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${token}`).send(novo)
    const repetido = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...novo, placa: 'ABC-1D23' })
    const diariaZero = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...novo, placa: 'XYZ-9Z99', valorDiaria: 0 })
    const semMarca = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...novo, placa: 'XYZ-9Z98', marca: '' })

    expect(criado.status).toBe(201)
    expect(criado.body).toMatchObject({ placa: 'ABC-1D23', valorDiaria: 150, disponivel: true })
    expect(repetido.status).toBe(409)
    expect(diariaZero.status).toBe(400)
    expect(semMarca.status).toBe(400)
  })

  it('só administradores cadastram veículos; o cadastro público sempre cria cliente', async () => {
    const novo = { marca: 'Fiat', modelo: 'Mobi', ano: 2024, categoria: 'Hatch', placa: 'MOB-1A23', valorDiaria: 70 }
    const cliente = await usuarioComToken('cliente@teste.com')

    const recusado = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${cliente.token}`).send(novo)

    expect(recusado.status).toBe(403)
    expect(await prisma.veiculo.count()).toBe(0)

    const cadastro = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Espertinho', email: 'esperto@teste.com', senha: 'segredo1', papel: 'ADMIN' })
    const token = await entrar('esperto@teste.com')
    const tentativa = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${token}`).send(novo)

    expect(cadastro.body.usuario.papel).toBe('CLIENTE')
    expect(tentativa.status).toBe(403)

    const admin = await usuarioComToken('admin@teste.com', 'ADMIN')
    const aceito = await request(app).post('/api/veiculos').set('Authorization', `Bearer ${admin.token}`).send(novo)
    const listaDoCliente = await request(app).get('/api/veiculos').set('Authorization', `Bearer ${cliente.token}`)

    expect(aceito.status).toBe(201)
    expect(listaDoCliente.body.map((v: { placa: string }) => v.placa)).toEqual(['MOB-1A23'])
  })

  it('lista todos com a disponibilidade e consulta apenas os disponíveis', async () => {
    const { token } = await usuarioComToken('dani@teste.com')

    await criarVeiculo('AAA-1A11')
    await criarVeiculo('BBB-2B22', 120, false)

    const todos = await request(app).get('/api/veiculos').set('Authorization', `Bearer ${token}`)
    const disponiveis = await request(app).get('/api/veiculos/disponiveis').set('Authorization', `Bearer ${token}`)
    const filtrados = await request(app).get('/api/veiculos?disponivel=false').set('Authorization', `Bearer ${token}`)

    expect(todos.status).toBe(200)
    expect(todos.body).toHaveLength(2)
    expect(todos.body.map((v: { disponivel: boolean }) => v.disponivel).sort()).toEqual([false, true])
    expect(disponiveis.body.map((v: { placa: string }) => v.placa)).toEqual(['AAA-1A11'])
    expect(filtrados.body.map((v: { placa: string }) => v.placa)).toEqual(['BBB-2B22'])
  })
})

describe('Cálculo de diárias', () => {
  it('conta qualquer fração de 24 horas como diária completa', () => {
    const inicio = new Date('2026-12-01T10:00:00Z')

    expect(calcularDiarias(inicio, new Date('2026-12-01T11:00:00Z'))).toBe(1)
    expect(calcularDiarias(inicio, new Date('2026-12-02T10:00:00Z'))).toBe(1)
    expect(calcularDiarias(inicio, new Date('2026-12-02T10:01:00Z'))).toBe(2)
    expect(calcularDiarias(inicio, new Date('2026-12-04T09:59:00Z'))).toBe(3)
  })
})

describe('Locações', () => {
  it('registra a locação, calcula o valor no backend e deixa o veículo indisponível', async () => {
    const { usuario, token } = await usuarioComToken('eva@teste.com')
    const veiculo = await criarVeiculo('CCC-3C33', 89.9)

    const resposta = await alugar(token, veiculo.id, daqui(HORA), daqui(HORA + 2 * DIA + HORA))

    expect(resposta.status).toBe(201)
    expect(resposta.body).toMatchObject({ status: 'ATIVA', valorDiaria: 89.9, valorTotal: 269.7, dataDevolucao: null })
    expect(resposta.body.veiculo.placa).toBe('CCC-3C33')

    const salva = await prisma.locacao.findUniqueOrThrow({ where: { id: resposta.body.id } })
    const atualizado = await prisma.veiculo.findUniqueOrThrow({ where: { id: veiculo.id } })

    expect(salva.usuarioId).toBe(usuario.id)
    expect(atualizado.disponivel).toBe(false)
  })

  it('ignora usuarioId e valorTotal enviados pelo cliente', async () => {
    const { usuario, token } = await usuarioComToken('fabi@teste.com')
    const outro = await criarUsuario('gil@teste.com')
    const veiculo = await criarVeiculo('DDD-4D44', 100)

    const resposta = await request(app)
      .post('/api/locacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        veiculoId: veiculo.id,
        dataInicio: daqui(HORA),
        dataPrevistaDevolucao: daqui(HORA + DIA),
        usuarioId: outro.id,
        valorTotal: 1,
      })

    const salva = await prisma.locacao.findUniqueOrThrow({ where: { id: resposta.body.id } })

    expect(resposta.status).toBe(201)
    expect(salva.usuarioId).toBe(usuario.id)
    expect(Number(salva.valorTotal)).toBe(100)
  })

  it('valida datas, veículo inexistente e veículo indisponível', async () => {
    const { token } = await usuarioComToken('hugo@teste.com')
    const veiculo = await criarVeiculo('EEE-5E55')
    const ocupado = await criarVeiculo('FFF-6F66', 100, false)

    const devolucaoAntes = await alugar(token, veiculo.id, daqui(2 * DIA), daqui(DIA))
    const mesmaData = await alugar(token, veiculo.id, daqui(DIA), daqui(DIA))
    const passado = await alugar(token, veiculo.id, daqui(-2 * DIA), daqui(DIA))
    const dataInvalida = await alugar(token, veiculo.id, 'amanhã', daqui(DIA))
    const inexistente = await alugar(token, 999999)
    const indisponivel = await alugar(token, ocupado.id)

    expect(devolucaoAntes.status).toBe(400)
    expect(mesmaData.status).toBe(400)
    expect(passado.status).toBe(400)
    expect(dataInvalida.status).toBe(400)
    expect(inexistente.status).toBe(404)
    expect(indisponivel.status).toBe(409)
    expect(await prisma.locacao.count()).toBe(0)
  })

  it('aceita só uma de várias solicitações simultâneas para o mesmo veículo', async () => {
    const usuarios = await Promise.all(['i1', 'i2', 'i3', 'i4', 'i5'].map((n) => usuarioComToken(`${n}@teste.com`)))
    const veiculo = await criarVeiculo('GGG-7G77')

    const respostas = await Promise.all(usuarios.map(({ token }) => alugar(token, veiculo.id)))
    const status = respostas.map((r) => r.status).sort()

    expect(status).toEqual([201, 409, 409, 409, 409])
    expect(await prisma.locacao.count({ where: { veiculoId: veiculo.id, status: 'ATIVA' } })).toBe(1)
  })

  it('não deixa um usuário ver ou finalizar a locação de outro', async () => {
    const dono = await usuarioComToken('joao@teste.com')
    const intruso = await usuarioComToken('karla@teste.com')
    const veiculo = await criarVeiculo('HHH-8H88')

    const locacao = await alugar(dono.token, veiculo.id)
    const listaDoIntruso = await request(app).get('/api/locacoes').set('Authorization', `Bearer ${intruso.token}`)
    const finalizarAlheia = await request(app)
      .patch(`/api/locacoes/${locacao.body.id}/finalizar`)
      .set('Authorization', `Bearer ${intruso.token}`)

    expect(listaDoIntruso.status).toBe(200)
    expect(listaDoIntruso.body).toEqual([])
    expect(finalizarAlheia.status).toBe(404)
    expect((await prisma.locacao.findUniqueOrThrow({ where: { id: locacao.body.id } })).status).toBe('ATIVA')
  })

  it('finaliza, registra a devolução, libera o veículo, preserva o histórico e não finaliza de novo', async () => {
    const { token } = await usuarioComToken('leo@teste.com')
    const veiculo = await criarVeiculo('III-9I99')
    const locacao = await alugar(token, veiculo.id)

    const finalizada = await request(app)
      .patch(`/api/locacoes/${locacao.body.id}/finalizar`)
      .set('Authorization', `Bearer ${token}`)

    expect(finalizada.status).toBe(200)
    expect(finalizada.body.status).toBe('FINALIZADA')
    expect(finalizada.body.dataDevolucao).toEqual(expect.any(String))
    expect((await prisma.veiculo.findUniqueOrThrow({ where: { id: veiculo.id } })).disponivel).toBe(true)

    const denovo = await request(app)
      .patch(`/api/locacoes/${locacao.body.id}/finalizar`)
      .set('Authorization', `Bearer ${token}`)

    expect(denovo.status).toBe(409)

    const segunda = await alugar(token, veiculo.id)
    const historico = await request(app).get('/api/locacoes').set('Authorization', `Bearer ${token}`)
    const soFinalizadas = await request(app)
      .get('/api/locacoes?status=FINALIZADA')
      .set('Authorization', `Bearer ${token}`)

    expect(segunda.status).toBe(201)
    expect(historico.body.map((l: { status: string }) => l.status).sort()).toEqual(['ATIVA', 'FINALIZADA'])
    expect(historico.body[0].veiculo.placa).toBe('III-9I99')
    expect(soFinalizadas.body).toHaveLength(1)
  })

  it('finaliza só uma vez quando duas finalizações chegam juntas', async () => {
    const { token } = await usuarioComToken('mia@teste.com')
    const veiculo = await criarVeiculo('JJJ-0J00')
    const locacao = await alugar(token, veiculo.id)

    const respostas = await Promise.all(
      [1, 2].map(() =>
        request(app).patch(`/api/locacoes/${locacao.body.id}/finalizar`).set('Authorization', `Bearer ${token}`),
      ),
    )

    expect(respostas.map((r) => r.status).sort()).toEqual([200, 409])
  })

  it('responde 400 para identificador inválido e 404 para rota inexistente', async () => {
    const { token } = await usuarioComToken('nina@teste.com')

    const idInvalido = await request(app).patch('/api/locacoes/abc/finalizar').set('Authorization', `Bearer ${token}`)
    const rota = await request(app).get('/api/nada').set('Authorization', `Bearer ${token}`)

    expect(idInvalido.status).toBe(400)
    expect(rota.status).toBe(404)
  })
})
