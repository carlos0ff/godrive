import { existsSync } from 'node:fs'

if (existsSync('.env')) process.loadEnvFile('.env')

function obrigatoria(nome: string): string {
  const valor = process.env[nome]

  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida. Copie .env.example para .env.`)

  return valor
}

export const config = {
  porta: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? '0.0.0.0',
  confiarProxy: process.env.TRUST_PROXY === 'true',
  caminhoPublicoApi: process.env.API_PUBLIC_PATH ?? '/api',
  jwtSegredo: obrigatoria('JWT_SECRET'),
  jwtExpiracao: process.env.JWT_EXPIRES_IN ?? '1d',
  limiteTentativasLogin: Number(process.env.LOGIN_RATE_LIMIT ?? 20),
  origemCors: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
}
