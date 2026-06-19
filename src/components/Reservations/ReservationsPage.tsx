import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function ReservationsPage() {
  return (
    <StorePage title="Minhas reservas" subtitle="Acompanhamento de reservas depende dos endpoints de pedidos.">
      <StoreStatus
        title="Reservas indisponíveis"
        description="O backend atual ainda não possui endpoints para acompanhar ou cancelar reservas. Quando eles existirem, suas solicitações aparecerão aqui."
        action={<Link to="/busca">Buscar produtos</Link>}
      />
    </StorePage>
  )
}
