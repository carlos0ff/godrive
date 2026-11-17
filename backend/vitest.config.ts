import { existsSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

if (existsSync('.env')) process.loadEnvFile('.env')

const bancoDeTeste = process.env.TEST_DATABASE_URL ?? 'mysql://root:@localhost:3306/godrive_test'

if (!/test/i.test(new URL(bancoDeTeste).pathname))
  throw new Error('TEST_DATABASE_URL precisa apontar para um banco de teste (com "test" no nome).')

export default defineConfig({
  test: {
    include: ['testes/**/*.test.ts'],
    globalSetup: './testes/preparar.ts',
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 120000,
    env: {
      DATABASE_URL: bancoDeTeste,
      JWT_SECRET: process.env.JWT_SECRET ?? 'segredo-usado-apenas-nos-testes',
      LOGIN_RATE_LIMIT: '1000',
    },
  },
})
