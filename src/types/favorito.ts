import type { CondicaoProduto } from './produto'

export type Favorito = {
  id: number
  produtoId: number
  titulo: string
  autor: string | null
  preco: number
  condicao: CondicaoProduto
  fotoUrl: string | null
}
