import axios from 'axios'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  type: 'SEBO' | 'USUARIO'
}

type AuthResponse = {
  token?: string
  expiresIn?: number
  account?: unknown
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const loginEndpoint = import.meta.env.VITE_LOGIN_ENDPOINT ?? '/v1/auth/login'
const registerEndpoint = import.meta.env.VITE_REGISTER_ENDPOINT ?? '/v1/auth/register'

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>(loginEndpoint, payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>(registerEndpoint, payload)
  return data
}

export function getAuthError(error: unknown) {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      'Não foi possível conectar com o servidor.'
    )
  }

  return 'Ocorreu um erro inesperado.'
}
