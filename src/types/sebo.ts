export type SeboRequest = {
  descricao?: string
  telefone?: string
  fotoUrl?: string
}

export type Sebo = {
  id: number
  accountId: number
  nome: string
  email: string
  descricao: string | null
  telefone: string | null
  fotoUrl: string | null
}
