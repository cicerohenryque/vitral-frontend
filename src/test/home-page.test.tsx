import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../pages/HomePage'
import { homeService } from '../services/homeService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import type { HomeResponse, HomeSection } from '../types/home'
import type { Produto } from '../types/produto'

function product(id: number, title: string, overrides: Partial<Produto> = {}): Produto {
  return {
    id,
    seboId: 1,
    seboNome: 'Sebo Aurora',
    categoriaId: 10,
    categoriaNome: 'Livros',
    titulo: title,
    autor: 'Autor',
    descricao: null,
    preco: 20,
    estoque: 1,
    condicao: 'USADO',
    fotoUrl: null,
    ativo: true,
    disponivel: true,
    classico: false,
    lancamento: false,
    dataPublicacao: '2026-07-20T10:00:00Z',
    ...overrides,
  }
}

function section(titulo: string, produtos: Produto[] = [], total = produtos.length): HomeSection {
  return { titulo, produtos, total }
}

function response(overrides: Partial<HomeResponse> = {}): HomeResponse {
  return {
    lancamentos: section('Lançamentos'),
    classicos: section('Clássicos'),
    recentes: section('Adicionados recentemente'),
    recomendados: null,
    categorias: [],
    ...overrides,
  }
}

function renderHome() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>)
}

describe('HomePage integrada à API centralizada', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.spyOn(homeService, 'carregar').mockResolvedValue(response())
  })

  afterEach(() => vi.restoreAllMocks())

  it('renderiza lançamentos e clássicos sem exibir a seção de adicionados recentemente', async () => {
    const release = product(1, 'Lançamento da API', { lancamento: true })
    const classic = product(2, 'Clássico da API', { classico: true })
    const recent = product(3, 'Recente da API')
    vi.mocked(homeService.carregar).mockResolvedValue(response({
      lancamentos: section('Lançamentos', [release]),
      classicos: section('Clássicos', [classic]),
      recentes: section('Adicionados recentemente', [recent]),
    }))

    renderHome()

    expect(screen.getByRole('heading', { name: 'Carregando vitrine' })).toBeInTheDocument()
    expect(await screen.findByText('Lançamento da API')).toBeInTheDocument()
    expect(screen.getByText('Clássico da API')).toBeInTheDocument()
    expect(screen.queryByText('Recente da API')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Adicionados recentemente' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Sebo Aurora')).toHaveLength(2)
    expect(homeService.carregar).toHaveBeenCalledTimes(1)
  })

  it('renderiza recomendados apenas quando a API retorna conteúdo', async () => {
    vi.mocked(homeService.carregar).mockResolvedValue(response({
      recomendados: section('Recomendados para você', [product(4, 'Escolha para você')]),
    }))
    const view = renderHome()

    expect(await screen.findByRole('heading', { name: 'Recomendados para você' })).toBeInTheDocument()
    view.unmount()

    vi.mocked(homeService.carregar).mockResolvedValue(response({ recomendados: null }))
    renderHome()
    await screen.findByText('Nenhum produto disponível no momento.')
    expect(screen.queryByRole('heading', { name: /Recomendados/ })).not.toBeInTheDocument()
  })

  it('renderiza categorias dinamicamente e omite categorias e seções vazias', async () => {
    vi.mocked(homeService.carregar).mockResolvedValue(response({
      lancamentos: section('Lançamentos', [], 8),
      categorias: [
        { id: 10, nome: 'Livros raros', slug: 'livros-raros', produtos: [product(5, 'Livro raro')], total: 4 },
        { id: 20, nome: 'Vinis', slug: 'vinis', produtos: [], total: 0 },
      ],
    }))
    renderHome()

    expect(await screen.findByRole('heading', { name: 'Livros raros' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Vinis' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Lançamentos' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/categorias?categoriaId=10')
  })

  it('exibe Ver todos somente quando o total excede os produtos retornados', async () => {
    vi.mocked(homeService.carregar).mockResolvedValue(response({
      lancamentos: section('Lançamentos', [product(6, 'Único lançamento')], 1),
      categorias: [{ id: 10, nome: 'Livros', slug: 'livros', produtos: [product(7, 'Um de muitos')], total: 9 }],
    }))
    renderHome()

    await screen.findByText('Único lançamento')
    const links = screen.getAllByRole('link', { name: 'Ver todos' })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/categorias?categoriaId=10')
  })

  it('refaz a chamada com autenticação quando a sessão muda', async () => {
    const view = renderHome()
    await waitFor(() => expect(homeService.carregar).toHaveBeenCalledTimes(1))

    act(() => {
      useAuthStore.setState({
        token: 'jwt',
        account: { id: 9, name: 'Sebo', username: 'sebo', email: 's@t.com', type: AccountType.SEBO },
        seboId: 42,
      })
    })
    view.rerender(<MemoryRouter><HomePage /></MemoryRouter>)

    await waitFor(() => expect(homeService.carregar).toHaveBeenCalledTimes(2))
  })

  it('mostra erro amigável e permite tentar novamente', async () => {
    vi.mocked(homeService.carregar)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response({ classicos: section('Clássicos', [product(8, 'Carregado novamente', { classico: true })]) }))
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar a vitrine.')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText('Carregado novamente')).toBeInTheDocument()
    expect(homeService.carregar).toHaveBeenCalledTimes(2)
  })

  it('respeita o campo disponível retornado pela API', async () => {
    vi.mocked(homeService.carregar).mockResolvedValue(response({
      classicos: section('Clássicos', [product(9, 'Produto indisponível', { disponivel: false, ativo: true, estoque: 5, classico: true })]),
    }))
    renderHome()

    expect(await screen.findByText('Indisponível')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Produto indisponível.*indisponivel/ })).toHaveClass('product-card-unavailable')
  })
})
