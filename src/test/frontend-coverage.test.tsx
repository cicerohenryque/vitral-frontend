import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { api, extractErrorMessage } from '../services/api'
import { cestaService } from '../services/cestaService'
import { seboService } from '../services/seboService'
import { AccountType } from '../types/account'
import { useAuthStore } from '../store/authStore'
import { ProtectedRoute } from '../routes/ProtectedRoute'


const useAuthMock = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('frontend utilities and auth flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthMock.mockReset()
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds authorization header when token exists and clears storage on 401', async () => {
    localStorage.setItem('vitral_token', 'abc123')
    const request = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
    const requestHandler = api.interceptors.request.handlers?.[0]
    const requestFulfilled = requestHandler!.fulfilled!
    const handled = await requestFulfilled(request)
    expect(handled.headers.Authorization).toBe('Bearer abc123')

    localStorage.setItem('vitral_token', 'abc123')
    localStorage.setItem('vitral_account', JSON.stringify({ id: 1, name: 'Rute' }))
    localStorage.setItem('vitral_sebo_id', '42')
    const axiosError = new AxiosError('fail')
    axiosError.response = { status: 401 } as AxiosResponse
    const responseHandler = api.interceptors.response.handlers?.[0]
    const responseRejected = responseHandler!.rejected!
    await expect(responseRejected(axiosError)).rejects.toEqual(axiosError)
    expect(localStorage.getItem('vitral_token')).toBeNull()
    expect(localStorage.getItem('vitral_account')).toBeNull()
    expect(localStorage.getItem('vitral_sebo_id')).toBeNull()
  })

  it('extracts error messages from field errors and fallback behavior', () => {
    const error = new AxiosError<{ fieldErrors: Array<{ field: string; message: string }> }>('bad request')
    error.response = {
      data: {
        fieldErrors: [
          { field: 'email', message: 'inválido' },
          { field: 'senha', message: 'curta' },
        ],
      },
    } as AxiosResponse<{ fieldErrors: Array<{ field: string; message: string }> }>
    expect(extractErrorMessage(error)).toBe('email: inválido | senha: curta')

    const messageError = new AxiosError<{ message: string }>('unauthorized')
    messageError.response = { data: { message: 'Token inválido' } } as AxiosResponse<{ message: string }>
    expect(extractErrorMessage(messageError)).toBe('Token inválido')

    const genericError = new Error('boom')
    expect(extractErrorMessage(genericError, 'fallback')).toBe('fallback')
  })

  it('builds cesta endpoints correctly', async () => {
    const spyPost = vi.spyOn(api, 'post').mockResolvedValue({ data: { mensagem: 'adicionado' } })
    const spyPut = vi.spyOn(api, 'put').mockResolvedValue({ data: { mensagem: 'atualizado' } })
    const spyGet = vi.spyOn(api, 'get').mockResolvedValue({ data: [{ produtoId: 1, quantidade: 2 }] })
    const spyDelete = vi.spyOn(api, 'delete').mockResolvedValue({ data: null })

    await expect(cestaService.adicionar(5)).resolves.toEqual({ mensagem: 'adicionado' })
    expect(spyPost).toHaveBeenCalledWith('/cesta/5', null, { params: undefined })

    await expect(cestaService.adicionar(5, 3)).resolves.toEqual({ mensagem: 'adicionado' })
    expect(spyPost).toHaveBeenCalledWith('/cesta/5', null, { params: { quantidade: 3 } })

    await expect(cestaService.atualizarQuantidade(5, 7)).resolves.toEqual({ mensagem: 'atualizado' })
    expect(spyPut).toHaveBeenCalledWith('/cesta/5', null, { params: { quantidade: 7 } })

    await expect(cestaService.listar()).resolves.toEqual([{ produtoId: 1, quantidade: 2 }])
    expect(spyGet).toHaveBeenCalledWith('/cesta')

    await expect(cestaService.remover(5)).resolves.toBeUndefined()
    expect(spyDelete).toHaveBeenCalledWith('/cesta/5')
  })

  it('busca o proprio perfil de sebo via /sebos/me', async () => {
    const meuSebo = { id: 3, accountId: 1, email: 'rute@teste.com' }
    const spyGet = vi.spyOn(api, 'get').mockResolvedValue({ data: meuSebo })

    await expect(seboService.buscarMeu()).resolves.toEqual(meuSebo)
    expect(spyGet).toHaveBeenCalledWith('/sebos/me')
  })

  it('deleta conta de sebo via serviço', async () => {
    const spyDelete = vi.spyOn(api, 'delete').mockResolvedValue({ data: { mensagem: 'removido' } })
    await expect(seboService.excluirConta()).resolves.toEqual({ mensagem: 'removido' })
    expect(spyDelete).toHaveBeenCalledWith('/sebos/me')
  })

  it('carrega o estado de auth do localStorage e ignora valores inválidos', async () => {
    const account = { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.USUARIO }

    localStorage.setItem('vitral_account', JSON.stringify(account))
    localStorage.setItem('vitral_sebo_id', '25')
    vi.resetModules()
    const { useAuthStore: importedStore } = await import('../store/authStore')
    expect(importedStore.getState().token).toBe(localStorage.getItem('vitral_token'))
    expect(importedStore.getState().account).toEqual(account)
    expect(importedStore.getState().seboId).toBe(25)

    localStorage.setItem('vitral_account', '{ invalid json')
    localStorage.setItem('vitral_sebo_id', 'abc')
    vi.resetModules()
    const { useAuthStore: invalidStore } = await import('../store/authStore')
    expect(invalidStore.getState().account).toBeNull()
    expect(invalidStore.getState().seboId).toBeNull()
  })

  it('redirects unauthenticated users and blocks insufficient roles', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, account: null })
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/auth" element={<div>login page</div>} />
          <Route path="*" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('login page')).toBeInTheDocument()

    useAuthMock.mockReturnValue({ isAuthenticated: true, account: { type: AccountType.USUARIO } })
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="*" element={<ProtectedRoute requireRole="SEBO"><div>secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('home')).toBeInTheDocument()
  })

  it('renders children when authenticated and authorized', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, account: { type: AccountType.SEBO } })
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="*" element={<ProtectedRoute requireRole="SEBO"><div>secret content</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('updates auth store and cleans storage on logout', async () => {
    const account = { id: 1, name: 'Rute', username: 'rute', email: 'rute@teste.com', type: AccountType.USUARIO }
    const spyPost = vi.spyOn(api, 'post').mockResolvedValue({ data: {} })

    useAuthStore.getState().login('jwt-token', account)
    expect(localStorage.getItem('vitral_token')).toBe('jwt-token')
    expect(localStorage.getItem('vitral_account')).toBe(JSON.stringify(account))
    expect(useAuthStore.getState().token).toBe('jwt-token')

    useAuthStore.getState().setAccount({ ...account, name: 'RuteNova' })
    expect(JSON.parse(localStorage.getItem('vitral_account')!)).toEqual({ ...account, name: 'RuteNova' })

    useAuthStore.getState().setSeboId(27)
    expect(localStorage.getItem('vitral_sebo_id')).toBe('27')
    expect(useAuthStore.getState().seboId).toBe(27)

    await useAuthStore.getState().logout()
    expect(spyPost).toHaveBeenCalledWith('/auth/logout')
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().account).toBeNull()
    expect(useAuthStore.getState().seboId).toBeNull()
  })
})
