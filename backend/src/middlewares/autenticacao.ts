import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { ErroApp } from '../erros.js'

declare module 'express-serve-static-core' {
  interface Request {
    usuarioId?: number
  }
}

export function gerarToken(usuarioId: number): string {
  return jwt.sign({}, config.jwtSegredo, {
    subject: String(usuarioId),
    expiresIn: config.jwtExpiracao as jwt.SignOptions['expiresIn'],
  })
}

export const autenticar: RequestHandler = (req, _res, next) => {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')

  if (tipo !== 'Bearer' || !token) throw new ErroApp(401, 'Token não informado. Envie Authorization: Bearer <token>.')

  try {
    const dados = jwt.verify(token, config.jwtSegredo) as jwt.JwtPayload
    const usuarioId = Number(dados.sub)

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw new Error()

    req.usuarioId = usuarioId
  } catch {
    throw new ErroApp(401, 'Token inválido ou expirado. Faça login novamente.')
  }

  next()
}
