import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MeusProdutosPage } from '../pages/MeusProdutosPage'
import { categoriaService } from '../services/categoriaService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto, type SugestaoProduto } from '../types/produto'

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }
const account = { id: 1, name: 'Sebo Virtual', username: 'sebo.virtual', email: 'sebo@vitral.com', type: AccountType.SEBO }

const categorias = {
  ...emptyPage,
  content: [
    { id: 12, nome: 'Livros', slug: 'livros', descricao: null },
    { id: 13, nome: 'CDs', slug: 'cds', descricao: null },
    { id: 14, nome: 'Vinis', slug: 'vinis', descricao: null },
  ],
}

const sugestaoLivro: SugestaoProduto = {
  titulo: 'Dom Casmurro',
  autor: 'Machado de Assis',
  ano: 1900,
  descricao: 'Romance realista de Machado de Assis.',
  categoriaId: 12,
  categoriaSlug: 'livros',
  categoriaNome: 'Livros',
  fotoUrl: 'https://covers.openlibrary.org/b/id/647501-L.jpg',
  fonte: 'OPEN_LIBRARY',
}

const sugestaoVinil: SugestaoProduto = {
  titulo: 'Clube da Esquina',
  autor: 'Milton Nascimento',
  ano: 1972,
  descricao: 'Clube da Esquina - Milton Nascimento (Vinyl, 1972)',
  categoriaId: 14,
  categoriaSlug: 'vinis',
  categoriaNome: 'Vinis',
  fotoUrl: null,
  fonte: 'MUSICBRAINZ',
}

function renderPage() {
  useAuthStore.setState({ token: 'jwt', account, seboId: 3 })
  vi.spyOn(categoriaService, 'listar').mockResolvedValue(categorias)
  vi.spyOn(produtoService, 'listarPorSebo').mockResolvedValue(emptyPage)
  vi.spyOn(seboService, 'buscarPorId').mockRejectedValue(new Error('sem perfil'))
  render(<MemoryRouter><MeusProdutosPage /></MemoryRouter>)
}

describe('autopreenchimento do cadastro de produto pelo titulo', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('preenche autor, ano, descricao e categoria ao aplicar a sugestao escolhida', async () => {
    renderPage()
    const buscar = vi.spyOn(produtoService, 'buscarSugestoes').mockResolvedValue([sugestaoLivro])

    await userEvent.type(await screen.findByLabelText('Título'), 'Dom Casmurro')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))

    await waitFor(() => expect(buscar).toHaveBeenCalledWith('Dom Casmurro'))
    await userEvent.click(await screen.findByRole('button', { name: /Dom Casmurro/ }))

    expect(screen.getByLabelText('Autor')).toHaveValue('Machado de Assis')
    expect(screen.getByLabelText('Ano')).toHaveValue(1900)
    expect(screen.getByLabelText('Descrição')).toHaveValue('Romance realista de Machado de Assis.')
    expect(screen.getByLabelText('Categoria')).toHaveValue('12')
  })

  it('renomeia o campo para Artista quando a categoria sugerida for de musica', async () => {
    renderPage()
    vi.spyOn(produtoService, 'buscarSugestoes').mockResolvedValue([sugestaoVinil])

    await userEvent.type(await screen.findByLabelText('Título'), 'Clube da Esquina')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))
    await userEvent.click(await screen.findByRole('button', { name: /Clube da Esquina/ }))

    expect(screen.getByLabelText('Artista')).toHaveValue('Milton Nascimento')
    expect(screen.getByLabelText('Categoria')).toHaveValue('14')
  })

  it('envia o ano ao cadastrar o produto depois de aplicar a sugestao', async () => {
    renderPage()
    vi.spyOn(produtoService, 'buscarSugestoes').mockResolvedValue([sugestaoLivro])
    const criar = vi.spyOn(produtoService, 'criar').mockResolvedValue({
      id: 1, seboId: 3, categoriaId: 12, categoriaNome: 'Livros', titulo: 'Dom Casmurro', autor: 'Machado de Assis',
      descricao: null, preco: 30, estoque: 1, condicao: CondicaoProduto.USADO, fotoUrl: null, ativo: true,
    })

    await userEvent.type(await screen.findByLabelText('Título'), 'Dom Casmurro')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))
    await userEvent.click(await screen.findByRole('button', { name: /Dom Casmurro/ }))
    await userEvent.type(screen.getByLabelText('Preço (R$)'), '3000')
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar produto' }))

    await waitFor(() => expect(criar).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      ano: 1900,
      categoriaId: 12,
    })))
  })

  it('avisa quando o titulo tiver menos de tres caracteres sem chamar o backend', async () => {
    renderPage()
    const buscar = vi.spyOn(produtoService, 'buscarSugestoes')

    await userEvent.type(await screen.findByLabelText('Título'), 'ab')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))

    expect(await screen.findByText('Digite ao menos 3 caracteres do título para buscar.')).toBeInTheDocument()
    expect(buscar).not.toHaveBeenCalled()
  })

  it('avisa quando nenhuma informacao for encontrada para o titulo', async () => {
    renderPage()
    vi.spyOn(produtoService, 'buscarSugestoes').mockResolvedValue([])

    await userEvent.type(await screen.findByLabelText('Título'), 'titulo inexistente')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))

    expect(await screen.findByText('Nenhuma informação encontrada. Preencha os campos manualmente.'))
      .toBeInTheDocument()
  })

  it('mostra aviso e mantem o formulario utilizavel quando a consulta externa falha', async () => {
    renderPage()
    vi.spyOn(produtoService, 'buscarSugestoes').mockRejectedValue(new Error('offline'))

    await userEvent.type(await screen.findByLabelText('Título'), 'Dom Casmurro')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar informações pelo título' }))

    expect(await screen.findByText('Não foi possível buscar as informações agora.')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Dom Casmurro')
  })
})
