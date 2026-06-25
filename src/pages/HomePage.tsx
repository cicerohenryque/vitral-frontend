import { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { ProductCarousel } from '../components/ProductCarousel'
import { extractErrorMessage } from '../services/api'
import { buscaService } from '../services/buscaService'
import { produtoService } from '../services/produtoService'
import type { Produto } from '../types/produto'

export function HomePage() {
  const [recentes, setRecentes] = useState<Produto[]>([])
  const [classicos, setClassicos] = useState<Produto[]>([])
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [loadingClassicos, setLoadingClassicos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    buscaService
      .buscarProdutos({}, 0, 12)
      .then((page) => {
        if (active) setRecentes(page.content)
      })
      .catch((err) => {
        if (active) {
          setError(extractErrorMessage(err, 'Nao foi possivel carregar os produtos.'))
          setRecentes([])
        }
      })
      .finally(() => {
        if (active) setLoadingRecentes(false)
      })

    produtoService
      .listarClassicos(0, 12)
      .then((page) => {
        if (active) setClassicos(page.content)
      })
      .catch(() => {
        if (active) setClassicos([])
      })
      .finally(() => {
        if (active) setLoadingClassicos(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page">
      <TopBar />
      <Header />
      <main className="container">
        {error ? <div className="flash error" role="alert">{error}</div> : null}
        <ProductCarousel title="Produtos disponíveis" produtos={recentes} loading={loadingRecentes} />
        <ProductCarousel title="Clássicos" produtos={classicos} loading={loadingClassicos} />
      </main>
    </div>
  )
}
