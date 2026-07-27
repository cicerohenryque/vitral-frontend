import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProductPage } from '../components/Product/ProductPage'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { cestaService } from '../services/cestaService'
import { movimentacaoService } from '../services/movimentacaoService'
import { produtoService } from '../services/produtoService'
import { pedidoService } from '../services/pedidoService'
import { seboService } from '../services/seboService'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'
import { StatusConsultaCnpj, StatusVerificacao } from '../types/sebo'
import { isValidIsbn, normalizeIsbn } from '../utils/isbn'

describe('novos contratos do backend', () => {
  it('valida e normaliza ISBN-10 e ISBN-13', () => {
    expect(isValidIsbn('0-306-40615-2')).toBe(true)
    expect(isValidIsbn('978-0-306-40615-7')).toBe(true)
    expect(isValidIsbn('9780306406158')).toBe(false)
    expect(normalizeIsbn('0-306-40615-2')).toBe('0306406152')
  })

  it('escolhe vendedor e adiciona o produto correspondente à cesta', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Cliente', username: 'cliente', email: 'c@x.com', type: AccountType.USUARIO }, seboId: null })
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue({ id: 10, seboId: 2, categoriaId: null, categoriaNome: null, isbn: '9780306406157', titulo: 'Livro', autor: null, descricao: null, preco: 50, estoque: 3, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true })
    vi.spyOn(produtoService, 'listarVendedores').mockResolvedValue([
      { produtoId: 10, seboId: 2, seboNome: 'Sebo A', preco: 50, precoPromocional: 40, precoEfetivo: 40, estoque: 3, condicao: CondicaoProduto.USADO },
      { produtoId: 22, seboId: 4, seboNome: 'Sebo B', preco: 45, precoPromocional: null, precoEfetivo: 45, estoque: 2, condicao: CondicaoProduto.NOVO },
    ])
    vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('irrelevante'))
    const add = vi.spyOn(cestaService, 'adicionar').mockResolvedValue({ mensagem: 'Adicionado' })
    render(<MemoryRouter initialEntries={['/produto/10']}><Routes><Route path="/produto/:productId" element={<ProductPage />} /></Routes></MemoryRouter>)
    expect(await screen.findByText('Menor preço')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText(/Sebo B/))
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar à cesta' }))
    expect(add).toHaveBeenCalledWith(22)
  })

  it('exibe a data de publicação do anúncio quando retornada pelo backend', async () => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue({
      id: 10,
      seboId: 2,
      categoriaId: null,
      categoriaNome: null,
      isbn: null,
      titulo: 'Livro publicado',
      autor: null,
      descricao: null,
      preco: 50,
      estoque: 3,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
      ativo: true,
      dataPublicacao: '2026-07-06',
    })
    vi.spyOn(produtoService, 'listarVendedores').mockResolvedValue([])
    vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('irrelevante'))

    render(<MemoryRouter initialEntries={['/produto/10']}><Routes><Route path="/produto/:productId" element={<ProductPage />} /></Routes></MemoryRouter>)

    expect(await screen.findByText('Publicado em: 06/07/2026')).toBeInTheDocument()
  })

  it('não exibe data técnica quando a publicação do anúncio vem ausente ou inválida', async () => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
    vi.spyOn(produtoService, 'buscarPorId').mockResolvedValue({
      id: 10,
      seboId: 2,
      categoriaId: null,
      categoriaNome: null,
      isbn: null,
      titulo: 'Livro antigo',
      autor: null,
      descricao: null,
      preco: 50,
      estoque: 3,
      condicao: CondicaoProduto.USADO,
      fotoUrl: null,
      ativo: true,
      dataPublicacao: 'data-invalida',
      createdAt: null,
    })
    vi.spyOn(produtoService, 'listarVendedores').mockResolvedValue([])
    vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('irrelevante'))

    render(<MemoryRouter initialEntries={['/produto/10']}><Routes><Route path="/produto/:productId" element={<ProductPage />} /></Routes></MemoryRouter>)

    expect(await screen.findByText('Livro antigo')).toBeInTheDocument()
    expect(screen.queryByText(/Publicado em/)).not.toBeInTheDocument()
    expect(screen.queryByText(/data-invalida/)).not.toBeInTheDocument()
  })

  it('integra movimentacoes, documentos, auditoria e revisão administrativa', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} })
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [] })
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: {} })
    await movimentacaoService.registrarVendaFisica({ produtoId: 7, quantidade: 1, valorUnitario: 20 })
    await movimentacaoService.estornar(9, 'Erro de lançamento')
    const arquivo = new File(['documento'], 'arquivo.png', { type: 'image/png' })
    await seboService.enviarDocumento('CARTAO_CNPJ', arquivo)
    await seboService.listarAuditoria(3)
    await seboService.atualizarVerificacao(3, 'REJEITADO', 'Documento ilegível')
    expect(post).toHaveBeenCalledWith('/movimentacoes-estoque/vendas-fisicas', { produtoId: 7, quantidade: 1, valorUnitario: 20 })
    expect(post).toHaveBeenCalledWith('/movimentacoes-estoque/9/estorno', { motivo: 'Erro de lançamento' })
    expect(post).toHaveBeenCalledWith('/sebos/me/documentos', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    expect(get).toHaveBeenCalledWith('/sebos/3/verificacao/auditoria')
    expect(put).toHaveBeenCalledWith('/sebos/3/verificacao', { motivo: 'Documento ilegível' }, { params: { status: 'REJEITADO' } })
  })

  it('impede usuário comum de acessar rota ADMIN', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Cliente', username: 'cliente', email: 'c@x.com', type: AccountType.USUARIO }, seboId: null })
    render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/" element={<p>Início</p>} /><Route path="/admin" element={<ProtectedRoute requireRole={AccountType.ADMIN}><p>Painel admin</p></ProtectedRoute>} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Início')).toBeInTheDocument())
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument()
  })

  it('consulta o CNPJ e exibe razão social e status retornados pelo backend', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 2, name: 'Sebo', username: 'sebo', email: 's@x.com', type: AccountType.SEBO }, seboId: 3 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({ id: 3, accountId: 2, nome: 'Sebo', email: 's@x.com', cnpj: '12345678000199', statusVerificacao: StatusVerificacao.PENDENTE, statusConsultaCnpj: StatusConsultaCnpj.NAO_CONSULTADO, motivoRejeicao: null, descricao: null, telefone: null, fotoUrl: null })
    vi.spyOn(pedidoService, 'buscarFaturamentoMensal').mockResolvedValue([])
    const consult = vi.spyOn(seboService, 'consultarMeuCnpj').mockResolvedValue({ cnpj: '12345678000199', razaoSocial: 'VITRAL LIVROS LTDA', status: StatusConsultaCnpj.ATIVA, consultadoEm: '2026-07-05T10:00:00Z', mensagem: 'Consulta realizada' })
    render(<MemoryRouter><MeuSeboPage /></MemoryRouter>)
    await userEvent.click(await screen.findByRole('button', { name: 'Consultar CNPJ' }))
    await waitFor(() => expect(consult).toHaveBeenCalled())
    expect(await screen.findByText('VITRAL LIVROS LTDA')).toBeInTheDocument()
    expect(screen.getByText(/CNPJ ativo/)).toBeInTheDocument()
  })

  it('usa o endpoint de consulta sem body', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { status: 'ATIVA' } })
    await seboService.consultarMeuCnpj()
    expect(post).toHaveBeenCalledWith('/sebos/me/verificacao/consultar-cnpj')
  })
})
