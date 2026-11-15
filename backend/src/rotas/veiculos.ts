import { Router } from 'express'
import { veiculoController } from '../controllers/veiculoController.js'
import { autenticar } from '../middlewares/autenticacao.js'

export const rotasVeiculos = Router()

rotasVeiculos.get('/', veiculoController.listar)
rotasVeiculos.get('/:id', veiculoController.buscar)
rotasVeiculos.post('/', autenticar, veiculoController.cadastrar)
