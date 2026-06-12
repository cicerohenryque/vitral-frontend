import { Link } from 'react-router-dom'
import { ProductPlaceholder, StorePage } from '../Layout/StorePage'
import './SellerPage.css'

const sellerProducts = ['Livro clássico', 'Disco selecionado', 'Coleção especial', 'Quadrinho raro']

export function SellerPage() {
  return (
    <StorePage title="Perfil do vendedor" subtitle="Conheça o sebo e os itens disponíveis.">
      <section className="seller-profile">
        <div className="seller-avatar">SC</div>
        <div className="seller-copy">
          <span>Sebo verificado</span>
          <h2>Sebo Central</h2>
          <p>
            Livros, discos e raridades selecionadas. Atendimento para reservas, entregas e retiradas
            diretamente com o comprador.
          </p>
          <dl>
            <div><dt>Localização</dt><dd>Campina Grande, PB</dd></div>
            <div><dt>No Vitral desde</dt><dd>2024</dd></div>
            <div><dt>Itens disponíveis</dt><dd>48</dd></div>
          </dl>
        </div>
        <div className="seller-actions">
          <Link to="/mensagens">Enviar mensagem</Link>
          <button type="button">Seguir vendedor</button>
        </div>
      </section>

      <section className="seller-catalog">
        <header>
          <div>
            <h2>Itens do Sebo Central</h2>
            <p>Conheça parte do acervo publicado pelo vendedor.</p>
          </div>
          <select aria-label="Filtrar itens do vendedor">
            <option>Todos os itens</option>
            <option>Livros</option>
            <option>Discos</option>
          </select>
        </header>
        <div className="store-product-grid">
          {sellerProducts.map((product) => (
            <Link className="seller-product-link" to="/produto/1" key={product}>
              <ProductPlaceholder label={product} />
            </Link>
          ))}
        </div>
      </section>
    </StorePage>
  )
}
