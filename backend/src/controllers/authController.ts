import type { Request, Response } from 'express'
import { authService } from '../services/authService.js'

export const authController = {
  async cadastrar(req: Request, res: Response) {
    const usuario = await authService.cadastrar(req.body)

    res.status(201).json({ mensagem: 'Conta criada. Enviamos um código para confirmar o e-mail.', usuario })
  },

  async confirmarEmail(req: Request, res: Response) {
    await authService.confirmarEmail(req.body)

    res.json({ mensagem: 'E-mail confirmado. Sua conta está pronta.' })
  },

  async reenviarCodigo(req: Request, res: Response) {
    await authService.reenviarCodigo(req.body)

    res.json({ mensagem: 'Se o e-mail estiver cadastrado, um novo código foi enviado.' })
  },

  async login(req: Request, res: Response) {
    res.json(await authService.login(req.body))
  },

  async recuperarSenha(req: Request, res: Response) {
    await authService.recuperarSenha(req.body)

    res.json({ mensagem: 'Se o e-mail estiver cadastrado, enviamos um código de verificação.' })
  },

  async verificarCodigo(req: Request, res: Response) {
    await authService.verificarCodigo(req.body)

    res.json({ valido: true })
  },

  async redefinirSenha(req: Request, res: Response) {
    await authService.redefinirSenha(req.body)

    res.json({ mensagem: 'Senha redefinida. Entre com a nova senha.' })
  },

  async perfil(req: Request, res: Response) {
    res.json(await authService.perfil(req.usuario!.id))
  },
}
