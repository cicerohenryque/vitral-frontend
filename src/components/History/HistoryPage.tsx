import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './HistoryPage.css'

export function HistoryPage() {
  return (
    <StorePage title="Histórico" subtitle="Histórico de pedidos ainda não está disponível no backend.">
      <section className="store-empty">
        <div>
          <h2>Histórico indisponível</h2>
          <p>
            Ainda não há endpoint para listar pedidos concluídos ou cancelados. A tela está protegida
            e pronta para receber dados reais quando a API existir.
          </p>
          <Link className="store-primary-link" to="/busca">
            Explorar acervo
          </Link>
        </div>
      </section>
    </StorePage>
  )
}
