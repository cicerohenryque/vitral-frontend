import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProductPage } from '../components/Product/ProductPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { cestaService } from '../services/cestaService'
import { movimentacaoService } from '../services/movimentacaoService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'
import { isValidIsbn, normalizeIsbn } from '../utils/isbn'

describe('novos contratos do backend', () => {
  it('valida e normaliza ISBN-10 e ISBN-13', () => {
    expect(isValidIsbn('0-306-40615-2')).toBe(true)
    expect(isValidIsbn('978-0-306-40615-7')).toBe(true)
    expect(isValidIsbn('9780306406158')).toBe(false)
    expect(normalizeIsbn('0-306-40615-2')).toBe('0306406152')
  })

  it('escolhe vendedor e adiciona o produto correspondente à cesta', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Cliente', email: 'c@x.com', type: AccountType.USUARIO }, seboId: null })
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

  it('integra movimentacoes, documentos, auditoria e revisão administrativa', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} })
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [] })
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: {} })
    await movimentacaoService.registrarVendaFisica({ produtoId: 7, quantidade: 1, valorUnitario: 20 })
    await movimentacaoService.estornar(9, 'Erro de lançamento')
    await seboService.enviarDocumento('CARTAO_CNPJ', '/arquivo.png')
    await seboService.listarAuditoria(3)
    await seboService.atualizarVerificacao(3, 'REJEITADO', 'Documento ilegível')
    expect(post).toHaveBeenCalledWith('/movimentacoes-estoque/vendas-fisicas', { produtoId: 7, quantidade: 1, valorUnitario: 20 })
    expect(post).toHaveBeenCalledWith('/movimentacoes-estoque/9/estorno', { motivo: 'Erro de lançamento' })
    expect(get).toHaveBeenCalledWith('/sebos/3/verificacao/auditoria')
    expect(put).toHaveBeenCalledWith('/sebos/3/verificacao', null, { params: { status: 'REJEITADO', motivo: 'Documento ilegível' } })
  })

  it('impede usuário comum de acessar rota ADMIN', async () => {
    useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Cliente', email: 'c@x.com', type: AccountType.USUARIO }, seboId: null })
    render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/" element={<p>Início</p>} /><Route path="/admin" element={<ProtectedRoute requireRole={AccountType.ADMIN}><p>Painel admin</p></ProtectedRoute>} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Início')).toBeInTheDocument())
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument()
  })
})
