import { api } from './api'
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

  async buscarMeu(): Promise<Sebo> {
    const { data } = await api.get<Sebo>('/sebos/me')
    return data
  },

  async buscarPorId(id: number): Promise<Sebo> {
    const { data } = await api.get<Sebo>(`/sebos/${id}`)
    return data
  },
}
