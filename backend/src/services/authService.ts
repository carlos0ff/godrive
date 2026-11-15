import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { FinalidadeCodigo, Usuario } from '@prisma/client'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { formatarUsuario } from '../formatar.js'
import { gerarToken } from '../middlewares/autenticacao.js'

const MINUTOS_VALIDADE = 15
const CUSTO_HASH = 10

const email = z.string({ required_error: 'Informe o e-mail.' }).trim().toLowerCase().email('Informe um e-mail válido.')
const senha = z.string({ required_error: 'Informe a senha.' }).min(6, 'A senha precisa ter ao menos 6 caracteres.').max(72)
const codigo = z.string({ required_error: 'Informe o código.' }).regex(/^\d{6}$/, 'O código tem 6 números.')
const finalidade = z.enum(['CONFIRMAR_EMAIL', 'RECUPERAR_SENHA'], {
  errorMap: () => ({ message: 'Finalidade deve ser CONFIRMAR_EMAIL ou RECUPERAR_SENHA.' }),
})

const esquemaCadastro = z.object({
  nome: z.string({ required_error: 'Informe seu nome.' }).trim().min(3, 'Informe seu nome completo.').max(120),
  email,
  senha,
})

const esquemaLogin = z.object({ email, senha: z.string({ required_error: 'Informe a senha.' }).min(1, 'Informe a senha.') })
const esquemaEmail = z.object({ email })
const esquemaReenvio = z.object({ email, finalidade })
const esquemaCodigo = z.object({ email, codigo, finalidade })
const esquemaConfirmacao = z.object({ email, codigo })
const esquemaRedefinicao = z.object({ email, codigo, senha })

async function enviarCodigo(usuario: Usuario, tipo: FinalidadeCodigo) {
  const gerado = String(randomInt(0, 1_000_000)).padStart(6, '0')

  await prisma.$transaction([
    prisma.codigoVerificacao.updateMany({
      where: { usuarioId: usuario.id, finalidade: tipo, usadoEm: null },
      data: { usadoEm: new Date() },
    }),
    prisma.codigoVerificacao.create({
      data: {
        usuarioId: usuario.id,
        codigo: gerado,
        finalidade: tipo,
        expiraEm: new Date(Date.now() + MINUTOS_VALIDADE * 60_000),
      },
    }),
  ])

  const assunto = tipo === 'CONFIRMAR_EMAIL' ? 'confirmação de e-mail' : 'recuperação de senha'

  console.log(`[e-mail] Código de ${assunto} para ${usuario.email}: ${gerado}`)
}

async function buscarCodigoValido(usuarioId: number, informado: string, tipo: FinalidadeCodigo) {
  const registro = await prisma.codigoVerificacao.findFirst({
    where: { usuarioId, finalidade: tipo, usadoEm: null, expiraEm: { gt: new Date() } },
    orderBy: { criadoEm: 'desc' },
  })

  if (!registro || registro.codigo !== informado) throw new ErroApp(400, 'Código inválido ou expirado.')

  return registro
}

async function usuarioPorEmail(endereco: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email: endereco } })

  if (!usuario) throw new ErroApp(400, 'Código inválido ou expirado.')

  return usuario
}

export const authService = {
  async cadastrar(entrada: unknown) {
    const dados = esquemaCadastro.parse(entrada)
    const existente = await prisma.usuario.findUnique({ where: { email: dados.email } })

    if (existente?.emailConfirmado) throw new ErroApp(409, 'Já existe uma conta com este e-mail.')

    const senhaHash = await bcrypt.hash(dados.senha, CUSTO_HASH)

    const usuario = existente
      ? await prisma.usuario.update({ where: { id: existente.id }, data: { nome: dados.nome, senhaHash } })
      : await prisma.usuario.create({ data: { nome: dados.nome, email: dados.email, senhaHash } })

    await enviarCodigo(usuario, 'CONFIRMAR_EMAIL')

    return formatarUsuario(usuario)
  },

  async confirmarEmail(entrada: unknown) {
    const dados = esquemaConfirmacao.parse(entrada)
    const usuario = await usuarioPorEmail(dados.email)
    const registro = await buscarCodigoValido(usuario.id, dados.codigo, 'CONFIRMAR_EMAIL')

    await prisma.$transaction([
      prisma.codigoVerificacao.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
      prisma.usuario.update({ where: { id: usuario.id }, data: { emailConfirmado: true } }),
    ])
  },

  async reenviarCodigo(entrada: unknown) {
    const dados = esquemaReenvio.parse(entrada)
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } })

    if (usuario && (dados.finalidade === 'RECUPERAR_SENHA' || !usuario.emailConfirmado))
      await enviarCodigo(usuario, dados.finalidade)
  },

  async login(entrada: unknown) {
    const dados = esquemaLogin.parse(entrada)
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } })
    const senhaConfere = usuario ? await bcrypt.compare(dados.senha, usuario.senhaHash) : false

    if (!usuario || !senhaConfere) throw new ErroApp(401, 'E-mail ou senha incorretos.')

    if (!usuario.emailConfirmado) throw new ErroApp(403, 'Confirme seu e-mail antes de entrar.')

    return { token: gerarToken(usuario), usuario: formatarUsuario(usuario) }
  },

  async recuperarSenha(entrada: unknown) {
    const dados = esquemaEmail.parse(entrada)
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } })

    if (usuario) await enviarCodigo(usuario, 'RECUPERAR_SENHA')
  },

  async verificarCodigo(entrada: unknown) {
    const dados = esquemaCodigo.parse(entrada)
    const usuario = await usuarioPorEmail(dados.email)

    await buscarCodigoValido(usuario.id, dados.codigo, dados.finalidade)
  },

  async redefinirSenha(entrada: unknown) {
    const dados = esquemaRedefinicao.parse(entrada)
    const usuario = await usuarioPorEmail(dados.email)
    const registro = await buscarCodigoValido(usuario.id, dados.codigo, 'RECUPERAR_SENHA')
    const senhaHash = await bcrypt.hash(dados.senha, CUSTO_HASH)

    await prisma.$transaction([
      prisma.codigoVerificacao.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
      prisma.usuario.update({ where: { id: usuario.id }, data: { senhaHash, emailConfirmado: true } }),
    ])
  },

  async perfil(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })

    if (!usuario) throw new ErroApp(404, 'Usuário não encontrado.')

    return formatarUsuario(usuario)
  },
}
