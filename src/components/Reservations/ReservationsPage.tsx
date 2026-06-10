import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './ReservationsPage.css'

const reservations = [
  { item: 'Livro selecionado', seller: 'Sebo Central', status: 'Aguardando vendedor', date: '10/06/2026' },
  { item: 'Disco clássico', seller: 'Acervo 33', status: 'Reserva confirmada', date: '09/06/2026' },
  { item: 'Coleção especial', seller: 'Livraria da Praça', status: 'Entrega a combinar', date: '08/06/2026' },
]

export function ReservationsPage() {
  return (
    <StorePage title="Minhas reservas" subtitle="Acompanhe suas solicitações em andamento.">
      <section className="reservations-list">
        <header>
          <h2>Reservas ativas</h2>
          <select aria-label="Filtrar reservas">
            <option>Todas</option>
            <option>Aguardando vendedor</option>
            <option>Confirmadas</option>
          </select>
        </header>

        {reservations.map((reservation, index) => (
          <article className="reservation-card" key={reservation.item}>
            <div className="reservation-image" />
            <div className="reservation-copy">
              <span>Solicitada em {reservation.date}</span>
              <h3>{reservation.item}</h3>
              <p>Vendido por {reservation.seller}</p>
            </div>
            <div className="reservation-status">
              <span className={`status-dot status-${index}`} />
              {reservation.status}
            </div>
            <div className="reservation-actions">
              <Link to="/mensagens">Conversar</Link>
              <button type="button">Cancelar</button>
            </div>
          </article>
        ))}
      </section>
    </StorePage>
  )
}
