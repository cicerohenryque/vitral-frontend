import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function OffersPage() {
  return (
    <StorePage title="Ofertas" subtitle="Itens selecionados por vendedores do Vitral.">
      <StoreStatus
        title="O backend ainda não expõe ofertas"
        description="A tela não exibe mais produtos fictícios. Por enquanto, use a busca real para encontrar itens disponíveis no acervo."
        action={<Link to="/busca">Buscar produtos</Link>}
      />
    </StorePage>
  )
}
