import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

const completedSales = [
  { order: '#1018', buyer: 'Carla Ramos', date: '05/06/2026', items: 2, status: 'Concluída', value: 'R$ 92,00' },
  { order: '#1012', buyer: 'Paulo Alves', date: '29/05/2026', items: 1, status: 'Concluída', value: 'R$ 45,00' },
  { order: '#1009', buyer: 'Lia Martins', date: '23/05/2026', items: 1, status: 'Cancelada', value: 'R$ 65,00' },
  { order: '#1003', buyer: 'Bruno Silva', date: '14/05/2026', items: 3, status: 'Concluída', value: 'R$ 180,00' },
]

export function SalesHistoryPage() {
  return (
    <StorePage title="Histórico de vendas" subtitle="Consulte os pedidos processados pelo seu sebo.">
      <section className="sales-history">
        <div className="sales-metrics">
          <article><span>Vendas concluídas</span><strong>24</strong></article>
          <article><span>Itens vendidos</span><strong>31</strong></article>
          <article><span>Total registrado</span><strong>R$ 1.840,00</strong></article>
        </div>

        <div className="sales-history-panel">
          <header className="sales-toolbar">
            <div><h2>Vendas recentes</h2><p>Histórico de confirmações e cancelamentos</p></div>
            <select aria-label="Filtrar histórico de vendas"><option>Últimos 3 meses</option><option>Últimos 6 meses</option><option>Todo o período</option></select>
          </header>
          <div className="sales-history-row sales-history-heading">
            <span>Pedido</span><span>Comprador</span><span>Data</span><span>Itens</span><span>Situação</span><span>Valor</span>
          </div>
          {completedSales.map((sale) => (
            <article className="sales-history-row" key={sale.order}>
              <strong>{sale.order}</strong><span>{sale.buyer}</span><time>{sale.date}</time><span>{sale.items}</span>
              <span className={sale.status === 'Cancelada' ? 'sale-cancelled' : 'sale-completed'}>{sale.status}</span>
              <strong>{sale.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </StorePage>
  )
}
