import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function MessagesPage() {
  return (
    <StorePage title="Mensagens" subtitle="Converse diretamente com os vendedores.">
      <StoreStatus
        title="Não há endpoint de mensagens"
        description="As conversas fictícias foram removidas para manter a tela alinhada aos dados reais da API. Quando o backend entregar mensagens, esta página pode ser conectada ao histórico."
        action={<Link to="/busca">Encontrar produtos</Link>}
      />
    </StorePage>
  )
}
