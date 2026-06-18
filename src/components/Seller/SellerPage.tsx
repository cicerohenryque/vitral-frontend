import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../ProductCard'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { produtoService } from '../../services/produtoService'
import { seboService } from '../../services/seboService'
import { extractErrorMessage } from '../../services/api'
import type { Produto } from '../../types/produto'
import type { Sebo } from '../../types/sebo'
import './SellerPage.css'

export function SellerPage() {
  const { sellerId } = useParams()
  const numericSellerId = Number(sellerId)
  const invalidSellerId = !Number.isFinite(numericSellerId)
  const [seller, setSeller] = useState<Sebo | null>(null)
  const [products, setProducts] = useState<Produto[]>([])
  const [loading, setLoading] = useState(!invalidSellerId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (invalidSellerId) return

    Promise.all([
      seboService.buscarPorId(numericSellerId),
      produtoService.listarPorSebo(numericSellerId, 0, 20),
    ])
      .then(([sellerData, productPage]) => {
        if (!active) return
        setSeller(sellerData)
        setProducts(productPage.content)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Nao foi possivel carregar este sebo.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [invalidSellerId, numericSellerId])

  if (invalidSellerId) {
    return (
      <StorePage title="Sebo indisponivel" subtitle="O identificador informado nao e valido.">
        <StoreStatus
          title="ID de sebo invalido"
          description="Confira o link acessado ou procure o sebo novamente pela busca."
          tone="error"
          action={<Link to="/busca?tab=sebos">Buscar sebos</Link>}
        />
      </StorePage>
    )
  }

  return (
    <StorePage title="Perfil do vendedor" subtitle="Conheca o sebo e os itens disponiveis.">
      {loading ? (
        <StoreStatus
          title="Carregando sebo"
          description="Buscando o perfil público e os produtos disponíveis."
          busy
        />
      ) : null}
      {!loading && error ? (
        <StoreStatus
          title="Nao foi possivel carregar este sebo"
          description={error}
          tone="error"
          action={<Link to="/busca?tab=sebos">Buscar sebos</Link>}
        />
      ) : null}
      {seller ? (
        <>
          <section className="seller-profile">
            <div className="seller-avatar">{seller.nome.slice(0, 2).toUpperCase()}</div>
            <div className="seller-copy">
              <span>Sebo cadastrado</span>
              <h2>{seller.nome}</h2>
              {seller.descricao ? <p>{seller.descricao}</p> : null}
              <dl>
                <div><dt>Localizacao</dt><dd>{seller.cidade ? `${seller.cidade}${seller.uf ? `, ${seller.uf}` : ''}` : 'Nao informada'}</dd></div>
                <div><dt>Contato</dt><dd>{seller.telefone ?? seller.email}</dd></div>
                <div><dt>Itens carregados</dt><dd>{products.length}</dd></div>
              </dl>
            </div>
            <div className="seller-actions">
              <Link to={`/busca?tab=produtos&seboId=${seller.id}`}>Ver produtos</Link>
            </div>
          </section>

          <section className="seller-catalog">
            <header>
              <div>
                <h2>Itens de {seller.nome}</h2>
                <p>Produtos retornados por /produtos/sebo/{seller.id}.</p>
              </div>
            </header>
            {products.length === 0 ? (
              <StoreStatus
                title="Nenhum produto cadastrado"
                description="Este sebo existe no backend, mas ainda nao possui produtos publicados."
                action={<Link to="/busca">Voltar para busca</Link>}
              />
            ) : (
              <div className="busca-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} produto={product} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </StorePage>
  )
}
