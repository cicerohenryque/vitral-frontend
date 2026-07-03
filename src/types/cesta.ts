import type { CondicaoProduto } from './produto'

export type CestaItem = {
  id: number
  produtoId: number
  titulo: string
  autor: string | null
  preco: number
  precoOriginal?: number | null
  quantidade: number
  subtotal: number
  estoqueDisponivel: number
  condicao: CondicaoProduto
  fotoUrl: string | null
}
