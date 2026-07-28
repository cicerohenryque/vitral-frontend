import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecomendacoesPage } from '../pages/RecomendacoesPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { recomendacaoService } from '../services/recomendacaoService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import type { Produto } from '../types/produto'

const product: Produto = {
  id: 7, seboId: 3, seboNome: 'Sebo Central', categoriaId: 2, categoriaNome: 'Livros',
  titulo: 'Livro recomendado', autor: 'Autora', descricao: null, preco: 25, estoque: 2,
  condicao: 'USADO', fotoUrl: null, ativo: true, disponivel: true,
}

const page = {
  content: [product], totalElements: 1, totalPages: 1, number: 0, size: 20, first: true, last: true,
}

function renderRecommendations() {
  return render(<MemoryRouter><RecomendacoesPage /></MemoryRouter>)
}

describe('recomendações personalizadas', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'jwt',
      account: { id: 1, name: 'Rute', username: 'rute', email: 'r@t.com', type: AccountType.USUARIO },
      seboId: null,
    })
    vi.spyOn(recomendacaoService, 'listar').mockResolvedValue(page)
    vi.spyOn(recomendacaoService, 'limparHistorico').mockResolvedValue({ mensagem: 'Histórico removido' })
  })

  afterEach(() => vi.restoreAllMocks())

  it('lista recomendações paginadas com tamanho seguro', async () => {
    renderRecommendations()

    expect(await screen.findByText('Livro recomendado')).toBeInTheDocument()
    expect(screen.getByText('Sebo Central')).toBeInTheDocument()
    expect(recomendacaoService.listar).toHaveBeenCalledWith(0, 20)
  })

  it('limpa o histórico após confirmação e remove as sugestões carregadas', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderRecommendations()
    await screen.findByText('Livro recomendado')

    await userEvent.click(screen.getByRole('button', { name: 'Limpar histórico de recomendações' }))

    expect(recomendacaoService.limparHistorico).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('status')).toHaveTextContent('Histórico removido')
    expect(screen.queryByText('Livro recomendado')).not.toBeInTheDocument()
  })

  it('não chama recomendações quando uma conta SEBO tenta acessar a rota', async () => {
    useAuthStore.setState({
      token: 'jwt',
      account: { id: 2, name: 'Sebo', username: 'sebo', email: 's@t.com', type: AccountType.SEBO },
      seboId: 3,
    })
    render(
      <MemoryRouter initialEntries={['/recomendacoes']}>
        <Routes>
          <Route path="/" element={<p>Início</p>} />
          <Route path="/recomendacoes" element={<ProtectedRoute requireRole={AccountType.USUARIO}><RecomendacoesPage /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Início')).toBeInTheDocument()
    await waitFor(() => expect(recomendacaoService.listar).not.toHaveBeenCalled())
  })
})
