import { api } from './api'
import type { MensagemResponse } from '../types/account'
import type { CestaItem } from '../types/cesta'

export const cestaService = {
  async adicionar(produtoId: number): Promise<MensagemResponse> {
    const { data } = await api.post<MensagemResponse>(`/cesta/${produtoId}`)
    return data
  },

  async listar(): Promise<CestaItem[]> {
    const { data } = await api.get<CestaItem[]>('/cesta')
    return data
  },

  async remover(produtoId: number): Promise<void> {
    await api.delete(`/cesta/${produtoId}`)
  },
}
