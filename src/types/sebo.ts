export type SeboRequest = {
  descricao?: string
  telefone?: string
  cep?: string
  logradouro?: string
  cidade?: string
  uf?: string
  horarioFuncionamento?: string
  fotoUrl?: string
}

export type Sebo = {
  id: number
  accountId: number
  nome: string
  email: string
  descricao: string | null
  telefone: string | null
  cep: string | null
  logradouro: string | null
  cidade: string | null
  uf: string | null
  horarioFuncionamento: string | null
  fotoUrl: string | null
}
