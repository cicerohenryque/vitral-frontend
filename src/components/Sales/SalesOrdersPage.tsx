import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

export function SalesOrdersPage() {
  return (
    <StorePage title="Compras recebidas" subtitle="Pedidos recebidos dependem de endpoints de vendas.">
      <section className="store-empty">
        <div>
          <h2>Nenhuma compra recebida</h2>
          <p>
            O backend atual ainda não possui endpoints para listar pedidos enviados ao sebo.
            Esta rota já está restrita a contas do tipo SEBO.
          </p>
          <Link className="store-primary-link" to="/painel/produtos">
            Gerenciar produtos
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
