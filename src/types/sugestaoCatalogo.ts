import type { BookGenre } from '../constants/productCatalog'
import type { CondicaoProduto } from './produto'

export const StatusSugestaoCatalogo = {
  PENDENTE: 'PENDENTE', APROVADA: 'APROVADA', REJEITADA: 'REJEITADA',
} as const
export type StatusSugestaoCatalogo = typeof StatusSugestaoCatalogo[keyof typeof StatusSugestaoCatalogo]

export type SugestaoCatalogoRequest = {
  seboId: number
  titulo: string
  categoriaId: number
  bookGenre?: BookGenre
  autor?: string
  descricao?: string
  ano?: number
  preco: number
  estoque?: number
  condicao: CondicaoProduto
  fotoUrl?: string
}

export type SugestaoCatalogo = SugestaoCatalogoRequest & {
  id: number
  usuarioId: number
  usuarioNome: string
  catalogoNome: string
  categoriaNome: string
  status: StatusSugestaoCatalogo
  enviadaEm: string
  decididaEm?: string | null
  motivoRejeicao?: string | null
  produtoCriadoId?: number | null
}

export type AprovacaoSugestaoCatalogoRequest = Omit<SugestaoCatalogoRequest, 'seboId'>
