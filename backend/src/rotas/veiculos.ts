import { Router } from 'express'
import { veiculoController } from '../controllers/veiculoController.js'
import { autenticar, exigirAdmin } from '../middlewares/autenticacao.js'

export const rotasVeiculos = Router()

rotasVeiculos.use(autenticar)

rotasVeiculos.get('/', veiculoController.listar)
rotasVeiculos.get('/disponiveis', veiculoController.listarDisponiveis)
rotasVeiculos.post('/', exigirAdmin, veiculoController.cadastrar)
