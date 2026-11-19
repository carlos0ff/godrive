import type { Request, Response } from 'express'
import { locacaoService } from '../services/locacaoService.js'

export const locacaoController = {
  async listar(req: Request, res: Response) {
    res.json(await locacaoService.listar(req.usuarioId!, req.query))
  },

  async registrar(req: Request, res: Response) {
    res.status(201).json(await locacaoService.registrar(req.usuarioId!, req.body))
  },

  async finalizar(req: Request, res: Response) {
    res.json(await locacaoService.finalizar(req.usuarioId!, req.params.id))
  },
}
