import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, TOKEN_KEY } from '../services/api'
import { authService } from '../services/authService'
import { buscaService } from '../services/buscaService'
import { categoriaService } from '../services/categoriaService'
import { cestaService } from '../services/cestaService'
import { produtoService } from '../services/produtoService'
import { seboService } from '../services/seboService'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'

const data = { ok: true }

describe('contratos completos dos servicos', () => {
  beforeEach(() => {
    vi.spyOn(api, 'get').mockResolvedValue({ data } as never)
    vi.spyOn(api, 'post').mockResolvedValue({ data } as never)
    vi.spyOn(api, 'put').mockResolvedValue({ data } as never)
    vi.spyOn(api, 'delete').mockResolvedValue({ data } as never)
  })

  it('cobre autenticacao e busca', async () => {
    await authService.register({ name: 'R', email: 'r@t.com', password: '12345678', type: AccountType.USUARIO })
    await authService.login({ login: 'r@t.com', password: '12345678' })
    await authService.logout()
    await authService.confirmarEmail('abc')
    await authService.me()
    await buscaService.buscarProdutos({ q: 'livro' }, 2, 5)
    await buscaService.buscarSebos({ cidade: 'Fortaleza' }, 1, 8)
    expect(api.get).toHaveBeenCalledWith('/auth/confirmar', { params: { token: 'abc' } })
    expect(api.get).toHaveBeenCalledWith('/busca/produtos', { params: { q: 'livro', page: 2, size: 5 } })
  })

  it('cobre escrita de categorias, cesta, produtos e perfis', async () => {
    await categoriaService.criar({ nome: 'Romance' })
    await cestaService.adicionar(7, 2)
    await produtoService.criar({ titulo: 'Livro' } as never)
    await produtoService.atualizar(7, { titulo: 'Novo' } as never)
    await produtoService.remover(7)
    await produtoService.listarPorSebo(3)
    await seboService.criar({ cidade: 'Fortaleza' })
    await seboService.atualizarMeu({ cidade: 'Recife' })
    await usuarioService.atualizarPerfil({ name: 'Novo' })
    await usuarioService.excluirConta()
    expect(api.post).toHaveBeenCalledWith('/cesta/7', null, { params: { quantidade: 2 } })
    expect(api.put).toHaveBeenCalledWith('/produtos/7', { titulo: 'Novo' })
  })

  it('localiza sebo por conta, email ou retorna nulo', async () => {
    const get = vi.mocked(api.get)
    get.mockResolvedValueOnce({ data: { content: [{ id: 1, accountId: 9, email: 'a@a.com' }] } } as never)
    expect((await seboService.buscarPorConta(9, 'Nome', 'x@x.com'))?.id).toBe(1)
    get.mockResolvedValueOnce({ data: { content: [{ id: 2, accountId: 8, email: 'x@x.com' }] } } as never)
    expect((await seboService.buscarPorConta(9, 'Nome', 'x@x.com'))?.id).toBe(2)
    get.mockResolvedValueOnce({ data: { content: [] } } as never)
    expect(await seboService.buscarPorConta(9, 'Nome', 'x@x.com')).toBeNull()
  })
})

describe('persistencia da autenticacao', () => {
  it('persiste login, conta, sebo e limpa no logout mesmo com falha remota', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('offline'))
    const account = { id: 1, name: 'Rute', email: 'r@t.com', type: AccountType.SEBO }
    useAuthStore.getState().login('jwt', account)
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt')
    useAuthStore.getState().setAccount({ ...account, name: 'Nova' })
    useAuthStore.getState().setSeboId(4)
    expect(localStorage.getItem('vitral_sebo_id')).toBe('4')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState()).toMatchObject({ token: null, account: null, seboId: null })
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})
