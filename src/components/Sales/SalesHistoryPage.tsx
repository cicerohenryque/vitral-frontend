import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function SalesHistoryPage() {
  return (
    <StorePage title="Histórico de vendas" subtitle="Consulte os pedidos processados pelo seu sebo.">
      <StoreStatus
        title="O backend ainda não possui histórico de vendas"
        description="Assim que o endpoint de vendas estiver disponível, esta tela poderá carregar pedidos concluídos, recusados e cancelados do seu sebo."
        action={<Link to="/vendas">Voltar para compras recebidas</Link>}
      />
    </StorePage>
  )
}
