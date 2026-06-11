import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

const orders = [
  { id: 1024, buyer: 'Marina Souza', item: 'Livro clássico', date: '10/06/2026', value: 'R$ 38,00' },
  { id: 1023, buyer: 'João Lima', item: 'Disco selecionado', date: '10/06/2026', value: 'R$ 65,00' },
  { id: 1022, buyer: 'Ana Costa', item: 'Coleção especial', date: '09/06/2026', value: 'R$ 120,00' },
]

export function SalesOrdersPage() {
  return (
    <StorePage title="Compras recebidas" subtitle="Analise e confirme os pedidos feitos ao seu sebo.">
      <section className="sales-panel">
        <header className="sales-toolbar">
          <div><h2>Pedidos aguardando confirmação</h2><p>{orders.length} pedidos pendentes</p></div>
          <select aria-label="Filtrar pedidos recebidos">
            <option>Pendentes</option>
            <option>Confirmados</option>
            <option>Cancelados</option>
          </select>
        </header>

        {orders.map((order) => (
          <article className="sales-order" key={order.id}>
            <span className="sales-order-number">#{order.id}</span>
            <div className="sales-order-image" />
            <div>
              <h3>{order.item}</h3>
              <p>Comprador: {order.buyer}</p>
              <time>Solicitado em {order.date}</time>
            </div>
            <strong>{order.value}</strong>
            <span className="sales-pending">Pendente</span>
            <Link to={`/vendas/${order.id}/confirmar`}>Analisar pedido</Link>
          </article>
        ))}
      </section>
    </StorePage>
  )
}
