import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutPage } from '../components/Checkout/CheckoutPage'
import { CartPage } from '../components/Cart/CartPage'
import { DeleteAccountPage } from '../components/DeleteAccount/DeleteAccountPage'
import { FavoritesPage } from '../components/Favorites/FavoritesPage'
import { HistoryPage } from '../components/History/HistoryPage'
import { GlobalNavigation } from '../components/GlobalNavigation'
import { MessagesPage } from '../components/Messages/MessagesPage'
import { ProductPage } from '../components/Product/ProductPage'
import { ReservationsPage } from '../components/Reservations/ReservationsPage'
import { SaleConfirmationPage } from '../components/Sales/SaleConfirmationPage'
import { SalesHistoryPage } from '../components/Sales/SalesHistoryPage'
import { SalesOrdersPage } from '../components/Sales/SalesOrdersPage'
import { SellerPage } from '../components/Seller/SellerPage'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { categoriaService } from '../services/categoriaService'
import { cestaService } from '../services/cestaService'
import { favoritoService } from '../services/favoritoService'
import { mensagemService } from '../services/mensagemService'
import { pedidoService } from '../services/pedidoService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import type { CestaItem } from '../types/cesta'
import type { Mensagem } from '../types/mensagem'
import { StatusPedido, type Pedido } from '../types/pedido'
import { CondicaoProduto, type Produto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

describe('funcionalidades principais do front', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  it('exibe perfil publico real do sebo e seus produtos', async () => {
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({
      id: 3, accountId: 8, nome: 'Sebo Central', email: 'sebo@teste.com',
      descricao: 'Livros raros', telefone: '9999-0000', cep: null, logradouro: null,
      cidade: 'Fortaleza', uf: 'CE', horarioFuncionamento: null, fotoUrl: null,
    })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({
      ...emptyPage, content: [produto()],
    })

    renderRoute('/vendedor/3', '/vendedor/:sellerId', <SellerPage />)

    expect(await screen.findByRole('heading', { name: 'Sebo Central' })).toBeInTheDocument()
    expect(screen.getByText('Fortaleza, CE')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Livro Teste, R$ 25.00' })).toHaveAttribute('href', '/produto/7')
    expect(seboService.buscarPorId).toHaveBeenCalledWith(3)
    expect(produtoService.listarPorSebo).toHaveBeenCalledWith(3, 0, 20)
  })

  it('confirma pedido usando os itens reais da cesta', async () => {
    const item = cestaItem()
    const created = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    vi.spyOn(pedidoService, 'confirmarPedido').mockResolvedValue(created)
    renderPage(<CheckoutPage />)

    expect(await screen.findByText('2 itens para confirmar')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(pedidoService.confirmarPedido).toHaveBeenCalled()
    expect(await screen.findByText('Pedido #11 enviado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Acompanhar pedido' })).toHaveAttribute('href', '/reservas')
  })

  it('mostra historico completo e permite cancelar apenas pedido pendente', async () => {
    const pending = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    const confirmed = { ...pedido(StatusPedido.CONFIRMADO), id: 12 }
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({
      ...emptyPage, content: [pending, confirmed],
    })
    vi.spyOn(pedidoService, 'cancelarPedido').mockResolvedValue({
      ...pending, status: StatusPedido.CANCELADO,
    })
    renderPage(<HistoryPage />)

    expect(await screen.findByRole('heading', { name: 'Pedido #11' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pedido #12' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cancelar pedido' })).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    expect(await screen.findByText('Cancelado')).toBeInTheDocument()
  })

  it('separa compras pendentes do historico de vendas do sebo', async () => {
    const pending = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    const confirmed = { ...pedido(StatusPedido.CONFIRMADO), id: 12 }
    const canceled = { ...pedido(StatusPedido.CANCELADO), id: 13 }
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({
      ...emptyPage, content: [pending, confirmed, canceled],
    })

    const pendingRender = renderPage(<SalesOrdersPage />)
    expect(await screen.findByRole('heading', { name: 'Pedido #11' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pedido #12' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Responder pedido' })).toHaveAttribute('href', '/vendas/11/confirmar')
    pendingRender.unmount()

    renderPage(<SalesHistoryPage />)
    expect(await screen.findByRole('heading', { name: 'Pedido #12' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pedido #13' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pedido #11' })).not.toBeInTheDocument()
  })

  it('permite ao sebo recusar uma venda recebida', async () => {
    const pending = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pending] })
    vi.spyOn(pedidoService, 'atualizarStatus').mockResolvedValue({
      ...pending, status: StatusPedido.CANCELADO,
    })
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Recusar venda' }))

    expect(pedidoService.atualizarStatus).toHaveBeenCalledWith(11, StatusPedido.CANCELADO)
    expect(await screen.findByText('Pedido cancelado com sucesso.')).toBeInTheDocument()
  })

  it('carrega conversa e envia mensagem para o sebo selecionado', async () => {
    authenticate(AccountType.USUARIO)
    const sent = mensagem('Mensagem enviada', 1, 2)
    vi.spyOn(mensagemService, 'listar').mockResolvedValue(emptyPage)
    vi.spyOn(mensagemService, 'listarConversa').mockResolvedValue(emptyPage)
    vi.spyOn(mensagemService, 'enviar').mockResolvedValue(sent)
    renderRoute('/mensagens?destinatarioId=2&nome=Sebo', '/mensagens', <MessagesPage />)

    const input = await screen.findByRole('textbox', { name: 'Mensagem' })
    await userEvent.type(input, 'Mensagem enviada')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(mensagemService.listarConversa).toHaveBeenCalledWith(2)
    expect(mensagemService.enviar).toHaveBeenCalledWith({ destinatarioId: 2, conteudo: 'Mensagem enviada' })
    expect(await screen.findAllByText('Mensagem enviada')).toHaveLength(2)
  })

  it('adiciona produto disponivel na cesta e nos favoritos', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue(produto())
    vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('sem perfil'))
    vi.spyOn(cestaService, 'adicionar').mockResolvedValue({ mensagem: 'Adicionado à cesta' })
    vi.spyOn(favoritoService, 'favoritar').mockResolvedValue({ mensagem: 'Favoritado' })
    renderRoute('/produto/7', '/produto/:productId', <ProductPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar à cesta' }))
    expect(await screen.findByText('Adicionado à cesta')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Favoritar' }))

    expect(cestaService.adicionar).toHaveBeenCalledWith(7)
    expect(favoritoService.favoritar).toHaveBeenCalledWith(7)
    expect(await screen.findByText('Favoritado')).toBeInTheDocument()
  })

  it('mostra produto indisponivel e desabilita a acao para compra', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue({
      ...produto(),
      ativo: false,
      estoque: 0,
    })
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({
      id: 3, accountId: 8, nome: 'Sebo Central', email: 'sebo@teste.com',
      descricao: 'Livros raros', telefone: '9999-0000', cep: null, logradouro: null,
      cidade: 'Fortaleza', uf: 'CE', horarioFuncionamento: null, fotoUrl: null,
    })
    renderRoute('/produto/7', '/produto/:productId', <ProductPage />)

    expect(await screen.findByText('Este produto está indisponível no acervo.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar à cesta' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeDisabled()
  })

  it('exibe favoritos vazios e permite remover item dos favoritos', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(favoritoService, 'listar').mockResolvedValue([favoritoItem()])
    vi.spyOn(favoritoService, 'remover').mockResolvedValue()
    renderPage(<FavoritesPage />)

    expect(await screen.findByRole('heading', { name: 'Livro Favorito' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    expect(favoritoService.remover).toHaveBeenCalledWith(7)
    await waitFor(() => expect(screen.getByText('Sua lista está vazia')).toBeInTheDocument())
  })

  it('carrega carrinho e atualiza quantidade, removendo item em seguida', async () => {
    authenticate(AccountType.USUARIO)
    const item = cestaItem()
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    vi.spyOn(cestaService, 'atualizarQuantidade').mockResolvedValue({ mensagem: 'Atualizado' })
    vi.spyOn(cestaService, 'remover').mockResolvedValue()
    renderPage(<CartPage />)

    expect(await screen.findByRole('heading', { name: 'Carrinho' })).toBeInTheDocument()
    const quantity = screen.getByRole('spinbutton', { name: /Qtd\./i })
    fireEvent.change(quantity, { target: { value: '3' } })

    await waitFor(() => expect(cestaService.atualizarQuantidade).toHaveBeenCalledWith(7, 3))
    expect(quantity).toHaveValue(3)

    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    await waitFor(() => expect(screen.getByText('Seu carrinho está vazio')).toBeInTheDocument())
  })

  it('mostra erro ao carregar reservas e permite cancelar um pedido em aberto', async () => {
    authenticate(AccountType.USUARIO)
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockRejectedValue(new Error('Falha de rede'))
    const errorRender = renderPage(<ReservationsPage />)
    expect(await screen.findByText('Erro ao carregar reservas')).toBeInTheDocument()
    errorRender.unmount()

    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)] })
    vi.spyOn(pedidoService, 'cancelarPedido').mockResolvedValue({ ...pedido(StatusPedido.CANCELADO) })
    renderPage(<ReservationsPage />)

    expect(await screen.findByRole('heading', { name: 'Pedido #11' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Pedido #11' })).not.toBeInTheDocument())
  })

  it('mostra o menu correto para usuario e sebo no cabecalho', async () => {
    const guestRender = renderRoute('/', '/', <GlobalNavigation />)
    expect(screen.getByRole('link', { name: /Entrar/ })).toBeInTheDocument()
    guestRender.unmount()

    authenticate(AccountType.USUARIO)
    const userRender = renderRoute('/', '/', <GlobalNavigation />)
    expect(screen.getByRole('link', { name: 'Meu Perfil' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('link', { name: 'Favoritos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument()
    userRender.unmount()

    authenticate(AccountType.SEBO, 3)
    const seboRender = renderRoute('/', '/', <GlobalNavigation />)
    expect(screen.getByRole('link', { name: 'Meu Sebo' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.queryByRole('link', { name: 'Favoritos' })).not.toBeInTheDocument()
    seboRender.unmount()
  })

  it('usa endpoint de sebo ao excluir conta SEBO', async () => {
    authenticate(AccountType.SEBO)
    vi.spyOn(seboService, 'excluirConta').mockResolvedValue({ mensagem: 'ok' })
    vi.spyOn(usuarioService, 'excluirConta').mockResolvedValue({ mensagem: 'ok' })
    const logout = vi.fn()
    useAuthStore.setState({ logout })
    renderRoute('/conta/excluir', '/conta/excluir', <DeleteAccountPage />)

    await userEvent.type(screen.getByLabelText('Confirmação'), 'EXCLUIR')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir conta' }))

    await waitFor(() => expect(seboService.excluirConta).toHaveBeenCalled())
    expect(usuarioService.excluirConta).not.toHaveBeenCalled()
    expect(logout).toHaveBeenCalled()
  })

  it('cadastra produto com estoque e categoria no painel do sebo', async () => {
    authenticate(AccountType.SEBO, 3)
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({
      ...emptyPage, content: [{ id: 4, nome: 'Romance', slug: 'romance', descricao: null }],
    })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue(emptyPage)
    vi.spyOn(produtoService, 'criar').mockResolvedValue(produto())
    renderPage(<MeusProdutosPage />)

    await screen.findByText('Nenhum produto cadastrado')
    await userEvent.type(screen.getByLabelText('Título'), 'Novo livro')
    await userEvent.clear(screen.getByLabelText('Preço (R$)'))
    await userEvent.type(screen.getByLabelText('Preço (R$)'), '35')
    await userEvent.clear(screen.getByLabelText('Estoque'))
    await userEvent.type(screen.getByLabelText('Estoque'), '5')
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), '4')
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar produto' }))

    await waitFor(() => expect(produtoService.criar).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Novo livro', preco: 35, estoque: 5, categoriaId: 4,
    })))
    expect(await screen.findByText('Produto cadastrado!')).toBeInTheDocument()
  })
})

function renderPage(component: ReactNode) {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

function renderRoute(initialEntry: string, route: string, component: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={route} element={component} />
        <Route path="/auth" element={<div>Auth</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function authenticate(type: AccountType, seboId: number | null = null) {
  useAuthStore.setState({
    token: 'token',
    account: { id: 1, name: 'Conta', email: 'conta@teste.com', type },
    seboId,
  })
}

function produto(): Produto {
  return {
    id: 7, seboId: 3, categoriaId: 4, categoriaNome: 'Romance', titulo: 'Livro Teste',
    autor: 'Autor', descricao: 'Descricao', preco: 25, estoque: 5,
    condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true,
  }
}

function cestaItem(): CestaItem {
  return {
    id: 1, produtoId: 7, titulo: 'Livro Teste', autor: 'Autor', preco: 25,
    quantidade: 2, subtotal: 50, estoqueDisponivel: 5,
    condicao: CondicaoProduto.USADO, fotoUrl: null,
  }
}

function favoritoItem() {
  return {
    id: 1, produtoId: 7, titulo: 'Livro Favorito', autor: 'Autor', preco: 25,
    condicao: CondicaoProduto.USADO, fotoUrl: null,
  }
}

function pedido(status: StatusPedido): Pedido {
  return {
    id: 11, accountId: 1, seboId: 3, status, total: 25,
    createdAt: '2026-06-24T10:00:00Z',
    itens: [{ id: 1, produtoId: 7, tituloSnapshot: 'Livro Teste', precoSnapshot: 25, quantidade: 1 }],
  }
}

function mensagem(conteudo: string, remetenteId: number, destinatarioId: number): Mensagem {
  return {
    id: 1, remetenteId, remetenteNome: 'Usuario', destinatarioId,
    destinatarioNome: 'Sebo', conteudo, lida: false, createdAt: '2026-06-24T10:00:00Z',
  }
}
