import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { autenticar } from '../middlewares/autenticacao.js'
import { limitarTentativasLogin } from '../middlewares/limiteLogin.js'

export const rotasAuth = Router()

rotasAuth.post('/register', authController.cadastrar)
rotasAuth.post('/login', limitarTentativasLogin, authController.login)
rotasAuth.get('/me', autenticar, authController.perfil)
