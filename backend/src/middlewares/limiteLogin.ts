import rateLimit from 'express-rate-limit'
import { config } from '../config.js'

export const limitarTentativasLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.limiteTentativasLogin,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { erro: 'Muitas tentativas de login. Tente de novo em 15 minutos.' },
})
