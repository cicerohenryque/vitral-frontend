import { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { ProductCarousel } from '../components/ProductCarousel'
import { buscaService } from '../services/buscaService'
import type { Produto } from '../types/produto'

export function HomePage() {
  const [recentes, setRecentes] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    buscaService
      .buscarProdutos({}, 0, 12)
      .then((page) => {
        if (active) setRecentes(page.content)
      })
      .catch(() => {
        if (active) setRecentes([])
      })
      .finally(() => {
        if (active) setLoading(false)
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
        <ProductCarousel title="Produtos disponíveis" produtos={recentes} loading={loading} />
        <ProductCarousel title="Clássicos" produtos={recentes.slice().reverse()} loading={loading} />
      </main>
    </div>
  )
}
