import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { extractErrorMessage } from '../../services/api'
import { produtoService } from '../../services/produtoService'
import type { Produto } from '../../types/produto'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { Pagination } from '../ui/Pagination'
import { ProductCard } from '../ProductCard'

export function ClassicsPage() {
  const [products, setProducts] = useState<Produto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    produtoService.listarClassicos(page)
      .then((result) => {
        if (!active) return
        setProducts(result.content)
        setTotalPages(result.totalPages)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar os clássicos. Atualize a página e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [page])

  function changePage(nextPage: number) {
    setLoading(true)
    setError(null)
    setPage(nextPage)
  }

  return (
    <StorePage title="Clássicos" subtitle="Obras que continuam encantando diferentes gerações.">
      {loading ? (
        <StoreStatus title="Carregando clássicos" description="Buscando os clássicos disponíveis." busy />
      ) : error ? (
        <StoreStatus title="Os clássicos não foram carregados" description={error} tone="error" />
      ) : products.length === 0 ? (
        <StoreStatus title="Nenhum clássico disponível" description="Quando novos clássicos forem publicados, eles aparecerão aqui." action={<Link to="/busca">Ver acervo</Link>} />
      ) : (
        <>
          <section className="busca-grid" aria-label="Produtos clássicos">
            {products.map((product) => <ProductCard key={product.id} produto={product} />)}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} label="Páginas de clássicos" />
        </>
      )}
    </StorePage>
  )
}
