export const AccountType = {
  SEBO: 'SEBO',
  USUARIO: 'USUARIO',
  ADMIN: 'ADMIN',
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]

export type Account = {
  id: number
  name: string
  username: string
  email: string
  type: AccountType
  fotoUrl?: string | null
  emailVerificado?: boolean
  cpf?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

export type UpdateProfileRequest = {
  name: string
  fotoUrl?: string
  cpf: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export type RegisterRequest = {
  name: string
  username: string
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
