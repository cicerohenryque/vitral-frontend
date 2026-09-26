import type { AccountType } from './account'
import type { StatusPagamento, StatusPedido } from './pedido'
import type { StatusVerificacao } from './sebo'

export type AdminAccount = {
  id: number
  name: string
  email: string
  type: AccountType
  ativo: boolean
  createdAt: string
}

export type AdminOrder = {
  id: number
  accountId: number
  usuarioNome: string
  seboId: number
  seboNome: string
  status: StatusPedido
  statusPagamento: StatusPagamento
  total: number
  createdAt: string
  updatedAt: string
  confirmadoEm: string | null
  pagoEm: string | null
  canceladoEm: string | null
  reembolsadoEm: string | null
  itens: { produtoId: number; titulo: string; precoUnitario: number; quantidade: number }[]
}

export type AdminProduct = {
  id: number; titulo: string; preco: number; estoque: number; seboId: number; seboNome: string; ativo: boolean; createdAt: string
}

export type AdminStore = {
  id: number; nome: string; responsavel: string; contaAtiva: boolean; status: StatusVerificacao; createdAt: string
  ultimaAtividade: string | null; produtosAtivos: number; produtosInativos: number
}

export type AdminDashboard = {
  usuarios: number; usuariosAtivos: number; sebos: number; produtos: number; produtosAtivos: number; pedidos: number
  pedidosPorStatus: Record<string, number>
}

export type AdminAudit = {
  id: number; adminId: number; adminNome: string; adminEmail: string; acao: string; entidade: string
  entidadeId: number; descricao: string; createdAt: string
}
