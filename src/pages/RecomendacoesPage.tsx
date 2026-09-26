import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Pagination } from '../components/ui/Pagination'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../services/api'
import { recomendacaoService } from '../services/recomendacaoService'
import type { Produto } from '../types/produto'
import './RecomendacoesPage.css'

export function RecomendacoesPage() {
  const [products, setProducts] = useState<Produto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    recomendacaoService.listar(page, 20)
      .then((result) => {
        if (!active) return
        setProducts(Array.from(new Map(result.content.map((product) => [product.id, product])).values()))
        setTotalPages(result.totalPages)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setProducts([])
        setTotalPages(0)
        setError(extractErrorMessage(err, 'Não foi possível carregar suas recomendações. Atualize a página e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [page, reloadKey])

  async function clearHistory() {
    if (!window.confirm('Deseja limpar o histórico usado nas suas recomendações? As sugestões atuais serão removidas e esta ação não poderá ser desfeita.')) return
    setClearing(true)
    setError(null)
    setSuccess(null)
    try {
      await recomendacaoService.limparHistorico()
      setPage(0)
      setSuccess('Histórico de recomendações limpo com sucesso.')
      setLoading(true)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível limpar o histórico de recomendações. Tente novamente.'))
    } finally {
      setClearing(false)
    }
  }

  function changePage(nextPage: number) {
    setLoading(true)
    setPage(nextPage)
  }

  function retry() {
    setError(null)
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  return (
    <StorePage title="Recomendados para você" subtitle="Sugestões baseadas nas suas interações com o acervo do Vitral.">
      <div className="recommendations-actions">
        <Button type="button" variant="ghost" disabled={clearing} onClick={clearHistory}>
          {clearing ? 'Limpando...' : 'Limpar histórico de recomendações'}
        </Button>
      </div>
      {success ? <div className="flash success" role="status">{success}</div> : null}
      {loading ? (
        <StoreStatus title="Carregando recomendações" description="Preparando sugestões para você." busy />
      ) : error ? (
        <StoreStatus title="Suas recomendações não foram carregadas" description={error} tone="error"
          action={<Button type="button" onClick={retry}>Tentar novamente</Button>} />
      ) : products.length === 0 ? (
        <StoreStatus
          title="Nenhum produto disponível para recomendar"
          description="Novos itens aparecerão aqui quando estiverem disponíveis no acervo."
          action={<Link to="/busca">Explorar o acervo</Link>}
        />
      ) : (
        <>
          <section className="recommendations-grid" aria-label="Produtos recomendados">
            {products.map((product) => <ProductCard key={product.id} produto={product} />)}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} label="Páginas de recomendações" />
        </>
      )}
    </StorePage>
  )
}
