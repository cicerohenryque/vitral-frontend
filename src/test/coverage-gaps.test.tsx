import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { FavoritesPage } from '../components/Favorites/FavoritesPage'
import { OffersPage } from '../components/Offers/OffersPage'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { categoriaService } from '../services/categoriaService'
import { favoritoService } from '../services/favoritoService'
import { ofertaService } from '../services/ofertaService'
import { produtoService } from '../services/produtoService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }
const produto = { id: 7, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro Teste', autor: 'Autor', descricao: 'Descrição', preco: 25, estoque: 2, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }

describe('roteamento e estados preenchidos', () => {
  beforeEach(() => useAuthStore.setState({ token: null, account: null, seboId: null }))

  it('inicializa o roteador completo e resolve rota publica', () => {
    window.history.pushState({}, '', '/ajuda')
    render(<App />)
    expect(screen.getByRole('region', { name: 'Como usar o Vitral' })).toBeInTheDocument()
  })

  it('lista e remove um favorito', async () => {
    vi.spyOn(favoritoService, 'listar').mockResolvedValue([{
      id: 1, produtoId: 7, titulo: 'Livro Teste', autor: null, preco: 25,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }])
    vi.spyOn(favoritoService, 'remover').mockResolvedValue()
    renderPage(<FavoritesPage />)
    expect(await screen.findByRole('heading', { name: 'Livro Teste' })).toBeInTheDocument()
    expect(screen.getByText(/Autor nao informado/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    expect(await screen.findByText('Sua lista está vazia')).toBeInTheDocument()
    expect(favoritoService.remover).toHaveBeenCalledWith(7)
  })

  it('mantem favorito e mostra erro quando remocao falha', async () => {
    vi.spyOn(favoritoService, 'listar').mockResolvedValue([{
      id: 1, produtoId: 7, titulo: 'Livro', autor: 'Autor', preco: 25,
      condicao: CondicaoProduto.USADO, fotoUrl: 'https://img.test/livro.jpg',
    }])
    vi.spyOn(favoritoService, 'remover').mockRejectedValue(new Error('falha'))
    renderPage(<FavoritesPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Remover' }))
    expect(await screen.findByText('Erro ao carregar favoritos')).toBeInTheDocument()
  })

  it('renderiza oferta ativa com desconto calculado', async () => {
    vi.spyOn(ofertaService, 'listarAtivas').mockResolvedValue({
      ...emptyPage,
      content: [{
        id: 1, produtoId: 7, seboId: 3, tituloProduto: 'Livro em oferta', descricao: null,
        precoOriginal: 100, precoPromocional: 70, ativa: true,
        inicioEm: '2026-06-01T00:00:00Z', fimEm: '2026-06-30T23:59:59Z',
      }],
    })
    renderPage(<OffersPage />)
    expect(await screen.findByText('30% off')).toBeInTheDocument()
    expect(screen.getByText('Oferta ativa')).toBeInTheDocument()
    expect(screen.getByText('Por R$ 70.00')).toBeInTheDocument()
  })

  it('edita, cancela e remove produto do catalogo', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Sebo', email: 's@t.com', type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 2, nome: 'Romance', slug: 'romance', descricao: null }] })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [produto] })
    vi.spyOn(produtoService, 'atualizar').mockResolvedValue(produto)
    vi.spyOn(produtoService, 'remover').mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage(<MeusProdutosPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    expect(screen.getByRole('button', { name: 'Atualizar produto' })).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Título'))
    await userEvent.type(screen.getByLabelText('Título'), 'Livro atualizado')
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar produto' }))
    await waitFor(() => expect(produtoService.atualizar).toHaveBeenCalledWith(7, expect.objectContaining({ titulo: 'Livro atualizado' })))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: 'Adicionar produto' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    expect(produtoService.remover).toHaveBeenCalledWith(7)
  })

  it('orienta sebo sem perfil antes de cadastrar produtos', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Sebo', email: 's@t.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue(emptyPage)
    renderPage(<MeusProdutosPage />)
    expect(screen.getByText('Cadastre seu sebo primeiro')).toBeInTheDocument()
    await waitFor(() => expect(categoriaService.listar).toHaveBeenCalled())
  })
})

function renderPage(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}
