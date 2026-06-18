import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function SaleConfirmationPage() {
  return (
    <StorePage title="Confirmar compra" subtitle="Confirmação de vendas ainda não existe na API.">
      <StoreStatus
        title="Pedido não disponível"
        description="Ainda não há endpoint para confirmar ou recusar vendas. Quando a API estiver pronta, esta tela poderá responder pedidos reais."
        action={<Link to="/vendas">Voltar para compras recebidas</Link>}
      />
    </StorePage>
  )
}
