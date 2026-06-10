import { api } from './api'
import type { Page } from '../types/common'
import type { Produto, ProdutoRequest } from '../types/produto'

export const produtoService = {
  async criar(payload: ProdutoRequest): Promise<Produto> {
    const { data } = await api.post<Produto>('/produtos', payload)
    return data
  },

  async atualizar(id: number, payload: ProdutoRequest): Promise<Produto> {
    const { data } = await api.put<Produto>(`/produtos/${id}`, payload)
    return data
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/produtos/${id}`)
  },

  async buscarPorId(id: number): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },

  async listarPorSebo(seboId: number, page = 0, size = 10): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>(`/produtos/sebo/${seboId}`, {
      params: { page, size },
    })
    return data
  },
}
