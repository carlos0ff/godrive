import type { Request, Response } from 'express'
import { authService } from '../services/authService.js'

export const authController = {
  async cadastrar(req: Request, res: Response) {
    const usuario = await authService.cadastrar(req.body)

    res.status(201).json({ mensagem: 'Conta criada com sucesso.', usuario })
  },

  async login(req: Request, res: Response) {
    res.json(await authService.login(req.body))
  },

  async perfil(req: Request, res: Response) {
    res.json(await authService.perfil(req.usuarioId!))
  },
}
