export const TipoMovimentacaoEstoque = {
  ENTRADA: 'ENTRADA', SAIDA: 'SAIDA', VENDA_FISICA: 'VENDA_FISICA',
  VENDA_ONLINE: 'VENDA_ONLINE', ESTORNO: 'ESTORNO', AJUSTE: 'AJUSTE',
} as const
export type TipoMovimentacaoEstoque = (typeof TipoMovimentacaoEstoque)[keyof typeof TipoMovimentacaoEstoque]

export type MovimentacaoEstoque = {
  id: number; produtoId: number; seboId: number; operadorId: number
  movimentacaoOrigemId: number | null; tipo: TipoMovimentacaoEstoque
  quantidade: number; estoqueAntes: number; estoqueDepois: number
  valorUnitario: number; valorTotal: number; observacao: string | null; criadoEm: string
}

export type RegistrarVendaFisicaRequest = { produtoId: number; quantidade: number; valorUnitario: number; observacao?: string }
