import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { extractErrorMessage } from '../../services/api'
import { pedidoService } from '../../services/pedidoService'
import { StatusPedido, type Pedido } from '../../types/pedido'

function statusLabel(status: string) {
  if (status === StatusPedido.AGUARDANDO_CONFIRMACAO) return 'Aguardando confirmação'
  if (status === StatusPedido.CONFIRMADO) return 'Confirmado'
  return 'Cancelado'
}

export function HistoryPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    pedidoService
      .listarMeusPedidos()
      .then((page) => {
        if (!active) return
        setPedidos(page.content)
        setError(null)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Nao foi possivel carregar seu histórico.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <StorePage title="Histórico" subtitle="Pedidos feitos com os sebos do Vitral.">
      {loading ? (
        <StoreStatus title="Carregando histórico" description="Buscando seus pedidos no backend." busy />
      ) : error ? (
        <StoreStatus title="Erro ao carregar histórico" description={error} tone="error" />
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
                    {item.tituloSnapshot} · R$ {Number(item.precoSnapshot).toFixed(2)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
    </StorePage>
  )
}
