export const AccountType = {
  SEBO: 'SEBO',
  USUARIO: 'USUARIO',
  ADMIN: 'ADMIN',
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]

export type Account = {
  id: number
  name: string
  email: string
  type: AccountType
  fotoUrl?: string | null
  emailVerificado?: boolean
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  type: AccountType
}

export type LoginRequest = {
  login: string
  password: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  password: string
}

export type AuthResponse = {
  token: string
  expiresIn: number
  account: Account
}

export type MensagemResponse = {
  mensagem: string
}
