import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { autenticar } from '../middlewares/autenticacao.js'

export const rotasAuth = Router()

rotasAuth.post('/cadastro', authController.cadastrar)
rotasAuth.post('/confirmar-email', authController.confirmarEmail)
rotasAuth.post('/reenviar-codigo', authController.reenviarCodigo)
rotasAuth.post('/login', authController.login)
rotasAuth.post('/recuperar', authController.recuperarSenha)
rotasAuth.post('/verificar-codigo', authController.verificarCodigo)
rotasAuth.post('/redefinir-senha', authController.redefinirSenha)
rotasAuth.get('/perfil', autenticar, authController.perfil)
