import { useEffect, useState } from 'react'
import { ProductCarousel } from '../components/ProductCarousel'
import { extractErrorMessage } from '../services/api'
import { buscaService } from '../services/buscaService'
import { produtoService } from '../services/produtoService'
import { useAuth } from '../hooks/useAuth'
import type { Produto } from '../types/produto'

export function HomePage() {
  const { isSebo, seboId } = useAuth()
  const [recentes, setRecentes] = useState<Produto[]>([])
  const [classicos, setClassicos] = useState<Produto[]>([])
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [loadingClassicos, setLoadingClassicos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    if (isSebo) {
      // Conta de sebo: nunca mostrar o catalogo de outros sebos, mesmo antes do
      // perfil proprio ser cadastrado/carregado (nesse caso, a vitrine fica vazia).
      if (!seboId) {
        setRecentes([])
        setClassicos([])
        setError(null)
        setLoadingRecentes(false)
        setLoadingClassicos(false)
        return () => {
          active = false
        }
      }

      buscaService.buscarProdutos({ seboId }, 0, 12)
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

      produtoService.listarPorSebo(seboId, 0, 12, 'createdAt,asc')
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
    }

    buscaService.buscarProdutos({}, 0, 12)
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

    produtoService.listarClassicos(0, 12)
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
  }, [isSebo, seboId])

  return (
    <div className="page">
      <main className="container">
        {error ? <div className="flash error" role="alert">{error}</div> : null}
        <ProductCarousel title="Produtos disponíveis" produtos={recentes} loading={loadingRecentes} />
        <ProductCarousel title="Clássicos" produtos={classicos} loading={loadingClassicos} />
      </main>
    </div>
  )
}
