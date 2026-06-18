import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function SalesOrdersPage() {
  return (
    <StorePage title="Compras recebidas" subtitle="Pedidos recebidos dependem de endpoints de vendas.">
      <StoreStatus
        title="Vendas indisponíveis"
        description="O backend atual ainda não possui endpoints para listar pedidos enviados ao sebo. Esta rota já está restrita a contas do tipo SEBO."
        action={<Link to="/painel/produtos">Gerenciar produtos</Link>}
      />
    </StorePage>
  )
}
