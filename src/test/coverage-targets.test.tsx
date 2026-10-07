import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandLogo } from '../components/Layout/BrandLogo'
import { Pagination } from '../components/ui/Pagination'
import { AdminSeboVerificationPage } from '../pages/AdminSeboVerificationPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { MinhasOfertasPage } from '../pages/MinhasOfertasPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { SeboDocumentsPage } from '../pages/SeboDocumentsPage'
import { authService } from '../services/authService'
import { ofertaService } from '../services/ofertaService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'
import { StatusVerificacao, TipoDocumentoSebo } from '../types/sebo'
import { formatBytes } from '../utils/documentSebo'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }
const seboAccount = { id: 1, name: 'Sebo', username: 'sebo', email: 'sebo@vitral.com', type: AccountType.SEBO }
const sebo = {
  id: 3,
  accountId: 1,
  nome: 'Sebo Central',
  email: 'sebo@vitral.com',
  cnpj: '12345678000199',
  descricao: 'Livros raros',
  telefone: '85999999999',
  fotoUrl: null,
  statusVerificacao: StatusVerificacao.VERIFICADO,
}
const produto = {
  id: 7,
  seboId: 3,
  categoriaId: 1,
  categoriaNome: 'Romance',
  titulo: 'Livro raro',
  autor: 'Autora',
  descricao: 'Descrição',
  preco: 80,
  precoPromocional: 70,
  estoque: 5,
  condicao: CondicaoProduto.USADO,
  fotoUrl: null,
  ativo: true,
}

function page<T>(content: T[], totalPages = 1) {
  return { ...emptyPage, content, totalElements: content.length, totalPages }
}

function renderPage(node: React.ReactNode, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>)
}

describe('cobertura focada em componentes pequenos', () => {
  it('renderiza BrandLogo com tamanho padrão e customizado', () => {
    const { rerender } = render(<BrandLogo />)
    const logo = screen.getByRole('img', { name: 'Vitral' })
    expect(logo).toHaveStyle({ '--logo-size': '166px' })

    rerender(<BrandLogo size={48} />)
    expect(screen.getByRole('img', { name: 'Vitral' })).toHaveStyle({ '--logo-size': '48px' })
  })

  it('controla navegação da Pagination e oculta quando há uma página', async () => {
    const onPageChange = vi.fn()
    const { rerender, container } = render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} label="Páginas teste" />)

    expect(screen.getByRole('navigation', { name: 'Páginas teste' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 0)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2)

    rerender(<Pagination page={0} totalPages={1} onPageChange={onPageChange} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('cobertura focada em recuperação de senha', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('solicita recuperação de senha e bloqueia novo envio após sucesso', async () => {
    vi.spyOn(authService, 'solicitarRecuperacao').mockResolvedValue({ mensagem: 'Confira seu e-mail' })
    renderPage(<ForgotPasswordPage />)

    await userEvent.type(screen.getByLabelText('E-mail:'), 'rute@vitral.com')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.')
    expect(authService.solicitarRecuperacao).toHaveBeenCalledWith({ email: 'rute@vitral.com' })
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeDisabled()
  })

  it('exibe erro quando a recuperação de senha falha', async () => {
    vi.spyOn(authService, 'solicitarRecuperacao').mockRejectedValue(new Error('offline'))
    renderPage(<ForgotPasswordPage />)

    await userEvent.type(screen.getByLabelText('E-mail:'), 'rute@vitral.com')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível solicitar a recuperação da senha. Confira o e-mail e tente novamente.')
  })

  it('valida token e senhas antes de redefinir senha', async () => {
    const first = renderPage(<ResetPasswordPage />, '/resetar-senha')

    await userEvent.type(screen.getByLabelText('Nova senha:'), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme a nova senha:'), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Este link de recuperação é inválido. Solicite um novo link para continuar.')
    first.unmount()

    renderPage(<ResetPasswordPage />, '/resetar-senha?token=abc')
    await userEvent.type(screen.getByLabelText('Nova senha:'), '123')
    await userEvent.type(screen.getByLabelText('Confirme a nova senha:'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Crie uma senha com pelo menos 8 caracteres.')
  })

  it('redefine senha com sucesso e mostra link de login', async () => {
    vi.spyOn(authService, 'redefinirSenha').mockResolvedValue({ mensagem: 'Senha alterada' })
    renderPage(<ResetPasswordPage />, '/resetar-senha?token=abc')

    await userEvent.type(screen.getByLabelText('Nova senha:'), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme a nova senha:'), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Senha redefinida com sucesso.')
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/auth')
    expect(authService.redefinirSenha).toHaveBeenCalledWith({ token: 'abc', password: '12345678' })
  })

  it('exibe erro de confirmação e erro remoto na redefinição', async () => {
    const reset = vi.spyOn(authService, 'redefinirSenha').mockRejectedValue(new Error('falha'))
    const { unmount } = renderPage(<ResetPasswordPage />, '/resetar-senha?token=abc')

    await userEvent.type(screen.getByLabelText('Nova senha:'), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme a nova senha:'), '87654321')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(screen.getByRole('alert')).toHaveTextContent('As senhas não coincidem.')
    unmount()

    renderPage(<ResetPasswordPage />, '/resetar-senha?token=abc')
    await userEvent.type(screen.getByLabelText('Nova senha:'), '12345678')
    await userEvent.type(screen.getByLabelText('Confirme a nova senha:'), '12345678')
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível redefinir sua senha.')
    expect(reset).toHaveBeenCalled()
  })
})

describe('cobertura focada no painel admin de verificação', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: 'jwt', account: { id: 9, name: 'Admin', username: 'admin', email: 'admin@vitral.com', type: AccountType.ADMIN }, seboId: null })
  })

  it('lista pendentes, detalhes, documentos, auditoria e aprova sebo', async () => {
    vi.spyOn(seboService, 'listarPendentes').mockResolvedValue(page([sebo], 2))
    vi.spyOn(seboService, 'listarDocumentos').mockResolvedValue([{
      id: 10,
      tipo: TipoDocumentoSebo.CARTAO_CNPJ,
      arquivoUrl: '/documentos/cartao.pdf',
      nomeArquivo: 'cartao.pdf',
      contentType: 'application/pdf',
      tamanhoBytes: 2048,
      enviadoEm: '2026-07-06T10:00:00Z',
      status: 'PENDENTE',
      motivoRejeicao: null,
    }])
    vi.spyOn(seboService, 'listarAuditoria').mockResolvedValue([{
      id: 1,
      analisadoPorId: 9,
      statusAnterior: StatusVerificacao.PENDENTE,
      novoStatus: StatusVerificacao.REJEITADO,
      motivo: 'Documento ilegível',
      criadoEm: '2026-07-06T11:00:00Z',
    }])
    const review = vi.spyOn(seboService, 'atualizarVerificacao').mockResolvedValue(sebo)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderPage(<AdminSeboVerificationPage />)

    expect(await screen.findByText('Sebo Central')).toBeInTheDocument()
    expect(screen.getByText(/12\.345\.678\/0001-99/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver documentos e auditoria' }))
    expect(await screen.findByText('cartao.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument()
    expect(screen.getByText(/Documento ilegível/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Aprovar' }))
    expect(review).toHaveBeenCalledWith(3, StatusVerificacao.VERIFICADO, undefined)
    expect(await screen.findByRole('status')).toHaveTextContent('Sebo aprovado com sucesso.')
  })

  it('exige motivo na rejeição e envia motivo no body via service', async () => {
    vi.spyOn(seboService, 'listarPendentes').mockResolvedValue(page([sebo]))
    const review = vi.spyOn(seboService, 'atualizarVerificacao').mockResolvedValue(sebo)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'prompt').mockReturnValueOnce('').mockReturnValueOnce('CNPJ divergente')

    renderPage(<AdminSeboVerificationPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Rejeitar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o motivo da rejeição para orientar o responsável pelo sebo.')
    expect(review).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Rejeitar' }))
    expect(review).toHaveBeenCalledWith(3, StatusVerificacao.REJEITADO, 'CNPJ divergente')
  })

  it('mostra estado vazio e erros do painel admin', async () => {
    vi.spyOn(seboService, 'listarPendentes').mockResolvedValueOnce(page([])).mockRejectedValueOnce(new Error('offline'))
    const first = renderPage(<AdminSeboVerificationPage />)
    expect(await screen.findByText('Nenhum sebo pendente')).toBeInTheDocument()
    first.unmount()

    renderPage(<AdminSeboVerificationPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os sebos pendentes.')
  })

  it('mostra erro ao carregar detalhes do sebo', async () => {
    vi.spyOn(seboService, 'listarPendentes').mockResolvedValue(page([sebo]))
    vi.spyOn(seboService, 'listarDocumentos').mockRejectedValue(new Error('offline'))
    vi.spyOn(seboService, 'listarAuditoria').mockResolvedValue([])

    renderPage(<AdminSeboVerificationPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Ver documentos e auditoria' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os detalhes do sebo. Tente novamente.')
  })
})

describe('cobertura focada em documentos do sebo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: 3 })
  })

  it('lista documentos com metadados e envia arquivo por multipart', async () => {
    vi.spyOn(seboService, 'listarMeusDocumentos').mockResolvedValue([{
      id: 1,
      tipo: TipoDocumentoSebo.CONTRATO_SOCIAL,
      arquivoUrl: '/privado/contrato.pdf',
      nomeArquivo: 'contrato.pdf',
      contentType: 'application/pdf',
      tamanhoBytes: 1024 * 1024,
      enviadoEm: '2026-07-06T10:00:00Z',
      status: 'APROVADO',
      motivoRejeicao: null,
    }])
    const upload = vi.spyOn(seboService, 'enviarDocumento').mockResolvedValue({} as never)
    const file = new File(['conteudo'], 'cartao-cnpj.pdf', { type: 'application/pdf' })

    renderPage(<SeboDocumentsPage />)

    expect(await screen.findByText('contrato.pdf')).toBeInTheDocument()
    expect(screen.getByText('1.0 MB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Tipo do documento'), TipoDocumentoSebo.CARTAO_CNPJ)
    const fileInput = screen.getByLabelText('Arquivo')
    await userEvent.upload(fileInput, file)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar documento' })).toBeEnabled())
    fireEvent.submit(fileInput.closest('form')!)

    expect(upload).toHaveBeenCalledWith(TipoDocumentoSebo.CARTAO_CNPJ, file)
    expect(await screen.findByRole('status')).toHaveTextContent('Documento enviado com sucesso. O cadastro voltou para análise.')
  })

  it('mostra vazio, valida arquivo obrigatório e exibe erro remoto', async () => {
    vi.spyOn(seboService, 'listarMeusDocumentos').mockResolvedValue([])
    vi.spyOn(seboService, 'enviarDocumento').mockRejectedValue(new Error('offline'))
    const file = new File(['conteudo'], 'documento.jpg', { type: 'image/jpeg' })

    renderPage(<SeboDocumentsPage />)

    expect(await screen.findByText('Nenhum documento enviado')).toBeInTheDocument()
    const fileInput = screen.getByLabelText('Arquivo')
    await userEvent.upload(fileInput, file)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar documento' })).toBeEnabled())
    fireEvent.submit(fileInput.closest('form')!)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar o documento.')
  })

  it('formata tamanhos de arquivo pequenos', () => {
    expect(formatBytes(0)).toBe('—')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

describe('cobertura focada em minhas ofertas', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: 3 })
  })

  it('exige perfil de sebo quando não há seboId', async () => {
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: null })
    renderPage(<MinhasOfertasPage />)

    expect(await screen.findByText('Perfil do sebo necessário')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cadastrar sebo' })).toHaveAttribute('href', '/painel/sebo')
  })

  it('bloqueia ofertas para sebo não verificado', async () => {
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({ ...sebo, statusVerificacao: StatusVerificacao.REJEITADO })
    vi.spyOn(ofertaService, 'listarMinhas').mockResolvedValue(page([]))
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue(page([produto]))

    renderPage(<MinhasOfertasPage />)

    expect(await screen.findByText('Sebo ainda não verificado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gerenciar documentos' })).toHaveAttribute('href', '/painel/sebo/documentos')
  })

  it('cria oferta e valida campos obrigatórios', async () => {
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({ ...sebo, statusVerificacao: StatusVerificacao.VERIFICADO })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue(page([produto]))
    vi.spyOn(ofertaService, 'listarMinhas').mockResolvedValue(page([]))
    const create = vi.spyOn(ofertaService, 'criar').mockResolvedValue({} as never)

    renderPage(<MinhasOfertasPage />)

    await screen.findByText(/Livro raro — R\$/)
    await userEvent.selectOptions(screen.getByLabelText('Produto'), '7')
    await userEvent.click(await screen.findByRole('button', { name: 'Criar oferta' }))
    expect(await screen.findByText('O preço promocional deve ser maior que zero.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Preço promocional (R$)'), '5990')
    await userEvent.type(screen.getByLabelText('Descrição (opcional)'), 'Semana do livro')
    await userEvent.click(screen.getByRole('button', { name: 'Criar oferta' }))

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ produtoId: 7, precoPromocional: 59.9, descricao: 'Semana do livro', ativa: true }))
    expect(await screen.findByRole('status')).toHaveTextContent('Oferta criada com sucesso.')
  })

  it('edita e desativa oferta existente', async () => {
    const oferta = {
      id: 30,
      produtoId: 7,
      seboId: 3,
      tituloProduto: 'Livro raro',
      descricao: 'Antiga',
      precoOriginal: 80,
      precoPromocional: 60,
      inicioEm: null,
      fimEm: null,
      ativa: true,
    }
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue({ ...sebo, statusVerificacao: StatusVerificacao.VERIFICADO })
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue(page([produto]))
    vi.spyOn(ofertaService, 'listarMinhas').mockResolvedValue(page([oferta]))
    const update = vi.spyOn(ofertaService, 'atualizar').mockResolvedValue({} as never)
    const remove = vi.spyOn(ofertaService, 'remover').mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderPage(<MinhasOfertasPage />)

    const row = (await screen.findByText('Livro raro')).closest('tr')
    expect(row).not.toBeNull()
    await userEvent.click(within(row!).getByRole('button', { name: 'Editar' }))
    await userEvent.clear(screen.getByLabelText('Preço promocional (R$)'))
    await userEvent.type(screen.getByLabelText('Preço promocional (R$)'), '5500')
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar oferta' }))
    expect(update).toHaveBeenCalledWith(30, expect.objectContaining({ produtoId: 7, precoPromocional: 55 }))

    await userEvent.click(within(row!).getByRole('button', { name: 'Desativar' }))
    expect(remove).toHaveBeenCalledWith(30)
  })
})
