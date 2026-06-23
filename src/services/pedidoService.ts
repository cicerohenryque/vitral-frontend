import { api } from './api'
import type { Page } from '../types/common'
import type { Pedido, StatusPedido } from '../types/pedido'

export const pedidoService = {
  async confirmarPedido(): Promise<Pedido> {
    const { data } = await api.post<Pedido>('/pedidos')
    return data
  },

  async atualizarStatus(id: number, status: StatusPedido): Promise<Pedido> {
    const { data } = await api.put<Pedido>(`/pedidos/${id}/status`, null, {
      params: { status },
    })
    return data
  },

  async cancelarPedido(id: number): Promise<Pedido> {
    const { data } = await api.put<Pedido>(`/pedidos/${id}/cancelar`)
    return data
  },

  async listarMeusPedidos(page = 0, size = 20): Promise<Page<Pedido>> {
    const { data } = await api.get<Page<Pedido>>('/pedidos/meus-pedidos', {
      params: { page, size },
    })
    return data
  },

  async listarVendas(page = 0, size = 20): Promise<Page<Pedido>> {
    const { data } = await api.get<Page<Pedido>>('/pedidos/vendas', {
      params: { page, size },
    })
    return data
  },
}
