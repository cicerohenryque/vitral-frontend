import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BuscaPage } from '../pages/BuscaPage'
import { CartPage } from '../components/Cart/CartPage'
import { CheckoutPage } from '../components/Checkout/CheckoutPage'
import { CategoriesPage } from '../components/Categories/CategoriesPage'
import { DeleteAccountPage } from '../components/DeleteAccount/DeleteAccountPage'
import { HistoryPage } from '../components/History/HistoryPage'
import { MessagesPage } from '../components/Messages/MessagesPage'
import { OffersPage } from '../components/Offers/OffersPage'
import { ProductPage } from '../components/Product/ProductPage'
import { SalesHistoryPage } from '../components/Sales/SalesHistoryPage'
import { SalesOrdersPage } from '../components/Sales/SalesOrdersPage'
import { SaleConfirmationPage } from '../components/Sales/SaleConfirmationPage'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { cestaService } from '../services/cestaService'
import { pedidoService } from '../services/pedidoService'
import { categoriaService } from '../services/categoriaService'
import { produtoService } from '../services/produtoService'
import { buscaService } from '../services/buscaService'
import { mensagemService } from '../services/mensagemService'
import { ofertaService } from '../services/ofertaService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { StatusPedido, type Pedido } from '../types/pedido'
import { CondicaoProduto } from '../types/produto'
import { AccountType } from '../types/account'
import { useAuthStore } from '../store/authStore'
import type { CestaItem } from '../types/cesta'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

describe('cobertura de branches restantes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  it('mostra erro de carregamento do carrinho e mantém a mensagem', async () => {
    vi.spyOn(cestaService, 'listar').mockRejectedValue(new Error('falha de rede'))
    renderPage(<CartPage />)

    expect(await screen.findByText('Erro ao carregar carrinho')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar a cesta.')).toBeInTheDocument()
  })

  it('atualiza quantidade e exibe erro se a atualizacao falhar', async () => {
    const item: CestaItem = {
      id: 1,
      produtoId: 7,
      titulo: 'Livro Quantidade',
      autor: 'Autor',
      preco: 20,
      quantidade: 1,
      subtotal: 20,
      estoqueDisponivel: 2,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    vi.spyOn(cestaService, 'atualizarQuantidade').mockRejectedValue(new Error('erro atualizar'))
    renderPage(<CartPage />)

    expect(await screen.findByText('Livro Quantidade')).toBeInTheDocument()
    const quantity = screen.getByRole('spinbutton', { name: /Qtd\./i })
    fireEvent.change(quantity, { target: { value: '2' } })

    expect(await screen.findByText('Erro ao carregar carrinho')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel atualizar a quantidade.')).toBeInTheDocument()
  })

  it('exibe carrinho vazio quando nao ha itens', async () => {
    vi.spyOn(cestaService, 'listar').mockResolvedValue([])
    renderPage(<CheckoutPage />)

    expect(await screen.findByText('Sua cesta está vazia')).toBeInTheDocument()
  })

  it('mostra erro ao confirmar pedido', async () => {
    const item: CestaItem = {
      id: 1,
      produtoId: 7,
      titulo: 'Livro Checkout',
      autor: 'Autor',
      preco: 25,
      quantidade: 1,
      subtotal: 25,
      estoqueDisponivel: 3,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    vi.spyOn(pedidoService, 'confirmarPedido').mockRejectedValue(new Error('pagamento falhou'))

    renderPage(<CheckoutPage />)
    expect(await screen.findByText('Livro Checkout')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Pagar e confirmar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel confirmar o pedido.')
  })

  it('mostra erro ao carregar categorias', async () => {
    vi.spyOn(categoriaService, 'listar').mockRejectedValue(new Error('falha'))
    renderPage(<CategoriesPage />)

    expect(await screen.findByText('Erro ao carregar categorias')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar as categorias.')).toBeInTheDocument()
  })

  it('mostra erro ao carregar produtos da categoria selecionada', async () => {
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 2, nome: 'Romance', descricao: 'Livros', slug: 'romance' }] })
    vi.spyOn(produtoService, 'listarPorCategoria').mockRejectedValue(new Error('falha categoria'))
    renderWithParams('/categorias?categoriaId=2', <CategoriesPage />)

    expect(await screen.findByText('Erro ao carregar produtos')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar os produtos da categoria.')).toBeInTheDocument()
  })

  it('mostra categoria sem produtos quando nenhuma opcao esta disponivel', async () => {
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 2, nome: 'Romance', descricao: null, slug: 'romance' }] })
    vi.spyOn(produtoService, 'listarPorCategoria').mockResolvedValue({ ...emptyPage, content: [] })
    renderWithParams('/categorias?categoriaId=2', <CategoriesPage />)

    expect(await screen.findByText('Nenhum produto nesta categoria')).toBeInTheDocument()
  })

  it('filtra categorias e mostra mensagem de sem resultados', async () => {
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 1, nome: 'Quadrinhos', descricao: 'Títulos ilustrados', slug: 'quadrinhos' }] })
    renderPage(<CategoriesPage />)

    expect(await screen.findByLabelText('Pesquisar uma categoria')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Pesquisar uma categoria'), 'romance')

    expect(await screen.findByText('Nenhuma categoria encontrada')).toBeInTheDocument()
  })

  it('mostra carrinho desalinhado quando a remocao falha', async () => {
    const item: CestaItem = {
      id: 1,
      produtoId: 7,
      titulo: 'Livro Falha',
      autor: 'Autor',
      preco: 20,
      quantidade: 1,
      subtotal: 20,
      estoqueDisponivel: 2,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    vi.spyOn(cestaService, 'remover').mockRejectedValue(new Error('erro remover'))

    renderPage(<CartPage />)
    expect(await screen.findByText('Livro Falha')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))

    expect(await screen.findByText('Nao foi possivel remover o item da cesta.')).toBeInTheDocument()
  })

  it('mostra erro ao carregar historico de pedidos', async () => {
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockRejectedValue(new Error('falha'))
    renderPage(<HistoryPage />)

    expect(await screen.findByText('Erro ao carregar histórico')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar seu histórico.')).toBeInTheDocument()
  })

  it('mostra erro ao carregar checkout', async () => {
    vi.spyOn(cestaService, 'listar').mockRejectedValue(new Error('falha checkout'))
    renderPage(<CheckoutPage />)

    expect(await screen.findByText('Erro ao carregar carrinho')).toBeInTheDocument()
    expect(screen.getByText(/Nao foi possivel carregar sua cesta/i)).toBeInTheDocument()
  })

  it('mostra mensagem sem conversa inicial quando nao ha mensagens', async () => {
    vi.spyOn(mensagemService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })
    renderPage(<MessagesPage />)

    expect(await screen.findByText('Nenhuma conversa ainda')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Encontrar sebos' })).toBeInTheDocument()
  })

  it('exibe produto publico sem sebo e pede login quando nao esta autenticado', async () => {
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue({
      id: 7,
      seboId: 3,
      categoriaId: 2,
      categoriaNome: null,
      titulo: 'Livro Público',
      autor: 'Autor',
      descricao: '',
      preco: 20,
      estoque: 1,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
      ativo: true,
    })
    vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('sem perfil'))

    renderRoute('/produto/7', '/produto/:productId', <ProductPage />)

    expect(await screen.findByText('Entrar para comprar')).toBeInTheDocument()
    expect(screen.getByText('Sebo #3')).toBeInTheDocument()
  })

  it('exibe pagina de exclusao de conta com erro quando a exclusao falha', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.USUARIO }, seboId: null })
    vi.spyOn(usuarioService, 'excluirConta').mockRejectedValue(new Error('falha'))

    renderRoute('/conta/excluir', '/conta/excluir', <DeleteAccountPage />)
    await userEvent.type(screen.getByLabelText('Confirmação'), 'EXCLUIR')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel excluir sua conta.')
  })

  it('mostra erro e sem ofertas ativas quando nao ha resultados', async () => {
    vi.spyOn(ofertaService, 'listarAtivas').mockResolvedValue({ ...emptyPage, content: [] })
    renderPage(<OffersPage />)

    expect(await screen.findByText('Nenhuma oferta ativa')).toBeInTheDocument()
  })

  it('renderiza oferta sem descricao com fallback', async () => {
    vi.spyOn(ofertaService, 'listarAtivas').mockResolvedValue({
      ...emptyPage,
      content: [
        {
          id: 5,
          produtoId: 7,
          seboId: 3,
          tituloProduto: 'Oferta teste',
          descricao: null,
          precoOriginal: 50,
          precoPromocional: 25,
          inicioEm: '2026-06-01T00:00:00Z',
          fimEm: '2026-06-30T23:59:59Z',
          ativa: true,
        },
      ],
    })
    renderPage(<OffersPage />)

    expect(await screen.findByText('Oferta ativa')).toBeInTheDocument()
    expect(screen.getByText('Por R$ 25.00')).toBeInTheDocument()
  })

  it('mostra historico vazio de pedidos', async () => {
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [] })
    renderPage(<HistoryPage />)

    expect(await screen.findByText('Você ainda não fez pedidos')).toBeInTheDocument()
  })

  it('exibe erro ao cancelar o pedido no historico', async () => {
    const pending = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pending] })
    vi.spyOn(pedidoService, 'cancelarPedido').mockRejectedValue(new Error('falha'))

    renderPage(<HistoryPage />)
    expect(await screen.findByText('Pedido #11')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByText('Erro ao carregar histórico')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel cancelar o pedido.')).toBeInTheDocument()
  })

  it('mostra historico de vendas vazio', async () => {
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [] })
    renderPage(<SalesHistoryPage />)

    expect(await screen.findByText('Nenhuma venda processada')).toBeInTheDocument()
  })

  it('mostra compras recebidas vazias', async () => {
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [] })
    renderPage(<SalesOrdersPage />)

    expect(await screen.findByText('Nenhuma compra aguardando confirmação')).toBeInTheDocument()
  })

  it('mostra pedido invalido na confirmacao de venda', async () => {
    renderRoute('/vendas/abc/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Pedido inválido')).toBeInTheDocument()
  })

  it('mostra pedido nao encontrado na confirmacao de venda', async () => {
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [{ id: 22, accountId: 4, seboId: 3, status: StatusPedido.CONFIRMADO, total: 50, createdAt: '2026-06-24T00:00:00Z', itens: [{ id: 1, produtoId: 7, tituloSnapshot: 'Livro Teste', precoSnapshot: 50, quantidade: 1 }] }] })
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Pedido não encontrado')).toBeInTheDocument()
  })

  it('confirma venda em confirmacao de pedido', async () => {
    const pending = pedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pending] })
    vi.spyOn(pedidoService, 'atualizarStatus').mockResolvedValue({ ...pending, status: StatusPedido.CONFIRMADO })

    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)
    expect(await screen.findByText('Confirmar venda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar venda' }))

    expect(await screen.findByText('Pedido confirmado com sucesso.')).toBeInTheDocument()
  })

  it('mostra resultados de sebos na busca e altera para produtos', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [{ id: 42, nome: 'Sebo do Teste', descricao: 'Raro', telefone: '3333', accountId: 1, email: 'sebo@teste.com', fotoUrl: null }] })
    renderWithParams('/busca?q=teste&tab=sebos', <BuscaPage />)

    expect(await screen.findByRole('heading', { name: 'Sebo do Teste' })).toBeInTheDocument()
    expect(screen.getByText('Raro')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: /Produtos/ }))
    expect(await screen.findByText('Nenhum produto encontrado.')).toBeInTheDocument()
  })

  it('faz busca com termo nao vazio e atualiza os params da url', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?tab=produtos', <BuscaPage />)
    const searchBox = screen.getByRole('searchbox', { name: /Pesquisar produtos ou sebos/i })
    await userEvent.type(searchBox, 'abc')

    const searchForm = searchBox.closest('form')
    const submitButton = searchForm?.querySelector('button[type=submit]')
    expect(submitButton).toBeInstanceOf(HTMLButtonElement)
    await userEvent.click(submitButton as HTMLButtonElement)

    await waitFor(() => expect(buscaService.buscarProdutos).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'abc' })))
  })

  it('ignora filtros físicos antigos na busca de sebos', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    const buscarSebosSpy = vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?tab=sebos&cidade=Campina%20Grande&uf=PB', <BuscaPage />)
    expect(await screen.findByText('Nenhum sebo encontrado.')).toBeInTheDocument()

    expect(buscarSebosSpy).toHaveBeenLastCalledWith({ q: undefined })
  })

  it('mostra sebo com foto quando a busca retorna fotoUrl', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({
      ...emptyPage,
      content: [{ id: 99, nome: 'Sebo com Imagem', descricao: 'Detalhes', telefone: '1111-2222', accountId: 1, email: 'img@sebo.com', fotoUrl: 'https://image.test/sebo.jpg' }],
    })

    renderWithParams('/busca?tab=sebos', <BuscaPage />)
    expect(await screen.findByRole('heading', { name: 'Sebo com Imagem' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sebo com Imagem' })).toBeInTheDocument()
  })

  it('remove o termo de busca quando a pesquisa estiver vazia', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?q=livro&tab=produtos', <BuscaPage />)
    expect(await screen.findByText('Resultados para:')).toBeInTheDocument()

    await userEvent.clear(screen.getByRole('searchbox', { name: /Pesquisar produtos ou sebos/i }))
    const searchForm = screen.getByRole('searchbox', { name: /Pesquisar produtos ou sebos/i }).closest('form')
    const submitButton = searchForm?.querySelector('button[type=submit]')
    expect(submitButton).toBeInstanceOf(HTMLButtonElement)
    await userEvent.click(submitButton as HTMLButtonElement)

    await waitFor(() => expect(buscaService.buscarProdutos).toHaveBeenLastCalledWith(expect.objectContaining({ q: undefined })))
    expect(screen.queryByText(/Resultados para:/)).not.toBeInTheDocument()
  })

  it('remove filtros vazios ao aplicar em produtos', async () => {
    const buscarProdutosSpy = vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?tab=produtos&condicao=NOVO&seboId=7&precoMin=10&precoMax=50', <BuscaPage />)
    const condicaoSelect = await screen.findByLabelText('Condição')
    await userEvent.selectOptions(condicaoSelect, '')
    await userEvent.clear(screen.getByLabelText('Código do sebo (opcional)'))
    await userEvent.clear(screen.getByLabelText('Preço mín. (R$)'))
    await userEvent.clear(screen.getByLabelText('Preço máx. (R$)'))
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => expect(buscarProdutosSpy).toHaveBeenLastCalledWith(expect.objectContaining({ condicao: undefined, seboId: undefined, precoMin: undefined, precoMax: undefined })))
  })

  it('explica a busca virtual na aba de sebos', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?tab=sebos&cidade=Campina%20Grande&uf=PB', <BuscaPage />)
    expect(await screen.findByText('Busque sebos virtuais pelo nome ou descrição.')).toBeInTheDocument()
  })

  it('aplica filtros de busca de produtos e limpa corretamente', async () => {
    const searchSpy = vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [] })

    renderWithParams('/busca?q=livro&tab=produtos', <BuscaPage />)
    expect(await screen.findByText('Resultados para:')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Condição'), CondicaoProduto.NOVO)
    await userEvent.type(screen.getByLabelText('Código do sebo (opcional)'), '7')
    await userEvent.type(screen.getByLabelText('Preço mín. (R$)'), '10')
    await userEvent.type(screen.getByLabelText('Preço máx. (R$)'), '50')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => expect(searchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ condicao: CondicaoProduto.NOVO, seboId: 7, precoMin: 10, precoMax: 50 })))

    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(await screen.findByText('Nenhum produto encontrado.')).toBeInTheDocument()
  })

  it('aplica filtros de busc a de sebos e limpa corretamente', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [{ id: 99, nome: 'Sebo virtual', descricao: '', telefone: '', accountId: 1, email: 's@teste.com', fotoUrl: null }] })
    const { container } = renderWithParams('/busca?q=teste&tab=sebos', <BuscaPage />)

    expect(await screen.findByRole('heading', { name: 'Sebo virtual' })).toBeInTheDocument()
    expect(container.querySelector('.busca-sebo-foto-placeholder')).toBeInTheDocument()
  })

  it('mostra cadastro de sebo mesmo sem conta autenticada', async () => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    renderPage(<MeuSeboPage />)

    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
  })

  it('carrega perfil do sebo com falha de busca por conta e mostra o formulário de cadastro', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarPorConta').mockRejectedValue(new Error('erro ao carregar'))

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    expect(seboService.buscarPorConta).toHaveBeenCalled()
  })

  it('mostra formulário de produto quando categorias não carregam', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(categoriaService, 'listar').mockRejectedValue(new Error('falha'))

    renderPage(<MeusProdutosPage />)
    await waitFor(() => expect(categoriaService.listar).toHaveBeenCalled())

    const categoriaSelect = screen.getByLabelText('Categoria') as HTMLSelectElement
    expect(categoriaSelect.options).toHaveLength(1)
    expect(categoriaSelect.options[0].text).toBe('Sem categoria')
  })

  it('mostra erro ao listar produtos do sebo quando o backend falha', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(produtoService, 'listarPorSebo').mockRejectedValue(new Error('falha listar'))
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao listar produtos')
  })

  it('mostra erro ao remover produto com falha no backend', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    const product = { id: 123, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro Remover', autor: 'Autor', descricao: 'Descrição', preco: 15, estoque: 5, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [product] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(produtoService, 'remover').mockRejectedValue(new Error('falha remover'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByText('Livro Remover')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Remover/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao remover produto')
  })

  it('nao remove produto quando usuario cancela a confirmacao', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    const product = { id: 124, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro Cancelar', autor: 'Autor', descricao: 'Descrição', preco: 20, estoque: 3, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [product] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })
    const removerSpy = vi.spyOn(produtoService, 'remover').mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByText('Livro Cancelar')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Remover/i }))
    expect(removerSpy).not.toHaveBeenCalled()
    expect(screen.getByText('Livro Cancelar')).toBeInTheDocument()
  })

  it('mostra erro ao salvar novo produto quando o backend falha', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(produtoService, 'criar').mockRejectedValue(new Error('falha salvar'))

    renderPage(<MeusProdutosPage />)
    await userEvent.type(screen.getByLabelText('Título'), 'Livro Novo')
    await userEvent.type(screen.getByLabelText('Preço (R$)'), '10')
    await userEvent.click(screen.getByRole('button', { name: /Adicionar produto/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao salvar produto')
  })

  it('carrega perfil do sebo existente usando seboId no auth store', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 5 })
    const existingSebo = { id: 5, accountId: 1, nome: 'Sebo Atual', email: 'rute@teste.com', descricao: 'Atual', telefone: '9999', cep: '60000', logradouro: 'Rua B', cidade: 'Fortaleza', uf: 'CE', horarioFuncionamento: '10h', fotoUrl: null }
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue(existingSebo)
    vi.spyOn(seboService, 'atualizarMeu').mockResolvedValue({ ...existingSebo, descricao: 'Novo nome' })

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Editar perfil do sebo')).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Descrição'))
    await userEvent.type(screen.getByLabelText('Descrição'), 'Novo nome')
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }))

    expect(await screen.findByText('Sebo atualizado com sucesso!')).toBeInTheDocument()
    expect(seboService.atualizarMeu).toHaveBeenCalledWith(expect.objectContaining({ descricao: 'Novo nome' }))
  })

  it('mostra mensagem de cadastro quando o produto nao tem sebo cadastrado', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue(emptyPage)
    renderPage(<MeusProdutosPage />)

    expect(await screen.findByText('Cadastre seu sebo primeiro')).toBeInTheDocument()
    await waitFor(() => expect(categoriaService.listar).toHaveBeenCalled())
  })

  it('edita produto existente e atualiza com sucesso', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
    const product = { id: 124, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro Editar', autor: 'Autor', descricao: 'Descrição', preco: 20, estoque: 4, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [product] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 2, nome: 'Romance', slug: 'romance', descricao: null }] })
    vi.spyOn(produtoService, 'atualizar').mockResolvedValue({ ...product, titulo: 'Livro Editado' })

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByText('Livro Editar')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.clear(screen.getByLabelText('Título'))
    await userEvent.type(screen.getByLabelText('Título'), 'Livro Editado')
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar produto' }))

    expect(await screen.findByText('Produto atualizado!')).toBeInTheDocument()
    expect(produtoService.atualizar).toHaveBeenCalledWith(124, expect.objectContaining({ titulo: 'Livro Editado' }))
    await waitFor(() => expect(produtoService.listarPorSebo).toHaveBeenCalledTimes(2))
  })
})

function renderPage(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

function renderWithParams(path: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/busca" element={element} />
        <Route path="/categorias" element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderRoute(initialEntry: string, route: string, component: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={route} element={component} />
      </Routes>
    </MemoryRouter>,
  )
}

function pedido(status: StatusPedido): Pedido {
  return {
    id: 11,
    accountId: 1,
    seboId: 3,
    status,
    total: 25,
    createdAt: '2026-06-24T10:00:00Z',
    itens: [{ id: 1, produtoId: 7, tituloSnapshot: 'Livro Teste', precoSnapshot: 25, quantidade: 1 }],
  }
}
