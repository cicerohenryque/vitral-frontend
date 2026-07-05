import { api } from './api'
import type { Page } from '../types/common'
import type { MovimentacaoEstoque, RegistrarVendaFisicaRequest } from '../types/movimentacao'

export const movimentacaoService = {
  async registrarVendaFisica(payload: RegistrarVendaFisicaRequest): Promise<MovimentacaoEstoque> {
    const { data } = await api.post<MovimentacaoEstoque>('/movimentacoes-estoque/vendas-fisicas', payload)
    return data
  },
  async listar(page = 0, size = 20): Promise<Page<MovimentacaoEstoque>> {
    const { data } = await api.get<Page<MovimentacaoEstoque>>('/movimentacoes-estoque', { params: { page, size } })
    return data
  },
  async estornar(id: number, motivo: string): Promise<MovimentacaoEstoque> {
    const { data } = await api.post<MovimentacaoEstoque>(`/movimentacoes-estoque/${id}/estorno`, { motivo })
    return data
  },
}
