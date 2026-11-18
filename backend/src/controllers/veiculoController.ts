import type { Request, Response } from 'express'
import { veiculoService } from '../services/veiculoService.js'

export const veiculoController = {
  async listar(req: Request, res: Response) {
    res.json(await veiculoService.listar(req.query))
  },

  async buscar(req: Request, res: Response) {
    res.json(await veiculoService.buscar(req.params.id))
  },

  async cadastrar(req: Request, res: Response) {
    res.status(201).json(await veiculoService.cadastrar(req.body))
  },
}
