import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../ProductCard'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { Pagination } from '../ui/Pagination'
import { produtoService } from '../../services/produtoService'
import { seboService } from '../../services/seboService'
import { extractErrorMessage } from '../../services/api'
import type { Produto } from '../../types/produto'
import type { Sebo } from '../../types/sebo'
import { StatusVerificacao } from '../../types/sebo'
import { useAuth } from '../../hooks/useAuth'
import './SellerPage.css'

export function SellerPage() {
  const { isUsuario } = useAuth()
  const { sellerId } = useParams()
  const numericSellerId = Number(sellerId)
  const invalidSellerId = !Number.isFinite(numericSellerId)
  const [seller, setSeller] = useState<Sebo | null>(null)
  const [products, setProducts] = useState<Produto[]>([])
  const [loading, setLoading] = useState(!invalidSellerId)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    let active = true
    if (invalidSellerId) return

    Promise.all([
      seboService.buscarPorId(numericSellerId),
      produtoService.listarPorSebo(numericSellerId, page, 20),
    ])
      .then(([sellerData, productPage]) => {
        if (!active) return
        setSeller(sellerData)
        setProducts(productPage.content)
        setTotalPages(productPage.totalPages)
        setTotalProducts(productPage.totalElements)
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar este sebo. Volte à busca e tente novamente.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [invalidSellerId, numericSellerId, page])

  if (invalidSellerId) {
    return (
      <StorePage title="Sebo indisponível" subtitle="O identificador informado não é válido.">
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
    <StorePage title="Perfil do vendedor" subtitle="Conheça o sebo e os itens disponíveis.">
      {loading ? (
        <StoreStatus
          title="Carregando sebo"
          description="Buscando o perfil público e os produtos disponíveis."
          busy
        />
      ) : null}
      {!loading && error ? (
        <StoreStatus
          title="Este sebo não foi carregado"
          description={error}
          tone="error"
          action={<Link to="/busca?tab=sebos">Buscar sebos</Link>}
        />
      ) : null}
      {seller ? (
        <>
          <section className="seller-profile">
            <div className="seller-avatar">
              {seller.fotoUrl ? <img src={seller.fotoUrl} alt={`Logo do ${seller.nome}`} /> : <span>{seller.nome.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="seller-copy">
              <div className="seller-status-row">
                <span className="seller-status">{seller.statusVerificacao === StatusVerificacao.VERIFICADO ? '✓ Sebo verificado' : 'Sebo cadastrado'}</span>
                <span className="seller-catalog-count">{totalProducts} {totalProducts === 1 ? 'item disponível' : 'itens disponíveis'}</span>
              </div>
              <h2>{seller.nome}</h2>
              {seller.descricao ? <p>{seller.descricao}</p> : <p className="seller-no-description">Este sebo ainda não adicionou uma descrição pública.</p>}
            </div>
            <div className="seller-actions">
              <Link to={`/busca?tab=produtos&seboId=${seller.id}`}>Ver produtos</Link>
              <Link to={`/mensagens?destinatarioId=${seller.accountId}&nome=${encodeURIComponent(seller.nome)}`}>
                Enviar mensagem
              </Link>
              {isUsuario ? <Link to={`/painel/sugestoes-catalogo?seboId=${seller.id}`}>Informar produto deste sebo</Link> : null}
            </div>
          </section>

          <section className="seller-catalog">
            <header>
              <div>
                <h2>Itens de {seller.nome}</h2>
                <p>Conheça os produtos disponíveis neste sebo.</p>
              </div>
            </header>
            {products.length === 0 ? (
              <StoreStatus
                title="Nenhum produto cadastrado"
                description="Este sebo ainda não possui produtos publicados."
                action={<Link to="/busca">Voltar para busca</Link>}
              />
            ) : (
              <div className="busca-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} produto={product} />
                ))}
              </div>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Páginas de produtos do sebo"
            />
          </section>
        </>
      ) : null}
    </StorePage>
  )
}
