import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import type { Papel } from '@prisma/client'
import { config } from '../config.js'
import { ErroApp } from '../erros.js'

declare module 'express-serve-static-core' {
  interface Request {
    usuarioId?: number
    usuarioPapel?: Papel
  }
}

export function gerarToken(usuario: { id: number; papel: Papel }): string {
  return jwt.sign({ papel: usuario.papel }, config.jwtSegredo, {
    subject: String(usuario.id),
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
    req.usuarioPapel = dados.papel === 'ADMIN' ? 'ADMIN' : 'CLIENTE'
  } catch {
    throw new ErroApp(401, 'Token inválido ou expirado. Faça login novamente.')
  }

  next()
}

export const exigirAdmin: RequestHandler = (req, _res, next) => {
  if (req.usuarioPapel !== 'ADMIN') throw new ErroApp(403, 'Apenas administradores podem cadastrar veículos.')

  next()
}
