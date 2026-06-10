import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './CategoriesPage.css'

const categories = [
  'Livros',
  'Discos',
  'CDs',
  'Eletrônicos',
  'Colecionáveis',
  'Quadrinhos',
  'Filmes',
  'Raridades',
]

export function CategoriesPage() {
  return (
    <StorePage
      title="Categorias"
      subtitle="Explore o acervo do Vitral por tipo de item."
      searchPlaceholder="Pesquisar uma categoria"
    >
      <section className="category-grid" aria-label="Categorias do acervo">
        {categories.map((category, index) => (
          <Link className="category-card" to={`/?categoria=${category.toLowerCase()}`} key={category}>
            <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
            <h2>{category}</h2>
            <span className="category-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>
    </StorePage>
  )
}
