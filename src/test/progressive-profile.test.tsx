import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutPage } from '../components/Checkout/CheckoutPage'
import { SellerPage } from '../components/Seller/SellerPage'
import { PerfilPage } from '../pages/PerfilPage'
import { AuthPage } from '../pages/AuthPage'
import { authService } from '../services/authService'
import { cestaService } from '../services/cestaService'
import { pedidoService } from '../services/pedidoService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../store/authStore'
import { AccountType, type Account } from '../types/account'

const userAccount: Account = {
  id: 1,
  name: 'Rute',
  username: 'rute',
  email: 'rute@teste.com',
  type: AccountType.USUARIO,
  fotoUrl: null,
  cpf: null,
  cep: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  estado: null,
}

function renderProfile(entry: string | { pathname: string; search?: string; state?: unknown } = '/painel/perfil') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes><Route path="/painel/perfil" element={<PerfilPage />} /></Routes>
    </MemoryRouter>,
  )
}

function profileIncompleteError(fields: string[]) {
  const config = { headers: {} } as InternalAxiosRequestConfig
  const response: AxiosResponse = {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config,
    data: {
      status: 422,
      code: 'PROFILE_INCOMPLETE_FOR_PURCHASE',
      message: 'Complete CPF e endereco antes de finalizar a compra',
      fieldErrors: fields.map((field) => ({ field, message: 'Campo ausente ou invalido' })),
    },
  }
  return new AxiosError('Request failed with status code 422', 'ERR_BAD_REQUEST', config, undefined, response)
}

describe('cadastro progressivo do usuário', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  afterEach(() => vi.restoreAllMocks())

  it('cadastra usuário somente com nome, username, email, senha e tipo', async () => {
    const register = vi.spyOn(authService, 'register').mockResolvedValue({ mensagem: 'Conta criada' })
    render(<MemoryRouter><AuthPage /></MemoryRouter>)

    await userEvent.type(screen.getByLabelText('Nome:'), 'Rute')
    await userEvent.type(screen.getByLabelText('Usuário (login):'), 'rute')
    await userEvent.type(screen.getByLabelText('Email:'), 'rute@teste.com')
    await userEvent.type(screen.getByLabelText('Senha:', { selector: '#reg-password' }), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme sua senha:'), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(register).toHaveBeenCalledWith({
      name: 'Rute', username: 'rute', email: 'rute@teste.com', password: '12345678', type: AccountType.USUARIO,
    })
  })

  it('permite editar somente nome e foto sem reenviar CPF mascarado ou endereço', async () => {
    const account = { ...userAccount, cpf: '***.***.***-25', fotoUrl: '/antiga.png' }
    useAuthStore.setState({ token: 'jwt', account, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(account)
    const update = vi.spyOn(usuarioService, 'atualizarPerfil').mockResolvedValue({ ...account, name: 'Rute Silva', fotoUrl: '' })
    renderProfile()

    await userEvent.clear(await screen.findByLabelText('Nome'))
    await userEvent.type(screen.getByLabelText('Nome'), 'Rute Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(update).toHaveBeenCalledWith({ name: 'Rute Silva', fotoUrl: '' })
  })

  it('aceita CPF e CEP com máscara e salva perfil completo com complemento vazio', async () => {
    useAuthStore.setState({ token: 'jwt', account: userAccount, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(userAccount)
    const completed = { ...userAccount, cpf: '***.***.***-25', cep: '60000000', logradouro: 'Rua São José', numero: '10', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' }
    const update = vi.spyOn(usuarioService, 'atualizarPerfil').mockResolvedValue(completed)
    renderProfile()

    await userEvent.type(await screen.findByLabelText('CPF'), '529.982.247-25')
    await userEvent.type(screen.getByLabelText('CEP'), '60000-000')
    await userEvent.type(screen.getByLabelText('Logradouro'), 'Rua São José')
    await userEvent.type(screen.getByLabelText('Número'), '10')
    await userEvent.type(screen.getByLabelText('Bairro'), 'Centro')
    await userEvent.type(screen.getByLabelText('Cidade'), 'Fortaleza')
    await userEvent.type(screen.getByLabelText('Estado (UF)'), 'ce')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(update).toHaveBeenCalledWith({
      name: 'Rute', fotoUrl: '', cpf: '52998224725', cep: '60000000', logradouro: 'Rua São José',
      numero: '10', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE',
    })
  })

  it('não exige nem exibe CPF para conta SEBO', async () => {
    const seboAccount = { ...userAccount, type: AccountType.SEBO }
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: 3 })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(seboAccount)
    vi.spyOn(usuarioService, 'atualizarPerfil').mockResolvedValue({ ...seboAccount, name: 'Novo Sebo' })
    renderProfile()

    expect(await screen.findByLabelText('Nome')).toBeInTheDocument()
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Endereço' })).not.toBeInTheDocument()
  })
})

describe('checkout com perfil incompleto', () => {
  afterEach(() => vi.restoreAllMocks())

  it('mantém o sucesso dependente da confirmação do backend quando o perfil está completo', async () => {
    vi.spyOn(cestaService, 'listar').mockResolvedValue([{ id: 1, produtoId: 7, titulo: 'Livro', autor: null, preco: 20, quantidade: 1, subtotal: 20, estoqueDisponivel: 1, condicao: 'USADO', fotoUrl: null }])
    vi.spyOn(pedidoService, 'confirmarPedido').mockResolvedValue({ id: 9 } as never)
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>)

    await userEvent.click(await screen.findByRole('button', { name: 'Pagar e confirmar' }))
    expect(await screen.findByText('Pedido #9 enviado')).toBeInTheDocument()
  })

  it('trata o 422, destaca campos e direciona para completar o perfil sem simular pedido', async () => {
    vi.spyOn(cestaService, 'listar').mockResolvedValue([{ id: 1, produtoId: 7, titulo: 'Livro', autor: null, preco: 20, quantidade: 1, subtotal: 20, estoqueDisponivel: 1, condicao: 'USADO', fotoUrl: null }])
    vi.spyOn(pedidoService, 'confirmarPedido').mockRejectedValue(profileIncompleteError(['cpf', 'cep']))
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>)

    await userEvent.click(await screen.findByRole('button', { name: 'Pagar e confirmar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Complete seu perfil antes de finalizar a compra.')
    expect(screen.getByRole('alert')).toHaveTextContent('cpf: Campo ausente ou invalido')
    expect(screen.getByRole('alert')).toHaveTextContent('cep: Campo ausente ou invalido')
    expect(screen.getByRole('link', { name: 'Completar perfil' })).toHaveAttribute('href', '/painel/perfil?from=checkout')
    expect(screen.queryByText(/Pedido #/)).not.toBeInTheDocument()
  })

  it('destaca no perfil os campos indicados e oferece retorno ao checkout após salvar', async () => {
    useAuthStore.setState({ token: 'jwt', account: userAccount, seboId: null })
    vi.spyOn(usuarioService, 'buscarPerfil').mockResolvedValue(userAccount)
    vi.spyOn(usuarioService, 'atualizarPerfil').mockResolvedValue({ ...userAccount, cpf: '***.***.***-25', cep: '60000000' })
    renderProfile({ pathname: '/painel/perfil', search: '?from=checkout', state: { fromCheckout: true, incompleteFields: ['cpf', 'cep'] } })

    expect(await screen.findByLabelText('CPF')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('CEP')).toHaveAttribute('aria-invalid', 'true')
    await userEvent.type(screen.getByLabelText('CPF'), '52998224725')
    await userEvent.type(screen.getByLabelText('CEP'), '60000000')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByRole('link', { name: 'Voltar ao checkout' })).toHaveAttribute('href', '/confirmar-pedido')
  })
})

describe('privacidade do perfil público do sebo', () => {
  afterEach(() => vi.restoreAllMocks())

  it('funciona sem email, telefone ou endereço públicos', async () => {
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({
      id: 3, accountId: 8, nome: 'Sebo Privado', descricao: 'Acervo selecionado', fotoUrl: null,
      email: null, telefone: null, cep: null, logradouro: null, cidade: null, uf: null,
    })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true,
    })

    render(
      <MemoryRouter initialEntries={['/vendedor/3']}>
        <Routes><Route path="/vendedor/:sellerId" element={<SellerPage />} /></Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Sebo Privado' })).toBeInTheDocument()
    expect(screen.queryByText('Contato')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhum produto cadastrado')).toBeInTheDocument()
  })
})
