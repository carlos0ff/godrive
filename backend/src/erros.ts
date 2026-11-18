import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export class ErroApp extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem)
  }
}

export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não encontrada.` })
}

export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof ErroApp) {
    res.status(erro.status).json({ erro: erro.message })
    return
  }

  if (erro instanceof ZodError) {
    const primeiro = erro.issues[0]

    res.status(400).json({
      erro: primeiro?.message ?? 'Dados inválidos.',
      campos: erro.issues.map((issue) => ({ campo: issue.path.join('.'), mensagem: issue.message })),
    })
    return
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
    res.status(409).json({ erro: 'Já existe um registro com esses dados.' })
    return
  }

  if (erro?.type === 'entity.parse.failed') {
    res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' })
    return
  }

  if (erro?.type === 'entity.too.large') {
    res.status(413).json({ erro: 'Corpo da requisição grande demais.' })
    return
  }

  console.error(erro)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
}
