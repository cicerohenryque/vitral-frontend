import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

export function SalesHistoryPage() {
  return (
    <StorePage title="Histórico de vendas" subtitle="Consulte os pedidos processados pelo seu sebo.">
      <section className="store-empty">
        <span>Sem histórico disponível</span>
        <h2>O backend ainda não possui histórico de vendas.</h2>
        <p>
          Assim que o endpoint de vendas estiver disponível, esta tela poderá carregar pedidos
          concluídos, recusados e cancelados do seu sebo.
        </p>
        <Link to="/vendas">Voltar para compras recebidas</Link>
      </section>
    </StorePage>
  )
}
