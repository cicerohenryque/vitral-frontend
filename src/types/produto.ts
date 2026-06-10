export const CondicaoProduto = {
  NOVO: 'NOVO',
  USADO: 'USADO',
  SEMINOVO: 'SEMINOVO',
} as const

export type CondicaoProduto = (typeof CondicaoProduto)[keyof typeof CondicaoProduto]

export type ProdutoRequest = {
  titulo: string
  autor?: string
  descricao?: string
  preco: number
  condicao: CondicaoProduto
  fotoUrl?: string
}

export type Produto = {
  id: number
  seboId: number
  titulo: string
  autor: string | null
  descricao: string | null
  preco: number
  condicao: CondicaoProduto
  fotoUrl: string | null
  ativo: boolean
}
