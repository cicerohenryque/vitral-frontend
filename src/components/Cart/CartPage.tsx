import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function CartPage() {
  return (
    <StorePage
      title="Carrinho"
      subtitle="A persistência do carrinho depende de endpoints que ainda não existem no backend."
      searchPlaceholder="Pesquisar no acervo"
    >
      <StoreStatus
        title="Carrinho indisponível"
        description="O backend atual ainda não possui endpoints de carrinho. Quando estiver disponível, seus itens salvos aparecerão aqui."
        action={<Link to="/busca">Buscar produtos</Link>}
      />
    </StorePage>
  )
}
