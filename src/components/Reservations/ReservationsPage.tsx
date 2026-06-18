import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './ReservationsPage.css'

export function ReservationsPage() {
  return (
    <StorePage title="Minhas reservas" subtitle="Acompanhamento de reservas depende dos endpoints de pedidos.">
      <section className="store-empty">
        <div>
          <h2>Nenhuma reserva para exibir</h2>
          <p>
            O backend atual ainda não possui endpoints para acompanhar ou cancelar reservas.
            Quando eles existirem, suas solicitações aparecerão aqui.
          </p>
          <Link className="store-primary-link" to="/busca">
            Buscar produtos
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
