import { api } from './api'
import type { Page } from '../types/common'
import type { AdminAccount, AdminAudit, AdminDashboard, AdminOrder, AdminProduct, AdminStore } from '../types/admin'
import type { AccountType } from '../types/account'
import type { StatusVerificacao } from '../types/sebo'
import type { StatusPedido } from '../types/pedido'

export const adminService = {
  async dashboard(): Promise<AdminDashboard> {
    const { data } = await api.get<AdminDashboard>('/admin/dashboard')
    return data
  },
  async listarUsuarios(page = 0, termo = '', tipo?: AccountType, ativo?: boolean): Promise<Page<AdminAccount>> {
    const { data } = await api.get<Page<AdminAccount>>('/admin/usuarios', {
      params: { page, size: 20, termo: termo || undefined, tipo, ativo },
    })
    return data
  },
  async alterarStatusUsuario(id: number, ativo: boolean): Promise<AdminAccount> {
    const { data } = await api.put<AdminAccount>(`/admin/usuarios/${id}/status`, { ativo })
    return data
  },
  async listarProdutos(page = 0, termo = '', ativo?: boolean, seboId?: number): Promise<Page<AdminProduct>> {
    const { data } = await api.get<Page<AdminProduct>>('/admin/produtos', {
      params: { page, size: 20, termo: termo || undefined, ativo, seboId },
    })
    return data
  },
  async alterarStatusProduto(id: number, ativo: boolean): Promise<AdminProduct> {
    const { data } = await api.put<AdminProduct>(`/admin/produtos/${id}/status`, { ativo })
    return data
  },
  async listarSebos(page = 0, termo = '', status?: StatusVerificacao): Promise<Page<AdminStore>> {
    const { data } = await api.get<Page<AdminStore>>('/admin/sebos', {
      params: { page, size: 20, termo: termo || undefined, status },
    })
    return data
  },
  async listarPedidos(page = 0, status?: StatusPedido): Promise<Page<AdminOrder>> {
    const { data } = await api.get<Page<AdminOrder>>('/admin/pedidos', {
      params: { page, size: 20, status },
    })
    return data
  },
  async listarAuditoria(page = 0): Promise<Page<AdminAudit>> {
    const { data } = await api.get<Page<AdminAudit>>('/admin/auditoria', { params: { page, size: 20, sort: 'createdAt,desc' } })
    return data
  },
}
