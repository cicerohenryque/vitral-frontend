import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

export function SaleConfirmationPage() {
  return (
    <StorePage title="Confirmar compra" subtitle="Confirmação de vendas ainda não existe na API.">
      <section className="store-empty">
        <div>
          <h2>Pedido não disponível</h2>
          <p>
            Ainda não há endpoint para confirmar ou recusar vendas. Quando a API estiver pronta,
            esta tela poderá responder pedidos reais.
          </p>
          <Link className="store-primary-link" to="/vendas">
            Voltar para compras recebidas
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
