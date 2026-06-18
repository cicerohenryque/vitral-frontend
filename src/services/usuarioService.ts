import { api } from './api'
import type { Account } from '../types/account'

export const usuarioService = {
  async atualizarPerfil(payload: { name: string }): Promise<Account> {
    const { data } = await api.put<Account>('/usuarios/me', payload)
    return data
  },

  async excluirConta(): Promise<void> {
    await api.delete('/usuarios/me')
  },
}
