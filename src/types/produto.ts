export const CondicaoProduto = {
  NOVO: 'NOVO',
  USADO: 'USADO',
  SEMINOVO: 'SEMINOVO',
} as const

export type CondicaoProduto = (typeof CondicaoProduto)[keyof typeof CondicaoProduto]

export type ProdutoRequest = {
  isbn?: string
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
  catalogoLivroId?: number | null
  isbn?: string | null
  titulo: string
  autor: string | null
  descricao: string | null
  preco: number
  precoPromocional?: number | null
  estoque: number | null
  condicao: CondicaoProduto
  fotoUrl: string | null
  ativo: boolean
  seboVerificado?: boolean
  seboNome?: string | null
}

export type VendaFisicaResponse = {
  mensagem: string
  estoqueAtual?: number
}

export type ProdutoVendedor = {
  produtoId: number
  seboId: number
  seboNome: string
  preco: number
  precoPromocional: number | null
  precoEfetivo: number
  estoque: number
  condicao: CondicaoProduto
}
