import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { config } from './config.js'
import { documentoOpenApi } from './docs/openapi.js'
import { rotaNaoEncontrada, tratarErros } from './erros.js'
import { rotasAuth } from './rotas/auth.js'
import { rotasLocacoes } from './rotas/locacoes.js'
import { rotasVeiculos } from './rotas/veiculos.js'

export const app = express()

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(documentoOpenApi))

app.use(helmet())
app.use(cors({ origin: config.origemCors }))
app.use(express.json({ limit: '8mb' }))

app.get('/api/saude', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', rotasAuth)
app.use('/api/veiculos', rotasVeiculos)
app.use('/api/locacoes', rotasLocacoes)

app.use(rotaNaoEncontrada)
app.use(tratarErros)
