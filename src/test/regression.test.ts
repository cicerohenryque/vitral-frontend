import { describe, expect, it, vi } from 'vitest'
import { buscaService } from '../services/buscaService'
import { fetchAllPages } from '../services/pagination'
import { api } from '../services/api'
import type { Page } from '../types/common'
import { BookGenre } from '../constants/productCatalog'
import { CondicaoProduto } from '../types/produto'

const page = <T>(content: T[], totalPages: number, number: number): Page<T> => ({
  content,
  totalElements: content.length,
  totalPages,
  number,
  size: 2,
  first: number === 0,
  last: number === totalPages - 1,
})

describe('regressões de funcionalidades existentes', () => {
  it('agrega o conteúdo de todas as páginas na ordem recebida', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce(page(['primeiro', 'segundo'], 3, 0))
      .mockResolvedValueOnce(page(['terceiro'], 3, 1))
      .mockResolvedValueOnce(page(['quarto'], 3, 2))

    await expect(fetchAllPages(fetchPage, 2)).resolves.toEqual([
      'primeiro', 'segundo', 'terceiro', 'quarto',
    ])
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 2)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 1, 2)
    expect(fetchPage).toHaveBeenNthCalledWith(3, 2, 2)
  })

  it('não consulta páginas adicionais quando a primeira página é a última', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page(['único'], 1, 0))

    await expect(fetchAllPages(fetchPage)).resolves.toEqual(['único'])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('preserva os filtros e a paginação nas buscas de produtos e sebos', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page([], 0, 0) })

    await buscaService.buscarProdutos({
      q: 'livro',
      seboId: 7,
      condicao: CondicaoProduto.USADO,
      precoMin: 10,
      precoMax: 80,
      categoriaId: 2,
      bookGenre: BookGenre.FANTASIA,
    }, 3, 12)
    await buscaService.buscarSebos({ q: 'Centro', cidade: 'Campina Grande', uf: 'PB', lat: -7.23, lng: -35.88 }, 2, 8)

    expect(get).toHaveBeenNthCalledWith(1, '/busca/produtos', {
      params: {
        q: 'livro',
        seboId: 7,
        condicao: CondicaoProduto.USADO,
        precoMin: 10,
        precoMax: 80,
        categoriaId: 2,
        bookGenre: BookGenre.FANTASIA,
        page: 3,
        size: 12,
      },
    })
    expect(get).toHaveBeenNthCalledWith(2, '/busca/sebos', {
      params: { q: 'Centro', cidade: 'Campina Grande', uf: 'PB', lat: -7.23, lng: -35.88, page: 2, size: 8 },
    })
  })
})
