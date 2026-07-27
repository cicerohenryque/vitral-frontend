import { api } from './api'
import type { Page } from '../types/common'
import type { Produto, ProdutoRequest, ProdutoVendedor, VendaFisicaResponse } from '../types/produto'

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

  async registrarVendaFisica(id: number, quantidade: number): Promise<VendaFisicaResponse> {
    const { data } = await api.post<VendaFisicaResponse>(`/produtos/${id}/venda-fisica`, {
      quantidade,
    })
    return data
  },

  async buscarPorId(id: number): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },

  async listarVendedores(id: number): Promise<ProdutoVendedor[]> {
    const { data } = await api.get<ProdutoVendedor[]>(`/produtos/${id}/vendedores`)
    return data
  },

  async listarPorSebo(seboId: number, page = 0, size = 10, sort?: string): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>(`/produtos/sebo/${seboId}`, {
      params: { page, size, sort },
    })
    return data
  },

  async listarPorCategoria(categoriaId: number, page = 0, size = 20): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>(`/produtos/categoria/${categoriaId}`, {
      params: { page, size },
    })
    return data
  },

  async listarLancamentos(page = 0, size = 20): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>('/produtos/lancamentos', {
      params: { page, size },
    })
    return data
  },

  async listarClassicos(page = 0, size = 20): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>('/produtos/classicos', {
      params: { page, size },
    })
    return data
  },
}
