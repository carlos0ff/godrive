import type { Request, Response } from 'express'
import { locacaoService } from '../services/locacaoService.js'

export const locacaoController = {
  async listar(req: Request, res: Response) {
    res.json(await locacaoService.listar(req.usuario!.id, req.query))
  },

  async buscar(req: Request, res: Response) {
    res.json(await locacaoService.buscar(req.usuario!.id, req.params.id))
  },

  async registrar(req: Request, res: Response) {
    res.status(201).json(await locacaoService.registrar(req.usuario!.id, req.body))
  },

  async finalizar(req: Request, res: Response) {
    res.json(await locacaoService.finalizar(req.usuario!.id, req.params.id, req.body))
  },
}
