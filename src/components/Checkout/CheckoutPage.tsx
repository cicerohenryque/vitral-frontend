import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function CheckoutPage() {
  return (
    <StorePage title="Confirmar pedido" subtitle="Pedidos ainda não estão disponíveis no backend atual.">
      <StoreStatus
        title="Não há endpoint para confirmar pedidos"
        description="Assim que o backend expuser criação de pedidos ou reservas, esta tela poderá enviar solicitações reais para os sebos."
        action={
          <>
          <Link to="/carrinho">Voltar ao carrinho</Link>
          <Link to="/busca">Buscar produtos</Link>
          </>
        }
      />
    </StorePage>
  )
}
