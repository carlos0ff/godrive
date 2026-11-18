import { execSync } from 'node:child_process'
import type { TestProject } from 'vitest/node'

export default function preparar(projeto: TestProject) {
  const url = projeto.config.env.DATABASE_URL

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  })
}
