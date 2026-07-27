import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../pages/HomePage'
import { buscaService } from '../services/buscaService'
import { produtoService } from '../services/produtoService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'

const pageVazia = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 12,
  first: true,
  last: true,
}

const pageProdutos = (titulo: string) => ({
  ...pageVazia,
  content: [
    {
      id: 1,
      seboId: 1,
      categoriaId: null,
      categoriaNome: null,
      titulo,
      autor: 'Autor',
      descricao: null,
      preco: 20,
      estoque: 1,
      condicao: 'USADO' as const,
      fotoUrl: null,
      ativo: true,
    },
  ],
  totalElements: 1,
})

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.spyOn(buscaService, 'buscarProdutos')
    vi.spyOn(produtoService, 'listarClassicos')
  })

  it('chama buscarProdutos e listarClassicos de forma independente ao montar', async () => {
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageVazia)
    vi.mocked(produtoService.listarClassicos).mockResolvedValue(pageVazia)

    renderHome()

    await screen.findAllByText('Nenhum produto disponível', undefined, { timeout: 3000 }).catch(() => null)

    expect(buscaService.buscarProdutos).toHaveBeenCalledWith({}, 0, 12)
    expect(produtoService.listarClassicos).toHaveBeenCalledWith(0, 12)
  })

  it('exibe produtos recentes e classicos quando ambas as chamadas retornam dados', async () => {
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageProdutos('Livro Recente'))
    vi.mocked(produtoService.listarClassicos).mockResolvedValue(pageProdutos('Livro Classico'))

    renderHome()

    expect(await screen.findByText('Livro Recente')).toBeInTheDocument()
    expect(await screen.findByText('Livro Classico')).toBeInTheDocument()
  })

  it('exibe mensagem de erro dos recentes sem bloquear a secao de classicos', async () => {
    vi.mocked(buscaService.buscarProdutos).mockRejectedValue(new Error('falha na rede'))
    vi.mocked(produtoService.listarClassicos).mockResolvedValue(pageProdutos('Livro Classico'))

    renderHome()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(await screen.findByText('Livro Classico')).toBeInTheDocument()
  })

  it('mantém secao de recentes quando classicos falha', async () => {
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageProdutos('Livro Recente'))
    vi.mocked(produtoService.listarClassicos).mockRejectedValue(new Error('classicos offline'))

    renderHome()

    expect(await screen.findByText('Livro Recente')).toBeInTheDocument()
    expect(screen.getByText('Clássicos')).toBeInTheDocument()
  })

  it('exibe os dois titulos de secao sempre', async () => {
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageVazia)
    vi.mocked(produtoService.listarClassicos).mockResolvedValue(pageVazia)

    renderHome()

    expect(screen.getByText('Produtos disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Clássicos')).toBeInTheDocument()
    expect(await screen.findAllByText('Nenhum produto para exibir.')).toHaveLength(2)
  })
})

describe('HomePage — conta de sebo', () => {
  beforeEach(() => {
    vi.spyOn(buscaService, 'buscarProdutos')
    vi.spyOn(produtoService, 'listarClassicos')
    vi.spyOn(produtoService, 'listarPorSebo')
  })

  afterEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  it('mostra apenas os produtos do proprio sebo quando o seboId ja foi resolvido', async () => {
    useAuthStore.setState({
      token: 'jwt',
      account: { id: 9, name: 'Sebo Teste', username: 'sebo.teste', email: 'sebo@teste.com', type: AccountType.SEBO },
      seboId: 42,
    })
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageProdutos('Livro do Sebo'))
    vi.mocked(produtoService.listarPorSebo).mockResolvedValue(pageProdutos('Classico do Sebo'))

    renderHome()

    expect(await screen.findByText('Livro do Sebo')).toBeInTheDocument()
    expect(await screen.findByText('Classico do Sebo')).toBeInTheDocument()
    expect(buscaService.buscarProdutos).toHaveBeenCalledWith({ seboId: 42 }, 0, 12)
    expect(produtoService.listarPorSebo).toHaveBeenCalledWith(42, 0, 12, 'createdAt,asc')
    expect(produtoService.listarClassicos).not.toHaveBeenCalled()
  })

  it('nao mostra produtos de outros sebos quando o sebo ainda nao cadastrou o proprio perfil', async () => {
    useAuthStore.setState({
      token: 'jwt',
      account: { id: 9, name: 'Sebo Novo', username: 'sebo.novo', email: 'novo@teste.com', type: AccountType.SEBO },
      seboId: null,
    })
    vi.mocked(buscaService.buscarProdutos).mockResolvedValue(pageProdutos('Livro de outro sebo'))
    vi.mocked(produtoService.listarClassicos).mockResolvedValue(pageProdutos('Classico de outro sebo'))

    renderHome()

    expect(await screen.findAllByText('Nenhum produto para exibir.')).toHaveLength(2)
    expect(screen.queryByText('Livro de outro sebo')).not.toBeInTheDocument()
    expect(screen.queryByText('Classico de outro sebo')).not.toBeInTheDocument()
    expect(buscaService.buscarProdutos).not.toHaveBeenCalled()
    expect(produtoService.listarClassicos).not.toHaveBeenCalled()
  })
})
