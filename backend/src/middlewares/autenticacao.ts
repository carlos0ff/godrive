import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import type { Papel } from '@prisma/client'
import { config } from '../config.js'
import { ErroApp } from '../erros.js'

export interface UsuarioToken {
  id: number
  papel: Papel
}

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: UsuarioToken
  }
}

export function gerarToken(usuario: UsuarioToken): string {
  return jwt.sign({ papel: usuario.papel }, config.jwtSegredo, {
    subject: String(usuario.id),
    expiresIn: config.jwtExpiracao as jwt.SignOptions['expiresIn'],
  })
}

export const autenticar: RequestHandler = (req, _res, next) => {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')

  if (tipo !== 'Bearer' || !token) throw new ErroApp(401, 'Faça login para continuar.')

  try {
    const dados = jwt.verify(token, config.jwtSegredo) as jwt.JwtPayload

    req.usuario = { id: Number(dados.sub), papel: dados.papel as Papel }
  } catch {
    throw new ErroApp(401, 'Sessão inválida ou expirada. Entre novamente.')
  }

  next()
}
