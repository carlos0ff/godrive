import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { ErroApp } from '../erros.js'
import { formatarUsuario } from '../formatar.js'
import { gerarToken } from '../middlewares/autenticacao.js'

const CUSTO_HASH = 10

const email = z
  .string({ required_error: 'Informe o e-mail.', invalid_type_error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .email('Informe um e-mail válido.')
  .max(160)

const esquemaCadastro = z.object({
  nome: z
    .string({ required_error: 'Informe o nome.', invalid_type_error: 'Informe o nome.' })
    .trim()
    .min(3, 'Informe o nome completo.')
    .max(120),
  email,
  senha: z
    .string({ required_error: 'Informe a senha.', invalid_type_error: 'Informe a senha.' })
    .min(6, 'A senha precisa ter ao menos 6 caracteres.')
    .max(72, 'A senha pode ter no máximo 72 caracteres.'),
})

const esquemaLogin = z.object({
  email,
  senha: z.string({ required_error: 'Informe a senha.', invalid_type_error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
})

export const authService = {
  async cadastrar(entrada: unknown) {
    const dados = esquemaCadastro.parse(entrada)
    const existente = await prisma.usuario.findUnique({ where: { email: dados.email } })

    if (existente) throw new ErroApp(409, 'Já existe uma conta com este e-mail.')

    const senhaHash = await bcrypt.hash(dados.senha, CUSTO_HASH)
    const usuario = await prisma.usuario.create({
      data: { nome: dados.nome, email: dados.email, senhaHash },
    })

    return formatarUsuario(usuario)
  },

  async login(entrada: unknown) {
    const dados = esquemaLogin.parse(entrada)
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } })
    const senhaConfere = usuario ? await bcrypt.compare(dados.senha, usuario.senhaHash) : false

    if (!usuario || !senhaConfere) throw new ErroApp(401, 'E-mail ou senha incorretos.')

    return { token: gerarToken(usuario), usuario: formatarUsuario(usuario) }
  },

  async perfil(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })

    if (!usuario) throw new ErroApp(401, 'Usuário do token não existe mais. Faça login novamente.')

    return formatarUsuario(usuario)
  },
}
