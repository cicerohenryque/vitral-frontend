import { useCallback, useEffect, useState } from 'react'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { extractErrorMessage } from '../services/api'
import { seboService } from '../services/seboService'
import { StatusVerificacao, type AuditoriaSebo, type DocumentoSebo, type Sebo } from '../types/sebo'
import './StockMovementsPage.css'

const cnpj = (v?:string) => v ? v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : 'CNPJ não informado'
export function AdminSeboVerificationPage() {
  const [items,setItems]=useState<Sebo[]>([]),[page,setPage]=useState(0),[totalPages,setTotalPages]=useState(0),[loading,setLoading]=useState(true)
  const [docs,setDocs]=useState<Record<number,DocumentoSebo[]>>({}),[audits,setAudits]=useState<Record<number,AuditoriaSebo[]>>({}),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null)
  const load=useCallback(()=>{setLoading(true);seboService.listarPendentes(page,20).then(r=>{setItems(r.content);setTotalPages(r.totalPages);setError(null)}).catch(e=>setError(extractErrorMessage(e,'Não foi possível carregar os sebos pendentes.'))).finally(()=>setLoading(false))},[page])
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  },[load])
  async function details(id:number){try{const [d,a]=await Promise.all([seboService.listarDocumentos(id),seboService.listarAuditoria(id)]);setDocs(x=>({...x,[id]:d}));setAudits(x=>({...x,[id]:a}))}catch(e){setError(extractErrorMessage(e,'Não foi possível carregar os detalhes.'))}}
  async function review(item:Sebo,status:StatusVerificacao){if(!confirm(`${status==='VERIFICADO'?'Aprovar':'Rejeitar'} o sebo ${item.nome}?`))return;let motivo:string|undefined;if(status==='REJEITADO'){motivo=prompt('Informe o motivo obrigatório da rejeição:')?.trim();if(!motivo){setError('O motivo é obrigatório para rejeitar.');return}}try{await seboService.atualizarVerificacao(item.id,status,motivo);setSuccess(`Sebo ${status==='VERIFICADO'?'aprovado':'rejeitado'} com sucesso.`);load()}catch(e){setError(extractErrorMessage(e,'Não foi possível revisar o sebo.'))}}
  return <StorePage title="Verificação de sebos" subtitle="Analise documentos e aprove ou rejeite cadastros pendentes.">{error?<div className="flash error" role="alert">{error}</div>:null}{success?<div className="flash success" role="status">{success}</div>:null}{loading?<StoreStatus title="Carregando pendentes" description="Consultando sebos em análise." busy/>:items.length===0?<StoreStatus title="Nenhum sebo pendente" description="Não há cadastros aguardando análise."/>:<div className="admin-sebo-list">{items.map(item=><article className="auth-card" key={item.id}><h2>{item.nome}</h2><p>{item.email} · {cnpj(item.cnpj)}</p><p>{item.descricao||'Sem descrição'} · {item.telefone||'Sem telefone'}</p><div className="form-actions"><Button type="button" variant="ghost" onClick={()=>details(item.id)}>Ver documentos e auditoria</Button><Button type="button" onClick={()=>review(item,StatusVerificacao.VERIFICADO)}>Aprovar</Button><Button type="button" variant="danger" onClick={()=>review(item,StatusVerificacao.REJEITADO)}>Rejeitar</Button></div>{docs[item.id]?<><h3>Documentos</h3>{docs[item.id].map(d=><p key={d.id}><a href={d.arquivoUrl} target="_blank" rel="noreferrer">{d.tipoDocumento}</a> — {d.status}{d.motivoRejeicao?` — ${d.motivoRejeicao}`:''}</p>)}<h3>Auditoria</h3>{(audits[item.id]||[]).map(a=><p key={a.id}>Admin #{a.analisadoPorId}: {a.statusAnterior} → {a.novoStatus} · {a.motivo||'Sem motivo'} · {new Date(a.criadoEm).toLocaleString('pt-BR')}</p>)}</>:null}</article>)}</div>}<Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas de sebos pendentes"/></StorePage>
}
