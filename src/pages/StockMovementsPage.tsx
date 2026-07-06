import { useCallback, useEffect, useState } from 'react'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { useAuth } from '../hooks/useAuth'
import { movimentacaoService } from '../services/movimentacaoService'
import { produtoService } from '../services/produtoService'
import { extractErrorMessage } from '../services/api'
import { seboService } from '../services/seboService'
import type { MovimentacaoEstoque } from '../types/movimentacao'
import type { Produto } from '../types/produto'
import { TipoOperacaoSebo } from '../types/sebo'
import './StockMovementsPage.css'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function StockMovementsPage() {
  const { seboId } = useAuth()
  const [products, setProducts] = useState<Produto[]>([])
  const [items, setItems] = useState<MovimentacaoEstoque[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [valorUnitario, setValorUnitario] = useState(0)
  const [observacao, setObservacao] = useState('')
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacaoSebo | null>(null)
  const [loadingOperacao, setLoadingOperacao] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await movimentacaoService.listar(page, 20)
      setItems(result.content); setTotalPages(result.totalPages); setError(null)
    } catch (err) { setError(extractErrorMessage(err, 'Não foi possível carregar as movimentações.')) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])
  useEffect(() => {
    if (!seboId) return
    produtoService.listarPorSebo(seboId, 0, 100).then((result) => setProducts(result.content)).catch(() => setProducts([]))
  }, [seboId])

  useEffect(() => {
    let active = true
    if (!seboId) return
    Promise.resolve()
      .then(() => {
        if (active) setLoadingOperacao(true)
        return seboService.buscarPorId(seboId)
      })
      .then((item) => {
        if (!active) return
        setTipoOperacao(item.tipoOperacao ?? TipoOperacaoSebo.VIRTUAL)
      })
      .catch(() => {
        if (active) setTipoOperacao(TipoOperacaoSebo.VIRTUAL)
      })
      .finally(() => {
        if (active) setLoadingOperacao(false)
      })
    return () => { active = false }
  }, [seboId])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setSuccess(null)
    if (tipoOperacao === TipoOperacaoSebo.VIRTUAL) {
      setError('Sebo virtual não permite venda física.')
      setBusy(false)
      return
    }
    try {
      await movimentacaoService.registrarVendaFisica({ produtoId: Number(produtoId), quantidade, valorUnitario, observacao: observacao || undefined })
      setSuccess('Venda física registrada e estoque atualizado.'); setQuantidade(1); setObservacao(''); await load()
    } catch (err) { setError(extractErrorMessage(err, 'Não foi possível registrar a venda física.')) }
    finally { setBusy(false) }
  }

  async function refund(item: MovimentacaoEstoque) {
    if (!confirm('Confirma o estorno desta venda física?')) return
    const motivo = prompt('Informe o motivo do estorno:')?.trim()
    if (!motivo) return
    try { await movimentacaoService.estornar(item.id, motivo); setSuccess('Venda física estornada.'); await load() }
    catch (err) { setError(extractErrorMessage(err, 'Não foi possível estornar a venda.')) }
  }

  return <StorePage title="Estoque e vendas físicas" subtitle="Registre vendas presenciais e acompanhe todas as movimentações.">
    {error ? <div className="flash error" role="alert">{error}</div> : null}{success ? <div className="flash success" role="status">{success}</div> : null}
    <form className="stock-sale-form" onSubmit={submit}>
      {loadingOperacao ? <StoreStatus title="Carregando operação do sebo" description="Verificando se este sebo aceita vendas físicas." busy /> : null}
      {!loadingOperacao && tipoOperacao === TipoOperacaoSebo.VIRTUAL ? (
        <div className="flash error" role="alert">Sebo virtual não permite venda física.</div>
      ) : null}
      <label>Produto<select required value={produtoId} onChange={(e) => { setProdutoId(e.target.value); const p = products.find((x) => x.id === Number(e.target.value)); if (p) setValorUnitario(Number(p.precoPromocional ?? p.preco)) }}><option value="">Selecione</option>{products.map((p) => <option key={p.id} value={p.id}>{p.titulo} — estoque {p.estoque ?? 0}</option>)}</select></label>
      <Input id="physical-quantity" label="Quantidade" type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} required />
      <Input id="physical-value" label="Valor unitário" type="number" min={0} step="0.01" value={valorUnitario} onChange={(e) => setValorUnitario(Number(e.target.value))} required />
      <Input id="physical-note" label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      <Button type="submit" disabled={busy || tipoOperacao === TipoOperacaoSebo.VIRTUAL}>{busy ? 'Registrando...' : 'Registrar venda física'}</Button>
    </form>
    <h2>Histórico de movimentações</h2>
    {loading ? <StoreStatus title="Carregando movimentações" description="Consultando o histórico do estoque." busy /> : items.length === 0 ? <StoreStatus title="Nenhuma movimentação" description="As alterações de estoque aparecerão aqui." /> : <div className="stock-table-scroll"><table className="stock-table"><thead><tr><th>Tipo</th><th>Quantidade</th><th>Antes → Depois</th><th>Valor</th><th>Data</th><th>Observação</th><th>Ação</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.tipo}</td><td>{item.quantidade}</td><td>{item.estoqueAntes} → {item.estoqueDepois}</td><td>{brl.format(item.valorTotal)}</td><td>{date.format(new Date(item.criadoEm))}</td><td>{item.observacao ?? '—'}</td><td>{item.tipo === 'VENDA_FISICA' ? <Button type="button" variant="danger" onClick={() => refund(item)}>Estornar</Button> : '—'}</td></tr>)}</tbody></table></div>}
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas de movimentações" />
  </StorePage>
}
