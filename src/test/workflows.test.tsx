import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartPage } from '../components/Cart/CartPage'
import { CategoriesPage } from '../components/Categories/CategoriesPage'
import { DeleteAccountPage } from '../components/DeleteAccount/DeleteAccountPage'
import { ProductPage } from '../components/Product/ProductPage'
import { ReservationsPage } from '../components/Reservations/ReservationsPage'
import { SaleConfirmationPage } from '../components/Sales/SaleConfirmationPage'
import { categoriaService } from '../services/categoriaService'
import { cestaService } from '../services/cestaService'
import { pedidoService } from '../services/pedidoService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { StatusPedido, type Pedido } from '../types/pedido'
import { CondicaoProduto, type Produto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

describe('fluxos integrados do front', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  it('atualiza quantidade e subtotal do carrinho persistido', async () => {
    vi.spyOn(cestaService, 'listar').mockResolvedValue([{
      id: 1, produtoId: 5, titulo: 'Livro', autor: 'Autor', preco: 20,
      quantidade: 1, subtotal: 20, estoqueDisponivel: 4,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }])
    vi.spyOn(cestaService, 'atualizarQuantidade').mockResolvedValue({ mensagem: 'ok' })
    renderPage(<CartPage />)

    const quantity = await screen.findByRole('spinbutton', { name: 'Qtd.' })
    fireEvent.change(quantity, { target: { value: '3' } })

    await waitFor(() => expect(cestaService.atualizarQuantidade).toHaveBeenCalledWith(5, 3))
    expect(await screen.findByText('3 itens na cesta')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 60.00')).toHaveLength(2)
  })

  it('remove produto do carrinho e exibe estado vazio', async () => {
    vi.spyOn(cestaService, 'listar').mockResolvedValue([{
      id: 1, produtoId: 5, titulo: 'Livro', autor: null, preco: 20,
      quantidade: 1, subtotal: 20, estoqueDisponivel: 1,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }])
    vi.spyOn(cestaService, 'remover').mockResolvedValue()
    renderPage(<CartPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Remover' }))

    expect(cestaService.remover).toHaveBeenCalledWith(5)
    expect(await screen.findByText('Seu carrinho está vazio')).toBeInTheDocument()
  })

  it('cancela reserva pendente e a remove da lista', async () => {
    const pedido = buildPedido()
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pedido] })
    vi.spyOn(pedidoService, 'cancelarPedido').mockResolvedValue({ ...pedido, status: StatusPedido.CANCELADO })
    renderPage(<ReservationsPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar pedido' }))

    expect(pedidoService.cancelarPedido).toHaveBeenCalledWith(11)
    expect(await screen.findByText('Nenhuma reserva em aberto')).toBeInTheDocument()
  })

  it('nao busca categoria 0 e carrega produtos somente apos selecionar categoria', async () => {
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({
      ...emptyPage,
      content: [{ id: 2, nome: 'Romance', slug: 'romance', descricao: null }],
    })
    vi.spyOn(produtoService, 'listarPorCategoria').mockResolvedValue(emptyPage)
    renderPage(<CategoriesPage />)

    expect(await screen.findByRole('button', { name: /Romance/ })).toBeInTheDocument()
    expect(produtoService.listarPorCategoria).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /Romance/ }))

    await waitFor(() => expect(produtoService.listarPorCategoria).toHaveBeenCalledWith(2))
    expect(await screen.findByText('Nenhum produto nesta categoria')).toBeInTheDocument()
  })

  it('desabilita compra e favorito para produto sem estoque', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue(buildProduto({ estoque: 0, ativo: false }))
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({
      id: 3, accountId: 4, nome: 'Sebo', email: 'sebo@teste.com', descricao: null,
      telefone: null, cep: null, logradouro: null, cidade: null, uf: null,
      horarioFuncionamento: null, fotoUrl: null,
    })
    renderRoute('/produto/7', <ProductPage />)

    expect(await screen.findByText('Indisponivel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar à cesta' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeDisabled()
  })

  it('confirma venda recebida pelo sebo', async () => {
    const pedido = buildPedido()
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    vi.spyOn(pedidoService, 'atualizarStatus')
      .mockResolvedValue({ ...pedido, status: StatusPedido.CONFIRMADO })
    renderRoute('/vendas/11/confirmar', <SaleConfirmationPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar venda' }))

    expect(pedidoService.atualizarStatus).toHaveBeenCalledWith(11, StatusPedido.CONFIRMADO)
    expect(await screen.findByText('Pedido confirmado com sucesso.')).toBeInTheDocument()
  })

  it('usa endpoint de usuario ao excluir conta USUARIO', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(usuarioService, 'excluirConta').mockResolvedValue({ mensagem: 'ok' })
    vi.spyOn(seboService, 'excluirConta').mockResolvedValue({ mensagem: 'ok' })
    const logout = vi.fn()
    useAuthStore.setState({ logout })
    renderRoute('/excluir-conta', <DeleteAccountPage />)

    await userEvent.type(screen.getByLabelText('Confirmação'), 'EXCLUIR')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir conta' }))

    await waitFor(() => expect(usuarioService.excluirConta).toHaveBeenCalled())
    expect(seboService.excluirConta).not.toHaveBeenCalled()
    expect(logout).toHaveBeenCalled()
  })
})

function renderPage(component: ReactNode) {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

function renderRoute(path: string, component: ReactNode) {
  const routePattern = path.startsWith('/produto/')
    ? '/produto/:productId'
    : path.startsWith('/vendas/')
      ? '/vendas/:orderId/confirmar'
      : path
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePattern} element={component} />
        <Route path="/auth" element={<div>Auth</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function authenticate(type: AccountType) {
  useAuthStore.setState({
    token: 'token',
    account: { id: 1, name: 'Conta', email: 'conta@teste.com', type },
    seboId: type === AccountType.SEBO ? 3 : null,
  })
}

function buildPedido(): Pedido {
  return {
    id: 11, accountId: 1, seboId: 3,
    status: StatusPedido.AGUARDANDO_CONFIRMACAO,
    total: 25,
    createdAt: '2026-06-24T10:00:00Z',
    itens: [{ id: 1, produtoId: 7, tituloSnapshot: 'Livro', precoSnapshot: 25, quantidade: 1 }],
  }
}

function buildProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 7, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro',
    autor: 'Autor', descricao: 'Descricao', preco: 25, estoque: 2,
    condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true,
    ...overrides,
  }
}
