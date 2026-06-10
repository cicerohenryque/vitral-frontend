import { Link } from 'react-router-dom'
import { CartIcon, HeartIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './ProductPage.css'

export function ProductPage() {
  return (
    <StorePage title="Detalhes do produto" subtitle="Conheça o item antes de solicitar a reserva.">
      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-main-image" />
          <div className="product-thumbnails">
            {Array.from({ length: 4 }, (_, index) => (
              <button
                className={index === 0 ? 'is-selected' : ''}
                type="button"
                aria-label={`Ver imagem ${index + 1}`}
                key={index}
              />
            ))}
          </div>
        </div>

        <article className="product-information">
          <span className="product-category">Livros / Clássicos</span>
          <h2>Livro selecionado</h2>
          <p className="product-price">R$ 38,00</p>
          <p className="product-description">
            Exemplar conservado, com sinais naturais do tempo e páginas completas. Consulte o vendedor
            para combinar pagamento, entrega ou retirada.
          </p>

          <dl className="product-metadata">
            <div><dt>Estado</dt><dd>Usado, muito bom</dd></div>
            <div><dt>Publicação</dt><dd>Edição clássica</dd></div>
            <div><dt>Disponibilidade</dt><dd>1 unidade</dd></div>
          </dl>

          <div className="product-actions">
            <button className="product-reserve" type="button">Solicitar reserva</button>
            <Link className="product-cart" to="/carrinho">
              <CartIcon size={22} />
              Adicionar ao carrinho
            </Link>
            <button className="product-favorite" type="button" aria-label="Adicionar aos favoritos">
              <HeartIcon size={26} />
            </button>
          </div>

          <Link className="product-seller" to="/vendedor/sebo-central">
            <span>Vendido por</span>
            <strong>Sebo Central</strong>
            <small>Ver perfil do vendedor →</small>
          </Link>
        </article>
      </section>
    </StorePage>
  )
}
