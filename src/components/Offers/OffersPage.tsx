import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './OffersPage.css'

export function OffersPage() {
  return (
    <StorePage title="Ofertas" subtitle="Itens selecionados por vendedores do Vitral.">
      <section className="store-empty">
        <span>Ofertas indisponíveis</span>
        <h2>O backend ainda não expõe uma listagem de ofertas.</h2>
        <p>
          A tela não exibe mais produtos fictícios. Por enquanto, use a busca real para encontrar
          itens disponíveis no acervo.
        </p>
        <Link to="/busca">Buscar produtos</Link>
      </section>
    </StorePage>
  )
}
