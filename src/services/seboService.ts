import { api } from './api'
import type { Page } from '../types/common'
import type { Sebo, SeboRequest } from '../types/sebo'

export const seboService = {
  async criar(payload: SeboRequest): Promise<Sebo> {
    const { data } = await api.post<Sebo>('/sebos', payload)
    return data
  },

  async atualizarMeu(payload: SeboRequest): Promise<Sebo> {
    const { data } = await api.put<Sebo>('/sebos/me', payload)
    return data
  },

  async buscarPorId(id: number): Promise<Sebo> {
    const { data } = await api.get<Sebo>(`/sebos/${id}`)
    return data
  },

  async buscarPorConta(accountId: number, name: string, email: string): Promise<Sebo | null> {
    const { data } = await api.get<Page<Sebo>>('/busca/sebos', {
      params: { q: name, page: 0, size: 20 },
    })
    return data.content.find((sebo) => sebo.accountId === accountId || sebo.email === email) ?? null
  },
}
