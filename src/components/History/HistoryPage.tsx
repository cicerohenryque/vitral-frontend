import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { Pagination } from '../ui/Pagination'
import { extractErrorMessage } from '../../services/api'
import { pedidoService } from '../../services/pedidoService'
import { StatusPedido, type Pedido } from '../../types/pedido'

function statusLabel(status: string) {
  if (status === StatusPedido.REEMBOLSADO) return 'Reembolsado'
  if (status === StatusPedido.AGUARDANDO_CONFIRMACAO) return 'Aguardando confirmação'
  if (status === StatusPedido.CONFIRMADO) return 'Confirmado'
  return 'Cancelado'
}

export function HistoryPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    let active = true
    pedidoService
      .listarMeusPedidos(page, 10)
      .then((result) => {
        if (!active) return
        setPedidos(result.content)
        setTotalPages(result.totalPages)
        setError(null)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar seu histórico. Atualize a página e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page])

  async function cancelarPedido(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const atualizado = await pedidoService.cancelarPedido(id)
      setPedidos((current) => current.map((pedido) => (pedido.id === id ? atualizado : pedido)))
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível cancelar o pedido. Tente novamente.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <StorePage title="Histórico" subtitle="Pedidos feitos com os sebos do Vitral.">
      {loading ? (
        <StoreStatus title="Carregando histórico" description="Buscando seus pedidos anteriores." busy />
      ) : error ? (
        <StoreStatus title="Seu histórico não foi carregado" description={error} tone="error" />
      ) : pedidos.length === 0 ? (
        <StoreStatus
          title="Você ainda não fez pedidos"
          description="Depois de confirmar uma cesta, seus pedidos aparecerão neste histórico."
          action={<Link to="/busca">Explorar acervo</Link>}
        />
      ) : (
        <section className="store-list" aria-label="Histórico de pedidos">
          {pedidos.map((pedido) => (
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
              {pedido.status === StatusPedido.AGUARDANDO_CONFIRMACAO ? (
                <div className="store-list-actions">
                  <button
                    className="danger"
                    type="button"
                    disabled={busyId === pedido.id}
                    onClick={() => cancelarPedido(pedido.id)}
                  >
                    {busyId === pedido.id ? 'Cancelando...' : 'Cancelar pedido'}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas do histórico" />
        </section>
      )}
    </StorePage>
  )
}
