import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../ProductCard'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { extractErrorMessage } from '../../services/api'
import { produtoService } from '../../services/produtoService'
import type { Produto } from '../../types/produto'
import { Pagination } from '../ui/Pagination'

export function ReleasesPage() {
  const [products, setProducts] = useState<Produto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    produtoService
      .listarLancamentos(page)
      .then((result) => {
        if (!active) return
        setProducts(result.content)
        setTotalPages(result.totalPages)
        setError(null)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar os lançamentos. Atualize a página e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page])

  return (
    <StorePage title="Lançamentos" subtitle="As novidades que acabaram de chegar ao Vitral.">
      {loading ? (
        <StoreStatus title="Carregando lançamentos" description="Buscando os produtos mais recentes." busy />
      ) : error ? (
        <StoreStatus title="Os lançamentos não foram carregados" description={error} tone="error" />
      ) : products.length === 0 ? (
        <StoreStatus
          title="Nenhum lançamento disponível"
          description="Quando os sebos cadastrarem novos produtos, eles aparecerão aqui."
          action={<Link to="/busca">Ver acervo</Link>}
        />
      ) : (
        <>
          <section className="busca-grid" aria-label="Lançamentos recentes">
            {products.map((product) => (
              <ProductCard key={product.id} produto={product} />
            ))}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas de lançamentos" />
        </>
      )}
    </StorePage>
  )
}
