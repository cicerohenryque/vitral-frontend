import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { Pagination } from '../ui/Pagination'
import { extractErrorMessage } from '../../services/api'
import { fetchAllPages } from '../../services/pagination'
import { pedidoService } from '../../services/pedidoService'
import { StatusPedido, type Pedido } from '../../types/pedido'

function statusLabel(status: string) {
  if (status === StatusPedido.REEMBOLSADO) return 'Reembolsado'
  if (status === StatusPedido.CONFIRMADO) return 'Confirmado'
  if (status === StatusPedido.CANCELADO) return 'Cancelado'
  return 'Aguardando confirmação'
}

export function SalesHistoryPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)
  const pageSize = 10

  useEffect(() => {
    let active = true
    fetchAllPages((nextPage, size) => pedidoService.listarVendas(nextPage, size))
      .then((items) => {
        if (!active) return
        setPedidos(items.filter((pedido) => pedido.status !== StatusPedido.AGUARDANDO_CONFIRMACAO))
        setError(null)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar o histórico de vendas. Atualize a página e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visiblePedidos = pedidos.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(pedidos.length / pageSize)
  async function refund(pedido: Pedido) {
    if (!confirm(`Deseja reembolsar integralmente o pedido #${pedido.id}? Esta ação não poderá ser desfeita.`)) return
    setBusyId(pedido.id); setError(null)
    try { const updated = await pedidoService.reembolsar(pedido.id); setPedidos((items) => items.map((item) => item.id === pedido.id ? updated : item)) }
    catch (err) { setError(extractErrorMessage(err, 'Não foi possível reembolsar o pedido.')) }
    finally { setBusyId(null) }
  }

  return (
    <StorePage title="Histórico de vendas" subtitle="Pedidos confirmados ou cancelados pelo seu sebo.">
      {loading ? (
        <StoreStatus title="Carregando histórico" description="Buscando as vendas já processadas." busy />
      ) : error ? (
        <StoreStatus title="O histórico de vendas não foi carregado" description={error} tone="error" />
      ) : pedidos.length === 0 ? (
        <StoreStatus
          title="Nenhuma venda processada"
          description="Pedidos confirmados ou cancelados aparecerão neste histórico."
          action={<Link to="/vendas">Ver compras recebidas</Link>}
        />
      ) : (
        <section className="store-list" aria-label="Histórico de vendas">
          {visiblePedidos.map((pedido) => (
            <article className="store-order-card" key={pedido.id}>
              <header className="store-order-header">
                <div>
                  <h2>Pedido #{pedido.id}</h2>
                  <p>{new Date(pedido.createdAt).toLocaleDateString('pt-BR')} · R$ {Number(pedido.total).toFixed(2)}</p>
                </div>
                <span className="store-order-status">{statusLabel(pedido.status)}</span>
              </header>
              <ul className="store-order-items">
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    {item.tituloSnapshot} · Qtd. {item.quantidade} · R$ {Number(item.precoSnapshot).toFixed(2)}
                  </li>
                ))}
              </ul>
              <dl className="product-metadata">
                <div><dt>Pagamento</dt><dd>{pedido.pagoEm ? new Date(pedido.pagoEm).toLocaleString('pt-BR') : '—'}</dd></div>
                <div><dt>Confirmação</dt><dd>{pedido.confirmadoEm ? new Date(pedido.confirmadoEm).toLocaleString('pt-BR') : '—'}</dd></div>
                <div><dt>Cancelamento</dt><dd>{pedido.canceladoEm ? new Date(pedido.canceladoEm).toLocaleString('pt-BR') : '—'}</dd></div>
                <div><dt>Reembolso</dt><dd>{pedido.reembolsadoEm ? new Date(pedido.reembolsadoEm).toLocaleString('pt-BR') : '—'}</dd></div>
              </dl>
              {pedido.status === StatusPedido.CONFIRMADO ? <div className="store-list-actions"><button className="danger" type="button" disabled={busyId === pedido.id} onClick={() => refund(pedido)}>{busyId === pedido.id ? 'Reembolsando...' : 'Reembolsar pedido'}</button></div> : null}
            </article>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas de vendas" />
        </section>
      )}
    </StorePage>
  )
}
