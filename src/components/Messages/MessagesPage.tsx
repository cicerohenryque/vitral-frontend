import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './MessagesPage.css'

export function MessagesPage() {
  return (
    <StorePage title="Mensagens" subtitle="Converse diretamente com os vendedores.">
      <section className="store-empty">
        <span>Mensagens indisponíveis</span>
        <h2>Não há endpoint de mensagens no backend.</h2>
        <p>
          Removi as conversas fictícias para manter a tela alinhada aos dados reais da API.
          Quando o backend entregar mensagens, esta página pode ser conectada ao histórico.
        </p>
        <Link to="/busca">Encontrar produtos</Link>
      </section>
    </StorePage>
  )
}
