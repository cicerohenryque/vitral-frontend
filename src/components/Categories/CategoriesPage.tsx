import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import { extractErrorMessage } from '../../services/api'
import { categoriaService } from '../../services/categoriaService'
import type { Categoria } from '../../types/categoria'
import './CategoriesPage.css'

const fallbackCategories: Categoria[] = [
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
  const [categories, setCategories] = useState<Categoria[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    categoriaService
      .listar()
      .then((items) => {
        if (active) setCategories(items.length ? items : fallbackCategories)
      })
      .catch((err) => {
        if (!active) return
        setCategories(fallbackCategories)
        setError(extractErrorMessage(err, 'Nao foi possivel carregar as categorias do servidor.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return categories
    return categories.filter((category) => category.nome.toLowerCase().includes(normalizedQuery))
  }, [categories, query])

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

      {error ? <p className="category-error">{error}</p> : null}

      <section className="category-grid" aria-label="Categorias do acervo">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div className="category-card category-card-skeleton" key={index} aria-hidden="true" />
          ))
        ) : filteredCategories.length === 0 ? (
          <p className="category-empty">Nenhuma categoria encontrada.</p>
        ) : filteredCategories.map((category, index) => (
          <Link className="category-card" to={`/busca?tab=produtos&categoria=${encodeURIComponent(category.slug)}`} key={category.slug}>
            <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
            <h2>{category.nome}</h2>
            {typeof category.totalProdutos === 'number' ? (
              <small>{category.totalProdutos} produtos</small>
            ) : null}
            <span className="category-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>
    </StorePage>
  )
}
