import { Link, useSearchParams } from 'react-router-dom'
import { ProductPlaceholder, StorePage } from '../Layout/StorePage'
import './SearchResultsPage.css'

const results = [
  'Livro clássico',
  'Edição especial',
  'Coleção de contos',
  'Livro ilustrado',
  'Obra selecionada',
  'Edição de bolso',
  'Livro raro',
  'Box literário',
]

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || 'livros'

  return (
    <StorePage
      title="Resultados da pesquisa"
      subtitle={`Itens encontrados para “${query}”.`}
      searchPlaceholder={query}
    >
      <section className="search-results-layout">
        <aside className="search-filters">
          <h2>Filtrar por</h2>
          <fieldset>
            <legend>Categoria</legend>
            {['Livros', 'Discos', 'CDs', 'Colecionáveis'].map((filter) => (
              <label key={filter}><input type="checkbox" /> {filter}</label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Estado do item</legend>
            {['Novo', 'Muito bom', 'Usado'].map((filter) => (
              <label key={filter}><input type="checkbox" /> {filter}</label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Faixa de preço</legend>
            <div className="price-fields">
              <input aria-label="Preço mínimo" placeholder="Mín." />
              <input aria-label="Preço máximo" placeholder="Máx." />
            </div>
          </fieldset>
          <button type="button">Aplicar filtros</button>
        </aside>

        <div className="search-results">
          <header>
            <span>{results.length} resultados</span>
            <select aria-label="Ordenar resultados">
              <option>Mais relevantes</option>
              <option>Mais recentes</option>
              <option>Menor preço</option>
            </select>
          </header>
          <div className="search-product-grid">
            {results.map((result, index) => (
              <Link to={`/produto/${index + 1}`} key={result}>
                <ProductPlaceholder label={result} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </StorePage>
  )
}
