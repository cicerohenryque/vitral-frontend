import { api } from './api'
import type { MensagemResponse } from '../types/account'
import type { AuditoriaSebo, DocumentoSebo, Sebo, SeboRequest, StatusVerificacao, TipoDocumentoSebo } from '../types/sebo'
import type { Page } from '../types/common'
import { fetchAllPages } from './pagination'

export const seboService = {
  async criar(payload: SeboRequest): Promise<Sebo> {
    const { data } = await api.post<Sebo>('/sebos', payload)
    return data
  },

  async atualizarMeu(payload: SeboRequest): Promise<Sebo> {
    const { data } = await api.put<Sebo>('/sebos/me', payload)
    return data
  },

  async buscarPorId(id: number): Promise<Sebo> {
    const { data } = await api.get<Sebo>(`/sebos/${id}`)
    return data
  },

  async buscarMeu(): Promise<Sebo> {
    const { data } = await api.get<Sebo>('/sebos/me')
    return data
  },

  async listarPendentes(page = 0, size = 20): Promise<Page<Sebo>> {
    const { data } = await api.get<Page<Sebo>>('/sebos/verificacao/pendentes', {
      params: { page, size },
    })
    return data
  },

  async atualizarVerificacao(id: number, status: StatusVerificacao, motivo?: string): Promise<Sebo> {
    const { data } = await api.put<Sebo>(`/sebos/${id}/verificacao`, null, {
      params: { status, motivo },
    })
    return data
  },

  async enviarDocumento(tipoDocumento: TipoDocumentoSebo, arquivoUrl: string): Promise<DocumentoSebo> {
    const { data } = await api.post<DocumentoSebo>('/sebos/me/documentos', { tipoDocumento, arquivoUrl })
    return data
  },
  async listarMeusDocumentos(): Promise<DocumentoSebo[]> {
    const { data } = await api.get<DocumentoSebo[]>('/sebos/me/documentos')
    return data
  },
  async listarDocumentos(id: number): Promise<DocumentoSebo[]> {
    const { data } = await api.get<DocumentoSebo[]>(`/sebos/${id}/documentos`)
    return data
  },
  async listarAuditoria(id: number): Promise<AuditoriaSebo[]> {
    const { data } = await api.get<AuditoriaSebo[]>(`/sebos/${id}/verificacao/auditoria`)
    return data
  },

  async buscarPorConta(accountId: number, name: string, email: string): Promise<Sebo | null> {
    const sebos = await fetchAllPages(async (page, size) => {
      const { data } = await api.get<Page<Sebo>>('/busca/sebos', {
        params: { q: name, page, size },
      })
      return data
    }, 20)
    return sebos.find((sebo) => sebo.accountId === accountId || sebo.email === email) ?? null
  },

  async excluirConta(): Promise<MensagemResponse> {
    const { data } = await api.delete<MensagemResponse>('/sebos/me')
    return data
  },
}
