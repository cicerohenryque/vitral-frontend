import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './ReleasesPage.css'

export function ReleasesPage() {
  return (
    <StorePage title="Lançamentos" subtitle="As novidades que acabaram de chegar ao Vitral.">
      <section className="store-empty">
        <span>Lançamentos indisponíveis</span>
        <h2>A API ainda não possui endpoint para novidades.</h2>
        <p>
          Os cards fictícios foram removidos. Quando houver filtro de produtos recentes no backend,
          esta tela pode listar os itens publicados por data.
        </p>
        <Link to="/busca">Ver acervo real</Link>
      </section>
    </StorePage>
  )
}
