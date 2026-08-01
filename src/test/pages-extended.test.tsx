import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthPage } from '../pages/AuthPage'
import { BuscaPage } from '../pages/BuscaPage'
import { CategoriesPage } from '../components/Categories/CategoriesPage'
import { ConfirmarEmailPage } from '../pages/ConfirmarEmailPage'
import { HomePage } from '../pages/HomePage'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OffersPage } from '../components/Offers/OffersPage'
import { PerfilPage } from '../pages/PerfilPage'
import { HelpPage } from '../components/Help/HelpPage'
import { SupportPage } from '../components/Support/SupportPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { authService } from '../services/authService'
import { buscaService } from '../services/buscaService'
import { categoriaService } from '../services/categoriaService'
import { homeService } from '../services/homeService'
import { ofertaService } from '../services/ofertaService'
import { produtoService } from '../services/produtoService'
import { pedidoService } from '../services/pedidoService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }
const account = { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.USUARIO, cpf: '52998224725', cep: '60000000', logradouro: 'Rua A', numero: '1', complemento: null, bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' }
const sebo = { id: 3, accountId: 1, nome: 'Sebo Central', email: 'rute@teste.com', descricao: 'Raros', telefone: '9999', fotoUrl: null }
const produto = { id: 7, seboId: 3, categoriaId: 2, categoriaNome: 'Romance', titulo: 'Livro Teste', autor: 'Autor', descricao: 'Descrição', preco: 25, estoque: 2, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true }

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

describe('paginas principais', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.spyOn(pedidoService, 'buscarFaturamentoMensal').mockResolvedValue([])
  })

  it('valida cadastro e conclui novo cadastro', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({ mensagem: 'Confira seu e-mail' })
    renderAt('/auth', <AuthPage />)
    const fields = screen.getAllByLabelText(/Senha/)
    await userEvent.type(screen.getByLabelText('Nome:'), 'Rute')
    await userEvent.type(screen.getByLabelText('Usuário (login):'), 'rute')
    await userEvent.type(screen.getByLabelText('Email:'), 'rute@teste.com')
    await userEvent.type(fields[1], '12345678')
    await userEvent.type(screen.getByLabelText('Confirme sua senha:'), 'diferente')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByText('As senhas nao coincidem')).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Confirme sua senha:'))
    await userEvent.type(screen.getByLabelText('Confirme sua senha:'), '12345678')
    await userEvent.click(screen.getByLabelText('Sou um sebo'))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByText('Confira seu e-mail')).toBeInTheDocument()
    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ type: AccountType.SEBO }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar outra conta' }))
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  })

  it('faz login de usuario e mostra erro de autenticacao', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce({ token: 'jwt', account, expiresIn: 3600 }).mockRejectedValueOnce(new Error('invalido'))
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue(emptyPage)
    renderAt('/auth', <AuthPage />)
    await userEvent.type(screen.getByLabelText('Usuário ou E-mail:'), account.email)
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#login-password' }), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(useAuthStore.getState().token).toBe('jwt'))
  })

  it('mostra erro ao entrar quando credenciais invalidas', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('invalido'))
    renderAt('/auth', <AuthPage />)
    await userEvent.type(screen.getByLabelText('Usuário ou E-mail:'), account.email)
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#login-password' }), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao entrar')
  })

  it('faz login de sebo mesmo quando buscar perfil falha', async () => {
    const seboAccount = { id: 2, name: 'Sebo', username: 'sebo', email: 'sebo@teste.com', type: AccountType.SEBO }
    vi.spyOn(authService, 'login').mockResolvedValue({ token: 'jwt', account: seboAccount, expiresIn: 3600 })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('offline'))

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText('Usuário ou E-mail:'), seboAccount.email)
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#login-password' }), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByText('Home page')).toBeInTheDocument())
    expect(useAuthStore.getState().token).toBe('jwt')
    expect(useAuthStore.getState().seboId).toBeNull()
  })

  it('mostra erro quando o cadastro falha', async () => {
    vi.spyOn(authService, 'register').mockRejectedValue(new Error('erro cadastro'))
    renderAt('/auth', <AuthPage />)

    await userEvent.type(screen.getByLabelText('Nome:'), 'Rute')
    await userEvent.type(screen.getByLabelText('Usuário (login):'), 'rute')
    await userEvent.type(screen.getByLabelText('Email:'), 'rute@teste.com')
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#reg-password' }), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme sua senha:'), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao cadastrar')
  })

  it.each([
    ['/confirmar-email', 'Link de confirmação inválido.'],
    ['/confirmar-email?token=ok', 'E-mail confirmado!'],
    ['/confirmar-email?token=ruim', 'Confirmação falhou'],
  ])('trata confirmacao de email em %s', async (path, expected) => {
    vi.spyOn(authService, 'confirmarEmail').mockImplementation(async (token) => {
      if (token === 'ruim') throw new Error('expirado')
      return { mensagem: 'Conta ativada' }
    })
    renderAt(path, <ConfirmarEmailPage />)
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })

  it('atualiza perfil e persiste a nova conta', async () => {
    useAuthStore.setState({ token: 'jwt', account, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(account)
    vi.spyOn(usuarioService, 'atualizarPerfil').mockResolvedValue({ ...account, name: 'Novo nome' })
    renderAt('/perfil', <PerfilPage />)
    await userEvent.clear(screen.getByLabelText('Nome'))
    await userEvent.type(screen.getByLabelText('Nome'), 'Novo nome')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Perfil atualizado com sucesso.')).toBeInTheDocument()
    expect(useAuthStore.getState().account?.name).toBe('Novo nome')
  })

  it('nao exibe o tipo da conta e mantem o CPF antes da foto no perfil', async () => {
    useAuthStore.setState({ token: 'jwt', account, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(account)
    renderAt('/perfil', <PerfilPage />)

    expect(await screen.findByLabelText('Nome')).toBeInTheDocument()
    expect(screen.queryByLabelText('Tipo da conta')).not.toBeInTheDocument()
    expect(screen.queryByText('USUARIO')).not.toBeInTheDocument()

    const campos = screen.getAllByText(/^(CPF|Foto do perfil)$/).map((item) => item.textContent)
    expect(campos).toEqual(['CPF', 'Foto do perfil'])
  })

  it('mostra erro quando a atualizacao de perfil falha', async () => {
    useAuthStore.setState({ token: 'jwt', account, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(account)
    vi.spyOn(usuarioService, 'atualizarPerfil').mockRejectedValue(new Error('erro'))
    renderAt('/perfil', <PerfilPage />)

    await userEvent.clear(screen.getByLabelText('Nome'))
    await userEvent.type(screen.getByLabelText('Nome'), 'Novo nome')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao atualizar perfil')
  })

  it('cadastra perfil de sebo com endereco obrigatorio', async () => {
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: null })
    const criarSpy = vi.spyOn(seboService, 'criar').mockResolvedValue({
      ...sebo,
      cep: '60123456',
      logradouro: 'Rua dos Livros',
      cidade: 'Fortaleza',
      uf: 'CE',
      horarioFuncionamento: '9h as 18h',
    })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))

    renderAt('/meu-sebo', <MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    expect(screen.queryByLabelText('Modalidade de operação')).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Livros virtuais')
    await userEvent.type(screen.getByLabelText('CEP'), '60123-456')
    await userEvent.type(screen.getByLabelText('Endereço/logradouro'), 'Rua dos Livros')
    await userEvent.type(screen.getByLabelText('Cidade'), 'Fortaleza')
    await userEvent.type(screen.getByLabelText('UF'), 'ce')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Sebo cadastrado com sucesso!')).toBeInTheDocument()
    expect(criarSpy).toHaveBeenCalledWith(expect.objectContaining({
      descricao: 'Livros virtuais',
      cep: '60123456',
      logradouro: 'Rua dos Livros',
      cidade: 'Fortaleza',
      uf: 'CE',
    }))
  })

  it('exibe data de criação e última atividade recente do sebo', async () => {
    const ultimaAtividade = isoDaysAgo(0)
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({
      ...sebo,
      dataCriacao: '2026-07-06',
      ultimaAtividade,
    })

    renderAt('/meu-sebo', <MeuSeboPage />)

    expect(await screen.findByText(/Data de criação:/i)).toBeInTheDocument()
    expect(screen.getByText('06/07/2026')).toBeInTheDocument()
    const activity = screen.getByText(/Última atividade:/i).closest('p')
    expect(activity).toHaveTextContent(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    expect(activity).toHaveClass('seller-activity-fresh')
  })

  it('destaca última atividade antiga em amarelo', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
    try {
      const ultimaAtividade = isoDaysAgo(40)
      useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: 3 })
      vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({
        ...sebo,
        ultimaAtividade,
      })

      renderAt('/meu-sebo', <MeuSeboPage />)

      const activity = (await screen.findByText(/Última atividade:/i)).closest('p')
      expect(activity).toHaveTextContent('Última atividade há 40 dias.')
      expect(activity).toHaveClass('seller-activity-stale')
    } finally {
      vi.useRealTimers()
    }
  })

  it('destaca vendedor sem atividade há mais de noventa dias em vermelho', async () => {
    const ultimaAtividade = isoDaysAgo(100)
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({
      ...sebo,
      ultimaAtividade,
    })

    renderAt('/meu-sebo', <MeuSeboPage />)

    const activity = (await screen.findByText(/Última atividade:/i)).closest('p')
    expect(activity).toHaveTextContent('Vendedor sem atividade há mais de 90 dias.')
    expect(activity).toHaveClass('seller-activity-inactive')
  })

  it('exibe fallback seguro quando datas do sebo vêm ausentes ou inválidas', async () => {
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({
      ...sebo,
      dataCriacao: 'data-invalida',
      ultimaAtividade: null,
    })

    renderAt('/meu-sebo', <MeuSeboPage />)

    const activity = (await screen.findByText(/Última atividade:/i)).closest('p')
    expect(activity).toHaveTextContent('Sem atividade registrada')
    expect(activity).toHaveClass('seller-activity-neutral')
    expect(screen.queryByText(/Data de criação:/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/data-invalida/)).not.toBeInTheDocument()
  })

  it('exibe o endereco do sebo preenchido no perfil', async () => {
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: 3 })
    const seboComEndereco = {
      ...sebo,
      cep: '60123456',
      logradouro: 'Rua dos Livros',
      cidade: 'Fortaleza',
      uf: 'CE',
      horarioFuncionamento: '9h às 18h',
    }
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue(seboComEndereco)

    renderAt('/meu-sebo', <MeuSeboPage />)

    expect(await screen.findByLabelText('CEP')).toHaveValue('60123456')
    expect(screen.getByLabelText('Endereço/logradouro')).toHaveValue('Rua dos Livros')
    expect(screen.getByLabelText('Cidade')).toHaveValue('Fortaleza')
    expect(screen.getByLabelText('UF')).toHaveValue('CE')
  })

  it('atualiza perfil do sebo existente com sucesso', async () => {
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: null })
    const existingSebo = { ...sebo, descricao: 'Velho sebo', telefone: '0000', cep: '60123456', logradouro: 'Rua dos Livros', cidade: 'Fortaleza', uf: 'CE' }
    const buscarMeuSpy = vi.spyOn(seboService, 'buscarMeu').mockResolvedValue(existingSebo)
    vi.spyOn(seboService, 'atualizarMeu').mockResolvedValue({ ...existingSebo, descricao: 'Novo sebo' })

    renderAt('/meu-sebo', <MeuSeboPage />)
    await waitFor(() => expect(buscarMeuSpy).toHaveBeenCalled())
    expect(await screen.findByText('Editar perfil do sebo')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.clear(screen.getByLabelText('Descrição'))
    await userEvent.type(screen.getByLabelText('Descrição'), 'Novo sebo')
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }))

    expect(await screen.findByText('Sebo atualizado com sucesso!')).toBeInTheDocument()
    expect(seboService.atualizarMeu).toHaveBeenCalledWith(expect.objectContaining({ descricao: 'Novo sebo' }))
  })

  it('mostra erro ao cadastrar perfil do sebo', async () => {
    useAuthStore.setState({ token: 'jwt', account: { ...account, type: AccountType.SEBO }, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    vi.spyOn(seboService, 'criar').mockRejectedValue(new Error('falha'))

    renderAt('/meu-sebo', <MeuSeboPage />)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('CNPJ'), '12345678000199')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Livros virtuais')
    await userEvent.type(screen.getByLabelText('CEP'), '60123456')
    await userEvent.type(screen.getByLabelText('Endereço/logradouro'), 'Rua dos Livros')
    await userEvent.type(screen.getByLabelText('Cidade'), 'Fortaleza')
    await userEvent.type(screen.getByLabelText('UF'), 'CE')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao salvar o sebo')
  })

  it('carrega home com produtos e apresenta falha da busca', async () => {
    vi.spyOn(homeService, 'carregar')
      .mockResolvedValueOnce({
        lancamentos: { titulo: 'Lançamentos', produtos: [], total: 0 },
        classicos: { titulo: 'Clássicos', produtos: [], total: 0 },
        recentes: { titulo: 'Adicionados recentemente', produtos: [], total: 0 },
        recomendados: null,
        categorias: [{ id: 2, nome: 'Livros', slug: 'livros', produtos: [produto], total: 1 }],
      })
      .mockRejectedValueOnce(new Error('offline'))
    const first = renderAt('/', <HomePage />)
    expect(await screen.findAllByText('Livro Teste')).toHaveLength(1)
    first.unmount()
    renderAt('/', <HomePage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar a vitrine.')
  })

  it('busca produtos, aplica filtros e alterna para sebos', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockResolvedValue({ ...emptyPage, content: [produto], totalElements: 1 })
    vi.spyOn(buscaService, 'buscarSebos').mockResolvedValue({ ...emptyPage, content: [sebo], totalElements: 1 })
    renderAt('/busca?q=livro', <BuscaPage />)
    expect(await screen.findByRole('link', { name: /Livro Teste/ })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Condição'), CondicaoProduto.USADO)
    await userEvent.type(screen.getByLabelText('Preço mín. (R$)'), '10')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await waitFor(() => expect(buscaService.buscarProdutos).toHaveBeenLastCalledWith(expect.objectContaining({ condicao: CondicaoProduto.USADO, precoMin: 10 })))
    await userEvent.click(screen.getByRole('tab', { name: /Sebos/ }))
    expect(await screen.findByRole('heading', { name: 'Sebo Central' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
  })

  it('carrega categorias e mostra produtos da categoria selecionada', async () => {
    vi.spyOn(categoriaService, 'listar').mockResolvedValue({ ...emptyPage, content: [{ id: 1, nome: 'Livros', slug: 'livros', descricao: 'Livros antigos' }, { id: 2, nome: 'CDs', slug: 'cds', descricao: 'Música em CD' }] })
    vi.spyOn(produtoService, 'listarPorCategoria').mockResolvedValue({ ...emptyPage, content: [produto], totalElements: 1 })
    renderAt('/categorias', <CategoriesPage />)

    expect(await screen.findByRole('button', { name: /Livros/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /CDs/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /CDs/ }))

    expect(await screen.findByRole('heading', { name: 'Produtos em CDs' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Livro Teste/ })).toHaveAttribute('href', '/produto/7')
  })

  it('mostra oferta vazia e erro na pagina de ofertas', async () => {
    vi.spyOn(ofertaService, 'listarAtivas').mockResolvedValue({ ...emptyPage, content: [] })
    renderAt('/ofertas', <OffersPage />)
    expect(await screen.findByText('Nenhuma oferta ativa')).toBeInTheDocument()

    vi.spyOn(ofertaService, 'listarAtivas').mockRejectedValue(new Error('offline'))
    renderAt('/ofertas', <OffersPage />)
    expect(await screen.findByText('Nao foi possivel carregar as ofertas.')).toBeInTheDocument()
  })

  it('redireciona visitantes e roles errados em rotas protegidas', async () => {
    const authRoutes = render(<MemoryRouter initialEntries={['/secreto']}>
      <Routes>
        <Route path="/auth" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/secreto" element={<ProtectedRoute><div>segredo</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>)
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    authRoutes.unmount()

    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.USUARIO }, seboId: null })
    const userRoutes = render(<MemoryRouter initialEntries={['/secreto']}>
      <Routes>
        <Route path="/auth" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/secreto" element={<ProtectedRoute requireRole={AccountType.SEBO}><div>segredo</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>)
    expect(await screen.findByText('Home page')).toBeInTheDocument()
    userRoutes.unmount()
  })

  it('loga sebo e recupera perfil do sebo existente na pagina de auth', async () => {
    const loginSpy = vi.fn()
    const setSeboIdSpy = vi.fn()
    useAuthStore.setState({ login: loginSpy, setSeboId: setSeboIdSpy })
    vi.spyOn(authService, 'login').mockResolvedValue({ token: 'jwt', account: { id: 2, name: 'Sebo', username: 'sebo', email: 'sebo@teste.com', type: AccountType.SEBO }, expiresIn: 3600 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue(sebo)

    render(<MemoryRouter initialEntries={['/auth']}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>)

    await userEvent.type(screen.getByLabelText('Usuário ou E-mail:'), 'sebo@teste.com')
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#login-password' }), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(loginSpy).toHaveBeenCalledWith('jwt', expect.objectContaining({ email: 'sebo@teste.com' })))
    expect(setSeboIdSpy).toHaveBeenCalledWith(sebo.id)
    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('valida senha curta no cadastro e mostra erro', async () => {
    renderAt('/auth', <AuthPage />)
    await userEvent.type(screen.getByLabelText('Nome:'), 'Novo')
    await userEvent.type(screen.getByLabelText('Usuário (login):'), 'novo')
    await userEvent.type(screen.getByLabelText('Email:'), 'novo@teste.com')
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#reg-password' }), '123')
    await userEvent.type(screen.getByLabelText('Confirme sua senha:'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByText('A senha deve ter ao menos 8 caracteres')).toBeInTheDocument()
  })

  it('mostra erro ao carregar produtos e sebos na pagina de busca', async () => {
    vi.spyOn(buscaService, 'buscarProdutos').mockRejectedValue(new Error('offline'))
    vi.spyOn(buscaService, 'buscarSebos').mockRejectedValue(new Error('offline'))
    renderAt('/busca?q=livro', <BuscaPage />)
    expect(await screen.findByText('Nao foi possivel carregar os produtos.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: /Sebos/ }))
    expect(await screen.findByText('Nao foi possivel carregar os sebos.')).toBeInTheDocument()
  })

  it('renderiza paginas informativas e rota inexistente', () => {
    const { unmount } = renderAt('/ajuda', <HelpPage />)
    expect(screen.getByRole('region', { name: 'Como usar o Vitral' })).toBeInTheDocument()
    unmount()
    const support = renderAt('/suporte', <SupportPage />)
    expect(screen.getByRole('heading', { name: /Suporte/ })).toBeInTheDocument()
    support.unmount()
    renderAt('/nao-existe', <NotFoundPage />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
  })
})

function renderAt(path: string, element: React.ReactNode) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={element} /></Routes></MemoryRouter>)
}
