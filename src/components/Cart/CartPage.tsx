import { Link } from 'react-router-dom'
import { CartIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './CartPage.css'

export function CartPage() {
  return (
    <StorePage
      title="Carrinho"
      subtitle="A persistência do carrinho depende de endpoints que ainda não existem no backend."
      searchPlaceholder="Pesquisar no acervo"
    >
      <section className="store-empty">
        <div>
          <CartIcon size={57} />
          <h2>Carrinho indisponível</h2>
          <p>
            O backend atual ainda não possui endpoints de carrinho. Quando estiver disponível,
            seus itens salvos aparecerão aqui.
          </p>
          <Link className="store-primary-link" to="/busca">
            Buscar produtos
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
