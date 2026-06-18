import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './CheckoutPage.css'

export function CheckoutPage() {
  return (
    <StorePage title="Confirmar pedido" subtitle="Pedidos ainda não estão disponíveis no backend atual.">
      <section className="checkout-success">
        <span>Funcionalidade pendente</span>
        <h2>Não há endpoint para confirmar pedidos.</h2>
        <p>
          Assim que o backend expuser criação de pedidos/reservas, esta tela poderá enviar as
          solicitações reais para os sebos.
        </p>
        <div>
          <Link to="/carrinho">Voltar ao carrinho</Link>
          <Link to="/busca">Buscar produtos</Link>
        </div>
      </section>
    </StorePage>
  )
}
