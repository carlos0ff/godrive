import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { autenticar } from '../middlewares/autenticacao.js'
import { limitarTentativasLogin } from '../middlewares/limiteLogin.js'

export const rotasAuth = Router()

rotasAuth.post('/cadastro', authController.cadastrar)
rotasAuth.post('/confirmar-email', authController.confirmarEmail)
rotasAuth.post('/reenviar-codigo', authController.reenviarCodigo)
rotasAuth.post('/login', limitarTentativasLogin, authController.login)
rotasAuth.post('/recuperar', authController.recuperarSenha)
rotasAuth.post('/verificar-codigo', authController.verificarCodigo)
rotasAuth.post('/redefinir-senha', authController.redefinirSenha)
rotasAuth.get('/perfil', autenticar, authController.perfil)
