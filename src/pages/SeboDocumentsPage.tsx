import { useCallback, useEffect, useState } from 'react'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { extractErrorMessage } from '../services/api'
import { seboService } from '../services/seboService'
import { TipoDocumentoSebo, type DocumentoSebo } from '../types/sebo'
import './StockMovementsPage.css'

const labels = { CARTAO_CNPJ: 'Cartão CNPJ', CONTRATO_SOCIAL: 'Contrato social', DOCUMENTO_RESPONSAVEL: 'Documento do responsável', COMPROVANTE_BANCARIO: 'Comprovante bancário' }

export function SeboDocumentsPage() {
  const [items, setItems] = useState<DocumentoSebo[]>([]); const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState<TipoDocumentoSebo>(TipoDocumentoSebo.CARTAO_CNPJ); const [arquivoUrl, setArquivoUrl] = useState('')
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<string | null>(null)
  const load = useCallback(() => { setLoading(true); seboService.listarMeusDocumentos().then(setItems).catch((e) => setError(extractErrorMessage(e, 'Não foi possível carregar os documentos.'))).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(null); try { await seboService.enviarDocumento(tipo, arquivoUrl); setArquivoUrl(''); setSuccess('Documento enviado. A verificação retornou para PENDENTE.'); load() } catch (err) { setError(extractErrorMessage(err, 'Não foi possível enviar o documento.')) } finally { setBusy(false) } }
  return <StorePage title="Documentos do sebo" subtitle="Envie os documentos necessários para a verificação.">
    <p className="flash">O envio de um novo documento retorna a verificação do sebo para PENDENTE.</p>{error ? <div className="flash error" role="alert">{error}</div> : null}{success ? <div className="flash success" role="status">{success}</div> : null}
    <form className="form-grid" onSubmit={submit}><label className="vit-input-wrapper"><span className="vit-input-label">Tipo do documento</span><select className="vit-input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDocumentoSebo)}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><Input id="document-url" label="URL do documento" type="url" placeholder="https://..." value={arquivoUrl} onChange={(event) => setArquivoUrl(event.target.value)} required /><p className="image-upload-hint">Informe somente uma URL de documento previamente disponível. O Vitral não oferece upload de PDF nesta tela.</p><Button type="submit" disabled={busy || !arquivoUrl}>{busy ? 'Enviando...' : 'Enviar URL do documento'}</Button></form>
    <h2>Documentos enviados</h2>{loading ? <StoreStatus title="Carregando documentos" description="Consultando os documentos enviados." busy /> : items.length === 0 ? <StoreStatus title="Nenhum documento enviado" description="Envie o primeiro documento usando o formulário acima." /> : <div className="stock-table-scroll"><table className="stock-table"><thead><tr><th>Tipo</th><th>Status</th><th>Enviado em</th><th>Motivo</th><th>Arquivo</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{labels[item.tipoDocumento]}</td><td>{item.status}</td><td>{new Date(item.enviadoEm).toLocaleString('pt-BR')}</td><td>{item.motivoRejeicao ?? '—'}</td><td><a href={item.arquivoUrl} target="_blank" rel="noreferrer">Visualizar</a></td></tr>)}</tbody></table></div>}
  </StorePage>
}
