import { api } from './api'
import type { MensagemResponse } from '../types/account'
import type { Sebo, SeboRequest } from '../types/sebo'
import type { Page } from '../types/common'
import { fetchAllPages } from './pagination'

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

  async buscarMeu(): Promise<Sebo> {
    const { data } = await api.get<Sebo>('/sebos/me')
    return data
  },

  async buscarPorConta(accountId: number, name: string, email: string): Promise<Sebo | null> {
    const sebos = await fetchAllPages(async (page, size) => {
      const { data } = await api.get<Page<Sebo>>('/busca/sebos', {
        params: { q: name, page, size },
      })
      return data
    }, 20)
    return sebos.find((sebo) => sebo.accountId === accountId || sebo.email === email) ?? null
  },

  async excluirConta(): Promise<MensagemResponse> {
    const { data } = await api.delete<MensagemResponse>('/sebos/me')
    return data
  },
}
