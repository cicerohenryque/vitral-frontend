import { describe, expect, it, vi } from 'vitest'
import { BookGenre, ProductCategory, getAllowedCategories, getCategoryType, isBookCategory } from '../constants/productCatalog'
import { buscaService } from '../services/buscaService'
import { produtoService } from '../services/produtoService'
import { usuarioService } from '../services/usuarioService'
import { api } from '../services/api'
import { formatCep, formatCpf, isValidCpf, onlyDigits } from '../utils/personalData'

describe('catálogo permitido', () => {
  it.each([
    ['Livros', 'livros', ProductCategory.LIVROS],
    ['CDs', 'cds', ProductCategory.CDS],
    ['Vinis', 'vinis', ProductCategory.VINIS],
    ['HQs / Mangás', 'hqs-mangas', ProductCategory.HQS_MANGAS],
  ])('aceita a categoria %s', (nome, slug, expected) => {
    expect(getCategoryType({ nome, slug })).toBe(expected)
  })

  it('rejeita categorias fora do domínio', () => {
    const categories = [
      { id: 1, nome: 'Livros', slug: 'livros', descricao: null },
      { id: 2, nome: 'Eletrônicos', slug: 'eletronicos', descricao: null },
    ]
    expect(getAllowedCategories(categories)).toEqual([categories[0]])
    expect(getCategoryType(categories[1])).toBeNull()
    expect(isBookCategory(categories[0])).toBe(true)
  })
})

describe('CPF e CEP', () => {
  it('valida CPF e aplica máscaras sem alterar a persistência numérica', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('529.982.247-24')).toBe(false)
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
    expect(formatCep('60000000')).toBe('60000-000')
    expect(onlyDigits('60000-000')).toBe('60000000')
  })
})

describe('contratos de produto, busca e perfil', () => {
  it('envia gênero no livro e permite produto não livro sem gênero', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} } as never)
    await produtoService.criar({ titulo: 'Livro', categoriaId: 1, bookGenre: BookGenre.FANTASIA, preco: 10, condicao: 'USADO' })
    await produtoService.criar({ titulo: 'CD', categoriaId: 2, preco: 20, condicao: 'NOVO' })
    expect(post).toHaveBeenNthCalledWith(1, '/produtos', expect.objectContaining({ bookGenre: BookGenre.FANTASIA }))
    expect(post).toHaveBeenNthCalledWith(2, '/produtos', expect.not.objectContaining({ bookGenre: expect.anything() }))
  })

  it('envia filtros de categoria e gênero', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { content: [] } } as never)
    await buscaService.buscarProdutos({ categoriaId: 1, bookGenre: BookGenre.ROMANCE })
    expect(get).toHaveBeenCalledWith('/busca/produtos', { params: { categoriaId: 1, bookGenre: BookGenre.ROMANCE, page: 0, size: 20 } })
  })

  it('carrega e atualiza somente o perfil autenticado', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: 1 } } as never)
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { id: 1 } } as never)
    await usuarioService.buscarPerfil()
    await usuarioService.atualizarPerfil({ name: 'Ana', cpf: '52998224725', cep: '60000000', logradouro: 'Rua A', numero: '1', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' })
    expect(get).toHaveBeenCalledWith('/auth/me')
    expect(put).toHaveBeenCalledWith('/usuarios/me', expect.objectContaining({ cpf: '52998224725', cep: '60000000' }))
  })
})
