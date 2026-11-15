import { Router } from 'express'
import { veiculoController } from '../controllers/veiculoController.js'
import { autenticar } from '../middlewares/autenticacao.js'

export const rotasVeiculos = Router()

rotasVeiculos.use(autenticar)

rotasVeiculos.get('/', veiculoController.listar)
rotasVeiculos.get('/:id', veiculoController.buscar)
rotasVeiculos.post('/', veiculoController.cadastrar)
