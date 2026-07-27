import { api } from './api'
import type { Page } from '../types/common'
import type { Produto } from '../types/produto'
import type { Sebo } from '../types/sebo'
import type { CondicaoProduto } from '../types/produto'
import type { BookGenre } from '../constants/productCatalog'
import type { TipoOperacaoSebo } from '../types/sebo'

export type BuscaProdutosParams = {
  q?: string
  seboId?: number
  condicao?: CondicaoProduto
  precoMin?: number
  precoMax?: number
  categoriaId?: number
  bookGenre?: BookGenre
}

export type BuscaSebosParams = {
  q?: string
  tipoOperacao?: TipoOperacaoSebo
  cidade?: string
  uf?: string
  lat?: number
  lng?: number
}

export const buscaService = {
  async buscarProdutos(
    params: BuscaProdutosParams,
    page = 0,
    size = 20,
  ): Promise<Page<Produto>> {
    const { data } = await api.get<Page<Produto>>('/busca/produtos', {
      params: { ...params, page, size },
    })
    return data
  },

  async buscarSebos(
    params: BuscaSebosParams,
    page = 0,
    size = 20,
  ): Promise<Page<Sebo>> {
    const { data } = await api.get<Page<Sebo>>('/busca/sebos', {
      params: { ...params, page, size },
    })
    return data
  },
}
