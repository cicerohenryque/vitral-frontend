import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function FavoritesPage() {
  return (
    <StorePage
      title="Favoritos"
      subtitle="Os itens que você guardou para encontrar depois."
      searchPlaceholder="Pesquisar nos favoritos"
    >
      <StoreStatus
        title="Favoritos indisponíveis"
        description="O backend atual ainda não possui endpoint de favoritos. A rota já está protegida e pronta para receber os itens salvos quando a API existir."
        action={<Link to="/busca">Explorar o Vitral</Link>}
      />
    </StorePage>
  )
}
