import { api } from './api'
import type { Page } from '../types/common'
import type { AprovacaoSugestaoCatalogoRequest, SugestaoCatalogo, SugestaoCatalogoRequest } from '../types/sugestaoCatalogo'

export const sugestaoCatalogoService = {
  async criar(payload: SugestaoCatalogoRequest): Promise<SugestaoCatalogo> {
    const { data } = await api.post<SugestaoCatalogo>('/sugestoes-catalogo', payload)
    return data
  },
  async listarMinhas(page = 0, size = 20): Promise<Page<SugestaoCatalogo>> {
    const { data } = await api.get<Page<SugestaoCatalogo>>('/sugestoes-catalogo/minhas', { params: { page, size, sort: 'createdAt,desc' } })
    return data
  },
  async listarRecebidas(page = 0, size = 20): Promise<Page<SugestaoCatalogo>> {
    const { data } = await api.get<Page<SugestaoCatalogo>>('/sugestoes-catalogo/recebidas', { params: { page, size, sort: 'createdAt,desc' } })
    return data
  },
  async aprovar(id: number, payload?: AprovacaoSugestaoCatalogoRequest): Promise<SugestaoCatalogo> {
    const { data } = payload
      ? await api.put<SugestaoCatalogo>(`/sugestoes-catalogo/${id}/aprovar`, payload)
      : await api.put<SugestaoCatalogo>(`/sugestoes-catalogo/${id}/aprovar`)
    return data
  },
  async rejeitar(id: number, motivo?: string): Promise<SugestaoCatalogo> {
    const { data } = await api.put<SugestaoCatalogo>(`/sugestoes-catalogo/${id}/rejeitar`, { motivo })
    return data
  },
}
