import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function HistoryPage() {
  return (
    <StorePage title="Histórico" subtitle="Histórico de pedidos ainda não está disponível no backend.">
      <StoreStatus
        title="Histórico indisponível"
        description="Ainda não há endpoint para listar pedidos concluídos ou cancelados. A tela está protegida e pronta para receber dados reais quando a API existir."
        action={<Link to="/busca">Explorar acervo</Link>}
      />
    </StorePage>
  )
}
