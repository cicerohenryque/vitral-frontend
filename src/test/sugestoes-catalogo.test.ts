import { describe, expect, it, vi } from 'vitest'
import { api } from '../services/api'
import { sugestaoCatalogoService } from '../services/sugestaoCatalogoService'
import { CondicaoProduto } from '../types/produto'

describe('serviço de sugestões de catálogo', () => {
  it('envia, lista e decide sugestões pelos endpoints esperados', async () => {
    const suggestion = { id: 8, status: 'PENDENTE' }
    const page = { content: [suggestion], totalElements: 1, totalPages: 1, number: 0, size: 20, first: true, last: true }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: suggestion })
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: suggestion })
    const payload = { seboId: 4, titulo: 'Dom Casmurro', categoriaId: 2, preco: 20, condicao: CondicaoProduto.USADO }

    await sugestaoCatalogoService.criar(payload)
    await sugestaoCatalogoService.listarMinhas()
    await sugestaoCatalogoService.listarRecebidas(2, 10)
    await sugestaoCatalogoService.aprovar(8)
    await sugestaoCatalogoService.aprovar(8, { titulo: 'Dom Casmurro', categoriaId: 2, preco: 22, estoque: 2, condicao: CondicaoProduto.USADO })
    await sugestaoCatalogoService.rejeitar(8, 'Já existe')

    expect(post).toHaveBeenCalledWith('/sugestoes-catalogo', payload)
    expect(get).toHaveBeenCalledWith('/sugestoes-catalogo/minhas', { params: { page: 0, size: 20, sort: 'createdAt,desc' } })
    expect(get).toHaveBeenCalledWith('/sugestoes-catalogo/recebidas', { params: { page: 2, size: 10, sort: 'createdAt,desc' } })
    expect(put).toHaveBeenCalledWith('/sugestoes-catalogo/8/aprovar')
    expect(put).toHaveBeenCalledWith('/sugestoes-catalogo/8/aprovar', { titulo: 'Dom Casmurro', categoriaId: 2, preco: 22, estoque: 2, condicao: CondicaoProduto.USADO })
    expect(put).toHaveBeenCalledWith('/sugestoes-catalogo/8/rejeitar', { motivo: 'Já existe' })
  })
})
