import { api } from './api'
import type { Account } from '../types/account'
import type { MensagemResponse } from '../types/account'

export const usuarioService = {
  async atualizarPerfil(payload: { name: string }): Promise<Account> {
    const { data } = await api.put<Account>('/usuarios/me', payload)
    return data
  },

  async excluirConta(): Promise<MensagemResponse> {
    const { data } = await api.delete<MensagemResponse>('/usuarios/me')
    return data
  },
}
