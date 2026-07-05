export const StatusVerificacao = {
  PENDENTE: 'PENDENTE',
  VERIFICADO: 'VERIFICADO',
  REJEITADO: 'REJEITADO',
} as const

export type StatusVerificacao = (typeof StatusVerificacao)[keyof typeof StatusVerificacao]

export const StatusConsultaCnpj = {
  NAO_CONSULTADO: 'NAO_CONSULTADO',
  ATIVA: 'ATIVA',
  INATIVA: 'INATIVA',
  INDISPONIVEL: 'INDISPONIVEL',
} as const
export type StatusConsultaCnpj = (typeof StatusConsultaCnpj)[keyof typeof StatusConsultaCnpj]

export type ConsultaCnpjResponse = {
  cnpj: string
  razaoSocial: string | null
  status: StatusConsultaCnpj
  consultadoEm: string | null
  mensagem: string | null
}

export type SeboRequest = {
  cnpj: string
  descricao?: string
  telefone?: string
  fotoUrl?: string
}

export type Sebo = {
  id: number
  accountId: number
  nome: string
  email: string
  cnpj?: string
  statusVerificacao?: StatusVerificacao
  motivoRejeicao?: string | null
  razaoSocialReceita?: string | null
  statusConsultaCnpj?: StatusConsultaCnpj
  cnpjConsultadoEm?: string | null
  mensagemConsultaCnpj?: string | null
  descricao: string | null
  telefone: string | null
  fotoUrl: string | null
}

export const TipoDocumentoSebo = {
  CARTAO_CNPJ: 'CARTAO_CNPJ', CONTRATO_SOCIAL: 'CONTRATO_SOCIAL',
  DOCUMENTO_RESPONSAVEL: 'DOCUMENTO_RESPONSAVEL', COMPROVANTE_BANCARIO: 'COMPROVANTE_BANCARIO',
} as const
export type TipoDocumentoSebo = (typeof TipoDocumentoSebo)[keyof typeof TipoDocumentoSebo]
export const StatusDocumentoSebo = { PENDENTE: 'PENDENTE', APROVADO: 'APROVADO', REJEITADO: 'REJEITADO' } as const
export type StatusDocumentoSebo = (typeof StatusDocumentoSebo)[keyof typeof StatusDocumentoSebo]
export type DocumentoSebo = { id: number; tipoDocumento: TipoDocumentoSebo; arquivoUrl: string; status: StatusDocumentoSebo; enviadoEm: string; analisadoEm: string | null; analisadoPorId: number | null; motivoRejeicao: string | null }
export type AuditoriaSebo = { id: number; analisadoPorId: number; statusAnterior: StatusVerificacao; novoStatus: StatusVerificacao; motivo: string | null; criadoEm: string }
