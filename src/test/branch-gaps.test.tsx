import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Input } from '../components/ui/Input'
import { CartPage } from '../components/Cart/CartPage'
import { ReservationsPage } from '../components/Reservations/ReservationsPage'
import { SaleConfirmationPage } from '../components/Sales/SaleConfirmationPage'
import { SalesHistoryPage } from '../components/Sales/SalesHistoryPage'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { cestaService } from '../services/cestaService'
import { pedidoService } from '../services/pedidoService'
import { produtoService } from '../services/produtoService'
import { categoriaService } from '../services/categoriaService'
import { seboService } from '../services/seboService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'
import { StatusPedido } from '../types/pedido'
import type { CestaItem } from '../types/cesta'
import type { Pedido } from '../types/pedido'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

function makePedido(status: StatusPedido, id = 11): Pedido {
  return {
    id,
    accountId: 1,
    seboId: 3,
    status,
    total: 50,
    createdAt: '2026-06-24T10:00:00Z',
    itens: [{ id: 1, produtoId: 7, tituloSnapshot: 'Livro Teste', precoSnapshot: 50, quantidade: 1 }],
  }
}

function renderPage(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

function renderRoute(path: string, route: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Input', () => {
  it('renderiza sem label quando a prop label nao e fornecida', () => {
    const { container } = render(<Input id="sem-label" placeholder="Digite algo" />)
    expect(container.querySelector('.vit-input-label')).not.toBeInTheDocument()
    expect(container.querySelector('#sem-label')).toBeInTheDocument()
  })

  it('renderiza com label quando a prop e fornecida', () => {
    render(<Input id="com-label" label="Meu campo" />)
    expect(screen.getByText('Meu campo')).toBeInTheDocument()
  })

  it('aplica className vazia sem quebrar quando className nao e fornecida', () => {
    const { container } = render(<Input id="no-class" />)
    const input = container.querySelector('#no-class')
    expect(input?.className).toContain('vit-input')
  })
})

describe('CartPage — branches adicionais', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('exibe "1 item" no resumo do carrinho', async () => {
    const item: CestaItem = {
      id: 1, produtoId: 7, titulo: 'Livro Singular', autor: 'Autor',
      preco: 30, quantidade: 1, subtotal: 30, estoqueDisponivel: 5,
      condicao: CondicaoProduto.NOVO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    renderPage(<CartPage />)
    expect(await screen.findByText(/1 item na cesta/)).toBeInTheDocument()
  })

  it('exibe "N itens" no resumo do carrinho', async () => {
    const item: CestaItem = {
      id: 1, produtoId: 7, titulo: 'Livro Plural', autor: 'Autor',
      preco: 20, quantidade: 3, subtotal: 60, estoqueDisponivel: 5,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    renderPage(<CartPage />)
    expect(await screen.findByText(/3 itens na cesta/)).toBeInTheDocument()
  })

  it('exibe "Autor nao informado" quando autor e null', async () => {
    const item: CestaItem = {
      id: 1, produtoId: 8, titulo: 'Sem Autor', autor: null,
      preco: 10, quantidade: 1, subtotal: 10, estoqueDisponivel: 2,
      condicao: CondicaoProduto.SEMINOVO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    renderPage(<CartPage />)
    expect(await screen.findByText(/Autor nao informado/)).toBeInTheDocument()
  })

  it('exibe placeholder de imagem quando fotoUrl e null', async () => {
    const item: CestaItem = {
      id: 1, produtoId: 9, titulo: 'Sem Foto', autor: 'Autor',
      preco: 15, quantidade: 1, subtotal: 15, estoqueDisponivel: 3,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    renderPage(<CartPage />)
    expect(await screen.findByText('Sem imagem')).toBeInTheDocument()
  })
})

describe('CartPage — branch de clamp de quantidade', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('atualiza quantidade limitando ao estoque disponivel', async () => {
    const { fireEvent } = await import('@testing-library/react')
    const item: CestaItem = {
      id: 1, produtoId: 7, titulo: 'Livro Clamp', autor: 'Autor',
      preco: 20, quantidade: 1, subtotal: 20, estoqueDisponivel: 3,
      condicao: CondicaoProduto.USADO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    const atualizarSpy = vi.spyOn(cestaService, 'atualizarQuantidade').mockResolvedValue({ mensagem: 'Quantidade atualizada' })
    renderPage(<CartPage />)

    expect(await screen.findByText('Livro Clamp')).toBeInTheDocument()
    const input = screen.getByRole('spinbutton', { name: /Qtd\./i })
    fireEvent.change(input, { target: { value: '10' } })
    await waitFor(() => expect(atualizarSpy).toHaveBeenCalledWith(7, 3))
  })

  it('atualiza quantidade limitando ao minimo de 1', async () => {
    const { fireEvent } = await import('@testing-library/react')
    const item: CestaItem = {
      id: 1, produtoId: 8, titulo: 'Livro Min', autor: 'Autor',
      preco: 15, quantidade: 2, subtotal: 30, estoqueDisponivel: 5,
      condicao: CondicaoProduto.NOVO, fotoUrl: null,
    }
    vi.spyOn(cestaService, 'listar').mockResolvedValue([item])
    const atualizarSpy = vi.spyOn(cestaService, 'atualizarQuantidade').mockResolvedValue({ mensagem: 'Quantidade atualizada' })
    renderPage(<CartPage />)

    expect(await screen.findByText('Livro Min')).toBeInTheDocument()
    const input = screen.getByRole('spinbutton', { name: /Qtd\./i })
    fireEvent.change(input, { target: { value: '0' } })
    await waitFor(() => expect(atualizarSpy).toHaveBeenCalledWith(8, 1))
  })
})

describe('ReservationsPage — branches adicionais', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('exibe estado vazio quando pedido tem status CONFIRMADO', async () => {
    const pedido = makePedido(StatusPedido.CONFIRMADO, 20)
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<ReservationsPage />)
    expect(await screen.findByText('Nenhuma reserva em aberto')).toBeInTheDocument()
  })

  it('exibe estado vazio quando pedido tem status CANCELADO', async () => {
    const pedido = makePedido(StatusPedido.CANCELADO, 21)
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<ReservationsPage />)
    expect(await screen.findByText('Nenhuma reserva em aberto')).toBeInTheDocument()
  })

  it('exibe erro ao cancelar pedido quando o backend falha', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO, 22)
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockResolvedValue({ ...emptyPage, content: [pedido] })
    vi.spyOn(pedidoService, 'cancelarPedido').mockRejectedValue(new Error('falha ao cancelar'))
    renderPage(<ReservationsPage />)

    expect(await screen.findByText('Pedido #22')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    expect(await screen.findByText('Nao foi possivel cancelar o pedido.')).toBeInTheDocument()
  })

  it('mostra erro ao carregar reservas quando o backend falha', async () => {
    vi.spyOn(pedidoService, 'listarMeusPedidos').mockRejectedValue(new Error('offline'))
    renderPage(<ReservationsPage />)
    expect(await screen.findByText('Erro ao carregar reservas')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar suas reservas.')).toBeInTheDocument()
  })
})

describe('SalesHistoryPage — branches adicionais', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('exibe label "Confirmado" para pedido com status CONFIRMADO', async () => {
    const pedido = makePedido(StatusPedido.CONFIRMADO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<SalesHistoryPage />)
    expect(await screen.findByText('Confirmado')).toBeInTheDocument()
  })

  it('exibe label "Cancelado" para pedido com status CANCELADO', async () => {
    const pedido = makePedido(StatusPedido.CANCELADO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<SalesHistoryPage />)
    expect(await screen.findByText('Cancelado')).toBeInTheDocument()
  })

  it('exibe lista vazia quando pedido tem status AGUARDANDO_CONFIRMACAO', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<SalesHistoryPage />)
    expect(await screen.findByText('Nenhuma venda processada')).toBeInTheDocument()
  })

  it('mostra erro ao carregar historico quando o backend falha', async () => {
    vi.spyOn(pedidoService, 'listarVendas').mockRejectedValue(new Error('servidor fora'))
    renderPage(<SalesHistoryPage />)
    expect(await screen.findByText('Erro ao carregar histórico')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar o histórico de vendas.')).toBeInTheDocument()
  })
})

describe('SaleConfirmationPage — branches adicionais', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('mostra erro ao carregar pedido quando listarVendas falha', async () => {
    vi.spyOn(pedidoService, 'listarVendas').mockRejectedValue(new Error('erro de rede'))
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)
    expect(await screen.findByText('Erro ao carregar pedido')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar o pedido.')).toBeInTheDocument()
  })

  it('mostra erro ao recusar venda quando atualizarStatus falha', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    vi.spyOn(pedidoService, 'atualizarStatus').mockRejectedValue(new Error('falha ao recusar'))
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Recusar venda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Recusar venda' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel atualizar o pedido.')
  })

  it('exibe mensagem de cancelamento ao recusar venda com sucesso', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    vi.spyOn(pedidoService, 'atualizarStatus').mockResolvedValue({ ...pedido, status: StatusPedido.CANCELADO })
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Recusar venda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Recusar venda' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Pedido cancelado com sucesso.')
  })

  it('exibe link para historico quando pedido ja esta confirmado', async () => {
    const pedido = makePedido(StatusPedido.CONFIRMADO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)
    expect(await screen.findByRole('link', { name: 'Ver histórico de vendas' })).toBeInTheDocument()
  })

  it('mostra estado "Confirmando..." no botao enquanto confirma', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    let resolveFn!: () => void
    vi.spyOn(pedidoService, 'atualizarStatus').mockReturnValue(
      new Promise((res) => { resolveFn = () => res({ ...pedido, status: StatusPedido.CONFIRMADO }) }),
    )
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Confirmar venda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar venda' }))
    expect(await screen.findByText('Confirmando...')).toBeInTheDocument()
    resolveFn()
    expect(await screen.findByText('Pedido confirmado com sucesso.')).toBeInTheDocument()
  })

  it('mostra estado "Cancelando..." no botao enquanto recusa', async () => {
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    let resolveFn!: () => void
    vi.spyOn(pedidoService, 'atualizarStatus').mockReturnValue(
      new Promise((res) => { resolveFn = () => res({ ...pedido, status: StatusPedido.CANCELADO }) }),
    )
    renderRoute('/vendas/11/confirmar', '/vendas/:orderId/confirmar', <SaleConfirmationPage />)

    expect(await screen.findByText('Recusar venda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Recusar venda' }))
    expect(await screen.findByText('Cancelando...')).toBeInTheDocument()
    resolveFn()
    expect(await screen.findByText('Pedido cancelado com sucesso.')).toBeInTheDocument()
  })
})

describe('MeuSeboPage — branches adicionais', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(pedidoService, 'buscarFaturamentoMensal').mockResolvedValue([])
  })

  it('cadastra novo sebo apenas com dados virtuais', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    const novoSebo = { id: 10, accountId: 1, nome: 'Rute', email: 'rute@teste.com', descricao: 'Desc', telefone: '99', fotoUrl: null }
    vi.spyOn(seboService, 'criar').mockResolvedValue(novoSebo)

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByText('Sebo cadastrado com sucesso!')).toBeInTheDocument()
    expect(seboService.criar).toHaveBeenCalledWith({ cnpj: '12345678000199', descricao: '', telefone: '', fotoUrl: '', tipoOperacao: 'VIRTUAL' })
  })

  it('envia descricao e telefone do sebo virtual', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    const novoSebo = { id: 11, accountId: 1, nome: 'Rute', email: 'rute@teste.com', descricao: 'x', telefone: '99', fotoUrl: null }
    vi.spyOn(seboService, 'criar').mockResolvedValue(novoSebo)

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.type(screen.getByLabelText('Descrição'), 'x')
    await userEvent.type(screen.getByLabelText('Telefone'), '99')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    await waitFor(() => expect(seboService.criar).toHaveBeenCalledWith(expect.objectContaining({ descricao: 'x', telefone: '99' })))
  })

  it('mostra erro ao salvar sebo quando o backend falha', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    vi.spyOn(seboService, 'criar').mockRejectedValue(new Error('falha ao salvar'))

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao salvar o sebo')
  })
})

describe('MeuSeboPage — branch sem account e sem seboId', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('exibe formulario de cadastro quando account e seboId sao null', async () => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
  })

  it('exibe estado de loading antes de completar a busca', () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockReturnValue(new Promise(() => {}))
    renderPage(<MeuSeboPage />)
    expect(screen.getByText('Carregando perfil do sebo')).toBeInTheDocument()
  })

  it('popula o formulario com dados do sebo existente via seboId', async () => {
    const existingSebo = { id: 5, accountId: 1, nome: 'Sebo Test', email: 'a@b.com', descricao: 'Desc', telefone: '111', cep: '11111', logradouro: 'Rua A', cidade: 'SP', uf: 'SP', horarioFuncionamento: '8h', fotoUrl: 'http://foto.png' }
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 5 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue(existingSebo)

    renderPage(<MeuSeboPage />)
    expect(await screen.findByDisplayValue('Desc')).toBeInTheDocument()
    expect(screen.getByAltText('Preview da imagem selecionada')).toHaveAttribute('src', 'http://foto.png')
  })

  it('popula o formulario com string vazia para campos opcionais null', async () => {
    const sebolNullFields = { id: 6, accountId: 1, nome: 'Sebo Null', email: 'a@b.com', descricao: null, telefone: null, cep: null, logradouro: null, cidade: null, uf: null, horarioFuncionamento: null, fotoUrl: null }
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 6 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue(sebolNullFields as never)

    renderPage(<MeuSeboPage />)
    expect(await screen.findByText('Editar perfil do sebo')).toBeInTheDocument()
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect((input as HTMLInputElement).value).toBe('')
    })
  })
})

describe('MeusProdutosPage — branches adicionais', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.SEBO }, seboId: 3 })
  })

  it('exibe "-" para autor nulo e categoria nula no catalogo', async () => {
    const product = { id: 10, seboId: 3, categoriaId: null, categoriaNome: null, titulo: 'Livro Null', autor: null, descricao: 'Desc', preco: 10, estoque: 1, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [product] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByText('Livro Null')).toBeInTheDocument()
    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThanOrEqual(2)
  })

  it('seleciona categoria "Sem categoria" ao escolher opcao vazia', async () => {
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 2, nome: 'Romance', slug: 'romance', descricao: null }] })

    renderPage(<MeusProdutosPage />)
    await waitFor(() => expect(categoriaService.listar).toHaveBeenCalled())

    const select = screen.getByLabelText('Categoria') as HTMLSelectElement
    await userEvent.selectOptions(select, '2')
    expect(select.value).toBe('2')
    await userEvent.selectOptions(select, '')
    expect(select.value).toBe('')
  })

  it('exibe estoque "0" quando produto tem estoque null', async () => {
    const product = { id: 11, seboId: 3, categoriaId: null, categoriaNome: null, titulo: 'Sem Estoque', autor: 'Autor', descricao: 'Desc', preco: 10, estoque: null, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [product as never] })
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [] })

    renderPage(<MeusProdutosPage />)
    expect(await screen.findByText('Sem Estoque')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows.some(r => r.textContent?.includes('0'))).toBe(true)
  })
})

describe('SalesOrdersPage — branches adicionais', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('mostra erro ao carregar compras recebidas quando o backend falha', async () => {
    const { SalesOrdersPage } = await import('../components/Sales/SalesOrdersPage')
    vi.spyOn(pedidoService, 'listarVendas').mockRejectedValue(new Error('servidor fora'))
    renderPage(<SalesOrdersPage />)
    expect(await screen.findByText('Erro ao carregar compras')).toBeInTheDocument()
    expect(screen.getByText('Nao foi possivel carregar as compras recebidas.')).toBeInTheDocument()
  })

  it('exibe pedidos aguardando confirmacao com link para responder', async () => {
    const { SalesOrdersPage } = await import('../components/Sales/SalesOrdersPage')
    const pedido = makePedido(StatusPedido.AGUARDANDO_CONFIRMACAO, 33)
    vi.spyOn(pedidoService, 'listarVendas').mockResolvedValue({ ...emptyPage, content: [pedido] })
    renderPage(<SalesOrdersPage />)
    expect(await screen.findByText('Pedido #33')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Responder pedido' })).toBeInTheDocument()
  })
})
