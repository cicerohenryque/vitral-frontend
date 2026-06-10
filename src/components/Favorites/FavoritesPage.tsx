import { Link } from 'react-router-dom'
import { HeartIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'

export function FavoritesPage() {
  return (
    <StorePage
      title="Favoritos"
      subtitle="Os itens que você guardou para encontrar depois."
      searchPlaceholder="Pesquisar nos favoritos"
    >
      <section className="store-empty">
        <div>
          <HeartIcon size={54} />
          <h2>Sua lista está vazia</h2>
          <p>
            Quando encontrar algo especial, selecione o coração para manter o item salvo nesta página.
          </p>
          <Link className="store-primary-link" to="/">
            Explorar o Vitral
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
