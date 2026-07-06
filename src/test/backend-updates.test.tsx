import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { categoriaService } from '../services/categoriaService'
import { pedidoService } from '../services/pedidoService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }
const account = { id: 1, name: 'Sebo Virtual', email: 'sebo@vitral.com', type: AccountType.SEBO }
const sebo = { id: 3, accountId: 1, nome: 'Sebo Virtual', email: account.email, descricao: 'Online', telefone: '9999', fotoUrl: null }
const produto = {
  id: 7,
  seboId: 3,
  categoriaId: null,
  categoriaNome: null,
  titulo: 'Livro físico',
  autor: 'Autor',
  descricao: null,
  preco: 25,
  estoque: 3,
  condicao: CondicaoProduto.USADO,
  fotoUrl: null,
  ativo: true,
}

function authenticateSebo() {
  useAuthStore.setState({ token: 'jwt', account, seboId: 3 })
}

describe('mudancas recentes do backend', () => {
  it('exibe faturamento anual com os doze meses e permite trocar o ano', async () => {
    authenticateSebo()
    vi.spyOn(seboService, 'buscarPorId').mockResolvedValue(sebo)
    const billing = vi.spyOn(pedidoService, 'buscarFaturamentoMensal')
      .mockResolvedValueOnce([{ ano: 2026, mes: 1, vendasOnline: 1200, vendasFisicas: 500, estornosReembolsos: 200, total: 1500 }])
      .mockResolvedValueOnce([])

    render(<MemoryRouter><MeuSeboPage /></MemoryRouter>)

    expect((await screen.findAllByText(/R\$\s*1\.500,00/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/R\$\s*1\.200,00/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/R\$\s*500,00/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/R\$\s*200,00/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('row')).toHaveLength(13)
    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2025')
    await waitFor(() => expect(billing).toHaveBeenLastCalledWith(2025))
    expect(await screen.findByText('Nenhum faturamento registrado neste ano.')).toBeInTheDocument()
  })

  it('registra venda fisica, mostra a mensagem e atualiza o estoque imediatamente', async () => {
    authenticateSebo()
    vi.spyOn(categoriaService, 'listar').mockResolvedValue(emptyPage)
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [produto], totalElements: 1, totalPages: 1 })
    vi.spyOn(window, 'prompt').mockReturnValue('2')
    const sale = vi.spyOn(produtoService, 'registrarVendaFisica').mockResolvedValue({
      mensagem: 'Venda registrada. Há unidades reservadas em pedidos online.',
      estoqueAtual: 1,
    })

    render(<MemoryRouter><MeusProdutosPage /></MemoryRouter>)

    const row = (await screen.findByText('Livro físico')).closest('tr')
    expect(row).not.toBeNull()
    await userEvent.click(within(row!).getByRole('button', { name: 'Registrar venda física' }))
    await waitFor(() => expect(sale).toHaveBeenCalledWith(7, 2))
    expect(await screen.findByText(/Há unidades reservadas/)).toBeInTheDocument()
    expect(within(row!).getByText('1')).toBeInTheDocument()
  })

  it('desabilita venda fisica quando o estoque esta zerado', async () => {
    authenticateSebo()
    vi.spyOn(categoriaService, 'listar').mockResolvedValue(emptyPage)
    vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue({ ...emptyPage, content: [{ ...produto, estoque: 0 }], totalElements: 1, totalPages: 1 })

    render(<MemoryRouter><MeusProdutosPage /></MemoryRouter>)

    expect(await screen.findByRole('button', { name: 'Registrar venda física' })).toBeDisabled()
  })
})
