import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminPage } from '../pages/AdminPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { adminService } from '../services/adminService'
import { useAuthStore } from '../store/authStore'
import { AccountType, type Account } from '../types/account'
import type { Page } from '../types/common'

vi.mock('../services/adminService', () => ({
  adminService: {
    dashboard: vi.fn(),
    listarUsuarios: vi.fn(),
    alterarStatusUsuario: vi.fn(),
    listarProdutos: vi.fn(),
    alterarStatusProduto: vi.fn(),
    listarSebos: vi.fn(),
    geocodificarSebo: vi.fn(),
    listarPedidos: vi.fn(),
    listarAuditoria: vi.fn(),
  },
}))

const emptyPage: Page<never> = {
  content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true,
}

describe('administração', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.mocked(adminService.dashboard).mockResolvedValue({ usuarios: 0, usuariosAtivos: 0, sebos: 0, produtos: 0, produtosAtivos: 0, pedidos: 0, pedidosPorStatus: {} })
    vi.mocked(adminService.listarUsuarios).mockResolvedValue(emptyPage)
    vi.mocked(adminService.listarProdutos).mockResolvedValue(emptyPage)
    vi.mocked(adminService.listarSebos).mockResolvedValue(emptyPage)
    vi.mocked(adminService.listarPedidos).mockResolvedValue(emptyPage)
    vi.mocked(adminService.listarAuditoria).mockResolvedValue(emptyPage)
  })

  it('permite acesso ao painel somente para uma conta ADMIN', () => {
    authenticate(AccountType.ADMIN)
    const view = renderAdminRoute()
    expect(screen.getByText('Painel permitido')).toBeInTheDocument()

    view.unmount()
    authenticate(AccountType.USUARIO)
    renderAdminRoute()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.queryByText('Painel permitido')).not.toBeInTheDocument()
  })

  it('carrega usuários, protege contas administrativas e permite desativar uma conta comum', async () => {
    const user = userEvent.setup()
    vi.mocked(adminService.listarUsuarios).mockResolvedValue({
      ...emptyPage,
      totalElements: 2,
      totalPages: 1,
      content: [
        { id: 1, name: 'Administrador', email: 'admin@vitral.com', type: AccountType.ADMIN, ativo: true, createdAt: '2026-01-01T10:00:00Z' },
        { id: 2, name: 'Maria', email: 'maria@vitral.com', type: AccountType.USUARIO, ativo: true, createdAt: '2026-01-02T10:00:00Z' },
      ],
    })
    vi.mocked(adminService.alterarStatusUsuario).mockResolvedValue({
      id: 2, name: 'Maria', email: 'maria@vitral.com', type: AccountType.USUARIO,
      ativo: false, createdAt: '2026-01-02T10:00:00Z',
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<MemoryRouter><AdminPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Usuarios' }))
    expect(await screen.findByText('Maria')).toBeInTheDocument()
    expect(screen.getByText('Protegida')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Desativar' }))

    expect(window.confirm).toHaveBeenCalledWith('Deseja desativar a conta de Maria?')
    expect(adminService.alterarStatusUsuario).toHaveBeenCalledWith(2, false)
    expect(await screen.findByText('Conta desativada com sucesso.')).toBeInTheDocument()
  })

  it('mostra estados de carregamento, vazio e erro de forma clara', async () => {
    let rejectRequest: (reason: Error) => void = () => undefined
    vi.mocked(adminService.listarUsuarios).mockReturnValue(new Promise((_resolve, reject) => { rejectRequest = reject }))
    const user = userEvent.setup()
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Usuarios' }))

    expect(screen.getByText('Carregando usuários')).toBeInTheDocument()
    rejectRequest(new Error('indisponível'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os usuários.')

    vi.mocked(adminService.listarUsuarios).mockResolvedValue(emptyPage)
    await user.type(screen.getByRole('searchbox', { name: 'Pesquisar usuários' }), 'ninguém')
    await waitFor(() => expect(screen.getByText('Nenhum registro em usuários')).toBeInTheDocument())
  })

  it('exibe métricas, moderação e auditoria sem dados privados', async () => {
    const user = userEvent.setup()
    vi.mocked(adminService.dashboard).mockResolvedValue({ usuarios: 12, usuariosAtivos: 10, sebos: 3, produtos: 40, produtosAtivos: 35, pedidos: 8, pedidosPorStatus: { CONFIRMADO: 5 } })
    vi.mocked(adminService.listarAuditoria).mockResolvedValue({
      ...emptyPage, totalElements: 1, totalPages: 1,
      content: [{ id: 1, adminId: 9, adminNome: 'Admin', adminEmail: 'admin@vitral.com', acao: 'DESATIVOU', entidade: 'CONTA', entidadeId: 2, descricao: 'Conta desativada', createdAt: '2026-01-03T10:00:00Z' }],
    })
    render(<MemoryRouter><AdminPage /></MemoryRouter>)

    expect(await screen.findByText('40')).toBeInTheDocument()
    expect(screen.getByText('Produtos ativos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Moderacao' }))
    await waitFor(() => expect(adminService.listarUsuarios).toHaveBeenCalledWith(0, '', undefined, false))
    expect(adminService.listarProdutos).toHaveBeenCalledWith(0, '', false)

    await user.click(screen.getByRole('button', { name: 'Auditoria' }))
    expect(await screen.findByText('Conta desativada')).toBeInTheDocument()
    expect(screen.queryByText(/passwordHash|token|cpf/i)).not.toBeInTheDocument()
  })

  it('permite tentar novamente a localização de um sebo pendente', async () => {
    const user = userEvent.setup()
    const store = {
      id: 7, nome: 'Sebo Central', responsavel: 'João', contaAtiva: true,
      status: 'VERIFICADO' as const, createdAt: '2026-01-03T10:00:00Z', ultimaAtividade: null,
      produtosAtivos: 4, produtosInativos: 1, localizacaoDisponivel: false,
    }
    vi.mocked(adminService.listarSebos).mockResolvedValue({
      ...emptyPage, totalElements: 1, totalPages: 1, content: [store],
    })
    vi.mocked(adminService.geocodificarSebo).mockResolvedValue({ ...store, localizacaoDisponivel: true })

    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Sebos' }))
    await user.click(await screen.findByRole('button', { name: 'Tentar localizar Sebo Central novamente' }))

    expect(adminService.geocodificarSebo).toHaveBeenCalledWith(7)
    expect(await screen.findByRole('status')).toHaveTextContent('Localização do sebo atualizada com sucesso.')
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar localizar Sebo Central novamente' })).not.toBeInTheDocument()
  })

  it('mantém a nova tentativa disponível quando a localização não é encontrada', async () => {
    const user = userEvent.setup()
    const store = {
      id: 8, nome: 'Sebo Bairro', responsavel: 'Ana', contaAtiva: true,
      status: 'PENDENTE' as const, createdAt: '2026-01-04T10:00:00Z', ultimaAtividade: null,
      produtosAtivos: 0, produtosInativos: 0, localizacaoDisponivel: false,
    }
    vi.mocked(adminService.listarSebos).mockResolvedValue({
      ...emptyPage, totalElements: 1, totalPages: 1, content: [store],
    })
    vi.mocked(adminService.geocodificarSebo).mockResolvedValue(store)

    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Sebos' }))
    await user.click(await screen.findByRole('button', { name: 'Tentar localizar Sebo Bairro novamente' }))

    expect(await screen.findByRole('status')).toHaveTextContent('O endereço ainda não pôde ser localizado.')
    expect(screen.getByRole('button', { name: 'Tentar localizar Sebo Bairro novamente' })).toBeEnabled()
  })
})

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<div>Início</div>} />
        <Route path="/auth" element={<div>Autenticação</div>} />
        <Route path="/admin" element={<ProtectedRoute requireRole={AccountType.ADMIN}><div>Painel permitido</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  )
}

function authenticate(type: AccountType) {
  const account: Account = { id: 1, name: 'Conta', username: 'conta', email: 'conta@vitral.com', type }
  useAuthStore.setState({ token: 'token', account, seboId: null })
}
