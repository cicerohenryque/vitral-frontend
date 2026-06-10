import { ProductPlaceholder, StorePage } from '../Layout/StorePage'
import './ReleasesPage.css'

const releases = [
  'Novo no acervo',
  'Edição recém-chegada',
  'Coleção desta semana',
  'Achado recente',
]

export function ReleasesPage() {
  return (
    <StorePage
      title="Lançamentos"
      subtitle="As novidades que acabaram de chegar ao Vitral."
      searchPlaceholder="Pesquisar lançamentos"
    >
      <section className="release-feature">
        <div className="release-feature-image">
          <span>Novo</span>
        </div>
        <div className="release-feature-copy">
          <p className="release-eyebrow">Destaque da semana</p>
          <h2>Novas histórias, discos e raridades esperando por você.</h2>
          <p>
            Acompanhe os itens publicados recentemente pelos sebos e vendedores da comunidade Vitral.
          </p>
          <button type="button">Ver novidade</button>
        </div>
      </section>

      <section className="release-list" aria-label="Lançamentos recentes">
        <h2>Chegaram agora</h2>
        <div className="store-product-grid">
          {releases.map((release) => (
            <ProductPlaceholder label={release} key={release} />
          ))}
        </div>
      </section>
    </StorePage>
  )
}
