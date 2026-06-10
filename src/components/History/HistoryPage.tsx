import { StorePage } from '../Layout/StorePage'
import './HistoryPage.css'

const historyItems = [
  { item: 'Livro ilustrado', seller: 'Sebo Central', status: 'Concluída', date: '28/05/2026', total: 'R$ 52,00' },
  { item: 'Box de filmes', seller: 'Acervo 33', status: 'Concluída', date: '12/05/2026', total: 'R$ 74,00' },
  { item: 'Coleção de discos', seller: 'Vinil & Companhia', status: 'Cancelada', date: '03/05/2026', total: 'R$ 120,00' },
  { item: 'Quadrinho raro', seller: 'Livraria da Praça', status: 'Concluída', date: '19/04/2026', total: 'R$ 35,00' },
]

export function HistoryPage() {
  return (
    <StorePage title="Histórico" subtitle="Consulte suas reservas concluídas e canceladas.">
      <section className="history-panel">
        <header className="history-toolbar">
          <div>
            <h2>Histórico de reservas</h2>
            <p>{historyItems.length} registros encontrados</p>
          </div>
          <div>
            <select aria-label="Filtrar por período">
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Todo o período</option>
            </select>
            <select aria-label="Filtrar por situação">
              <option>Todas as situações</option>
              <option>Concluídas</option>
              <option>Canceladas</option>
            </select>
          </div>
        </header>

        <div className="history-table">
          <div className="history-row history-heading">
            <span>Item</span><span>Vendedor</span><span>Data</span><span>Situação</span><span>Total</span>
          </div>
          {historyItems.map((entry) => (
            <article className="history-row" key={`${entry.item}-${entry.date}`}>
              <div className="history-item-name">
                <span className="history-image" />
                <strong>{entry.item}</strong>
              </div>
              <span>{entry.seller}</span>
              <time>{entry.date}</time>
              <span className={`history-status ${entry.status === 'Cancelada' ? 'is-cancelled' : ''}`}>
                {entry.status}
              </span>
              <strong>{entry.total}</strong>
            </article>
          ))}
        </div>
      </section>
    </StorePage>
  )
}
