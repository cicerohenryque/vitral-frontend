import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FavoritesPage } from '../components/Favorites/FavoritesPage'
import { OffersPage } from '../components/Offers/OffersPage'
import { ReleasesPage } from '../components/Releases/ReleasesPage'
import { favoritoService } from '../services/favoritoService'
import { ofertaService } from '../services/ofertaService'
import { produtoService } from '../services/produtoService'
import { CondicaoProduto } from '../types/produto'

describe('estados das telas integradas', () => {
  beforeEach(() => {
    vi.spyOn(favoritoService, 'listar')
    vi.spyOn(favoritoService, 'remover')
    vi.spyOn(ofertaService, 'listarAtivas')
    vi.spyOn(produtoService, 'listarLancamentos')
  })

  it('exibe carregamento e estado vazio dos favoritos', async () => {
    vi.mocked(favoritoService.listar).mockResolvedValue([])
    renderPage(<FavoritesPage />)

    expect(screen.getByText('Carregando favoritos')).toBeInTheDocument()
    expect(await screen.findByText('Sua lista está vazia')).toBeInTheDocument()
  })
  it('remove item de favoritos com sucesso', async () => {
    vi.mocked(favoritoService.listar).mockResolvedValue([{ id: 1, produtoId: 7, titulo: 'Livro Favorito', autor: 'Autor', preco: 25, condicao: CondicaoProduto.USADO, fotoUrl: null }])
    vi.mocked(favoritoService.remover).mockResolvedValue()
    renderPage(<FavoritesPage />)

    expect(await screen.findByRole('heading', { name: 'Livro Favorito' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    expect(favoritoService.remover).toHaveBeenCalledWith(7)
    expect(await screen.findByText('Sua lista está vazia')).toBeInTheDocument()
  })

  it('exibe erro quando favoritos nao podem ser carregados', async () => {
    vi.mocked(favoritoService.listar).mockRejectedValue(new Error('falha'))
    renderPage(<FavoritesPage />)

    expect(await screen.findByText('Nao foi possivel carregar seus favoritos.')).toBeInTheDocument()
  })
  it('exibe erro quando ofertas nao podem ser carregadas', async () => {
    vi.mocked(ofertaService.listarAtivas).mockRejectedValue(new Error('falha'))
    renderPage(<OffersPage />)

    expect(await screen.findByText('Erro ao carregar ofertas')).toBeInTheDocument()
  })

  it('exibe ofertas ativas quando o backend retorna dados', async () => {
    vi.mocked(ofertaService.listarAtivas).mockResolvedValue({
      content: [{ id: 1, produtoId: 7, seboId: 3, tituloProduto: 'Oferta Teste', descricao: 'Desconto especial', precoOriginal: 50, precoPromocional: 40, inicioEm: null, fimEm: null, ativa: true }],
      totalElements: 1, totalPages: 1, number: 0, size: 20, first: true, last: true,
    })
    renderPage(<OffersPage />)

    expect(await screen.findByText('Oferta Teste')).toBeInTheDocument()
    expect(screen.getByText('Por R$ 40.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver produto' })).toBeInTheDocument()
  })

  it('exibe erro quando nao e possivel carregar os lancamentos', async () => {
    vi.mocked(produtoService.listarLancamentos).mockRejectedValue(new Error('falha'))
    renderPage(<ReleasesPage />)

    expect(await screen.findByText('Nao foi possivel carregar os lançamentos.')).toBeInTheDocument()
  })

  it('exibe estado vazio quando nao existem lancamentos', async () => {
    vi.mocked(produtoService.listarLancamentos).mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true,
    })
    renderPage(<ReleasesPage />)

    expect(await screen.findByText('Nenhum lançamento disponível')).toBeInTheDocument()
  })
})

function renderPage(component: React.ReactNode) {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}
