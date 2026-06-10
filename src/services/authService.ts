import { api } from './api'
import type { Account, AuthResponse, LoginRequest, MensagemResponse, RegisterRequest } from '../types/account'

export const authService = {
  async register(payload: RegisterRequest): Promise<MensagemResponse> {
    const { data } = await api.post<MensagemResponse>('/auth/register', payload)
    return data
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async confirmarEmail(token: string): Promise<MensagemResponse> {
    const { data } = await api.get<MensagemResponse>('/auth/confirmar', { params: { token } })
    return data
  },

  async me(): Promise<Account> {
    const { data } = await api.get<Account>('/auth/me')
    return data
  },
}
