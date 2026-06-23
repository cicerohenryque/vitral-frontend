export const CondicaoProduto = {
  NOVO: 'NOVO',
  USADO: 'USADO',
  SEMINOVO: 'SEMINOVO',
} as const

export type CondicaoProduto = (typeof CondicaoProduto)[keyof typeof CondicaoProduto]

export type ProdutoRequest = {
  titulo: string
  categoriaId?: number
  autor?: string
  descricao?: string
  preco: number
  estoque?: number
  condicao: CondicaoProduto
  fotoUrl?: string
}

export type Produto = {
  id: number
  seboId: number
  categoriaId: number | null
  categoriaNome: string | null
  titulo: string
  autor: string | null
  descricao: string | null
  preco: number
  estoque: number | null
  condicao: CondicaoProduto
  fotoUrl: string | null
  ativo: boolean
}
