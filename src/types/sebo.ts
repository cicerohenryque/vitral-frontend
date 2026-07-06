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

export const TipoOperacaoSebo = {
  VIRTUAL: 'VIRTUAL',
  FISICO: 'FISICO',
  HIBRIDO: 'HIBRIDO',
} as const
export type TipoOperacaoSebo = (typeof TipoOperacaoSebo)[keyof typeof TipoOperacaoSebo]

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
  tipoOperacao?: TipoOperacaoSebo
  cep?: string
  logradouro?: string
  cidade?: string
  uf?: string
  horarioFuncionamento?: string
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
  tipoOperacao?: TipoOperacaoSebo | null
  cep?: string | null
  logradouro?: string | null
  cidade?: string | null
  uf?: string | null
  horarioFuncionamento?: string | null
  confirmado?: boolean | null
}

export const TipoDocumentoSebo = {
  CARTAO_CNPJ: 'CARTAO_CNPJ',
  CONTRATO_SOCIAL: 'CONTRATO_SOCIAL',
  DOCUMENTO_RESPONSAVEL: 'DOCUMENTO_RESPONSAVEL',
  COMPROVANTE_BANCARIO: 'COMPROVANTE_BANCARIO',
  COMPROVANTE_ATIVIDADE: 'COMPROVANTE_ATIVIDADE',
  OUTRO: 'OUTRO',
} as const
export type TipoDocumentoSebo = (typeof TipoDocumentoSebo)[keyof typeof TipoDocumentoSebo]
export const StatusDocumentoSebo = { PENDENTE: 'PENDENTE', APROVADO: 'APROVADO', REJEITADO: 'REJEITADO' } as const
export type StatusDocumentoSebo = (typeof StatusDocumentoSebo)[keyof typeof StatusDocumentoSebo]
export type DocumentoSebo = {
  id: number
  tipo: TipoDocumentoSebo
  arquivoUrl: string
  nomeArquivo: string
  contentType: string
  tamanhoBytes: number
  enviadoEm: string
  status: StatusDocumentoSebo
  analisadoEm?: string | null
  analisadoPorId?: number | null
  motivoRejeicao?: string | null
}
export type AuditoriaSebo = { id: number; analisadoPorId: number; statusAnterior: StatusVerificacao; novoStatus: StatusVerificacao; motivo: string | null; criadoEm: string }
