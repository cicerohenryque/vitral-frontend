import { ProductPlaceholder, StorePage } from '../Layout/StorePage'
import './OffersPage.css'

const offers = [
  { label: 'Livro em oferta', badge: '-20%' },
  { label: 'Disco selecionado', badge: '-15%' },
  { label: 'Coleção especial', badge: '-30%' },
  { label: 'CD clássico', badge: '-10%' },
  { label: 'Quadrinho raro', badge: '-25%' },
  { label: 'Eletrônico vintage', badge: '-18%' },
  { label: 'Box de filmes', badge: '-35%' },
  { label: 'Item colecionável', badge: '-12%' },
]

export function OffersPage() {
  return (
    <StorePage
      title="Ofertas"
      subtitle="Itens selecionados por vendedores do Vitral."
      searchPlaceholder="Pesquisar nas ofertas"
    >
      <div className="offer-toolbar">
        <button className="is-selected">Todas</button>
        <button>Livros</button>
        <button>Discos</button>
        <button>Colecionáveis</button>
        <select aria-label="Ordenar ofertas">
          <option>Maiores descontos</option>
          <option>Mais recentes</option>
          <option>Menor preço</option>
        </select>
      </div>

      <section className="store-product-grid" aria-label="Itens em oferta">
        {offers.map((offer) => (
          <ProductPlaceholder label={offer.label} badge={offer.badge} key={offer.label} />
        ))}
      </section>
    </StorePage>
  )
}
