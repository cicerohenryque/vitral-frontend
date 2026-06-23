export const StatusPedido = {
  AGUARDANDO_CONFIRMACAO: 'AGUARDANDO_CONFIRMACAO',
  CONFIRMADO: 'CONFIRMADO',
  CANCELADO: 'CANCELADO',
} as const

export type StatusPedido = (typeof StatusPedido)[keyof typeof StatusPedido]

export type PedidoItem = {
  id: number
  produtoId: number
  tituloSnapshot: string
  precoSnapshot: number
}

export type Pedido = {
  id: number
  accountId: number
  seboId: number
  status: StatusPedido
  total: number
  createdAt: string
  itens: PedidoItem[]
}
