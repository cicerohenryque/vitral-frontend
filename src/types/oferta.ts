export type Oferta = {
  id: number
  produtoId: number
  seboId: number
  tituloProduto: string
  precoOriginal: number
  precoPromocional: number
  descricao: string | null
  inicioEm: string | null
  fimEm: string | null
  ativa: boolean
}

export type OfertaRequest = {
  produtoId: number
  precoPromocional: number
  descricao?: string
  inicioEm?: string
  fimEm?: string
  ativa?: boolean
}
