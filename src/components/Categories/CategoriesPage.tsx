import { useMemo, useState } from 'react'
import { StorePage } from '../Layout/StorePage'
import type { Categoria } from '../../types/categoria'
import './CategoriesPage.css'

const categories: Categoria[] = [
  { nome: 'Livros', slug: 'livros' },
  { nome: 'Discos', slug: 'discos' },
  { nome: 'CDs', slug: 'cds' },
  { nome: 'Eletronicos', slug: 'eletronicos' },
  { nome: 'Colecionaveis', slug: 'colecionaveis' },
  { nome: 'Quadrinhos', slug: 'quadrinhos' },
  { nome: 'Filmes', slug: 'filmes' },
  { nome: 'Raridades', slug: 'raridades' },
]

export function CategoriesPage() {
  const [query, setQuery] = useState('')

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return categories
    return categories.filter((category) => category.nome.toLowerCase().includes(normalizedQuery))
  }, [query])

  return (
    <StorePage
      title="Categorias"
      subtitle="Explore o acervo do Vitral por tipo de item."
      searchPlaceholder="Pesquisar uma categoria"
    >
      <form className="category-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <input
          aria-label="Pesquisar uma categoria"
          placeholder="Pesquisar uma categoria"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>

      <p className="category-error">
        Categorias ainda não existem como endpoint no backend atual. Use a busca para filtrar produtos por texto, sebo, condição e preço.
      </p>

      <section className="category-grid" aria-label="Categorias do acervo">
        {filteredCategories.length === 0 ? (
          <p className="category-empty">Nenhuma categoria encontrada.</p>
        ) : filteredCategories.map((category, index) => (
          <article className="category-card" key={category.slug}>
            <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
            <h2>{category.nome}</h2>
            {typeof category.totalProdutos === 'number' ? (
              <small>{category.totalProdutos} produtos</small>
            ) : null}
            <span className="category-arrow" aria-hidden="true">
              →
            </span>
          </article>
        ))}
      </section>
    </StorePage>
  )
}
