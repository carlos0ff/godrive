import { Router } from 'express'
import { locacaoController } from '../controllers/locacaoController.js'
import { autenticar } from '../middlewares/autenticacao.js'

export const rotasLocacoes = Router()

rotasLocacoes.use(autenticar)

rotasLocacoes.get('/', locacaoController.listar)
rotasLocacoes.post('/', locacaoController.registrar)
rotasLocacoes.patch('/:id/finalizar', locacaoController.finalizar)
