import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { extractErrorMessage } from '../../services/api'
import { produtoService } from '../../services/produtoService'
import { seboService } from '../../services/seboService'
import type { Produto } from '../../types/produto'
import type { Sebo } from '../../types/sebo'
import './ProductPage.css'

export function ProductPage() {
  const { productId } = useParams()
  const numericProductId = Number(productId)
  const invalidProductId = !Number.isFinite(numericProductId)
  const [produto, setProduto] = useState<Produto | null>(null)
  const [sebo, setSebo] = useState<Sebo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (invalidProductId) return

    produtoService
      .buscarPorId(numericProductId)
      .then(async (produtoEncontrado) => {
        if (!active) return
        setProduto(produtoEncontrado)
        try {
          const seboEncontrado = await seboService.buscarPorId(produtoEncontrado.seboId)
          if (active) setSebo(seboEncontrado)
        } catch {
          if (active) setSebo(null)
        }
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err, 'Produto nao encontrado.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [invalidProductId, numericProductId])

  if (invalidProductId) {
    return (
      <StorePage title="Produto indisponivel" subtitle="Nao foi possivel carregar este item.">
        <StoreStatus
          title="Produto invalido"
          description="Confira o link acessado e tente abrir o produto novamente pela busca."
          tone="error"
        />
      </StorePage>
    )
  }

  if (loading) {
    return (
      <StorePage title="Detalhes do produto" subtitle="Carregando informacoes do item.">
        <section className="product-detail" aria-busy="true">
          <div className="product-gallery">
            <div className="product-main-image" />
          </div>
          <article className="product-information">
            <span className="product-category">Carregando</span>
            <h2>Produto</h2>
            <p className="product-description">Buscando os detalhes no catalogo.</p>
          </article>
        </section>
      </StorePage>
    )
  }

  if (error || !produto) {
    return (
      <StorePage title="Produto indisponivel" subtitle="Nao foi possivel carregar este item.">
        <StoreStatus
          title="Produto nao encontrado"
          description={error ?? 'Nao encontramos este produto no backend.'}
          tone="error"
          action={<Link to="/busca">Voltar para busca</Link>}
        />
      </StorePage>
    )
  }

  return (
    <StorePage title="Detalhes do produto" subtitle="Conheca o item antes de solicitar a reserva.">
      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-main-image">
            {produto.fotoUrl ? <img src={produto.fotoUrl} alt={produto.titulo} /> : null}
          </div>
          {produto.fotoUrl ? (
            <div className="product-thumbnails">
              {Array.from({ length: 1 }, (_, index) => (
                <button
                  className={index === 0 ? 'is-selected' : ''}
                  type="button"
                  aria-label={`Ver imagem ${index + 1}`}
                  key={index}
                />
              ))}
            </div>
          ) : null}
        </div>

        <article className="product-information">
          <span className="product-category">{produto.condicao}</span>
          <h2>{produto.titulo}</h2>
          <p className="product-price">R$ {Number(produto.preco).toFixed(2)}</p>
          <p className="product-description">
            {produto.descricao || 'Consulte o vendedor para combinar pagamento, entrega ou retirada.'}
          </p>

          <dl className="product-metadata">
            <div><dt>Estado</dt><dd>{produto.condicao}</dd></div>
            <div><dt>Autor</dt><dd>{produto.autor ?? 'Nao informado'}</dd></div>
            <div><dt>Disponibilidade</dt><dd>{produto.ativo ? 'Disponivel' : 'Indisponivel'}</dd></div>
          </dl>

          <div className="product-actions">
            <button className="product-reserve" type="button" disabled>
              Reserva indisponível
            </button>
            <button className="product-cart" type="button" disabled>
              Carrinho indisponível
            </button>
            <button className="product-favorite" type="button" disabled aria-label="Favoritos indisponíveis">
              Favorito indisponível
            </button>
          </div>
          {!produto.ativo ? (
            <p className="product-action-note">Este produto está indisponível no acervo.</p>
          ) : (
            <p className="product-action-note">
              Reserva, carrinho e favoritos dependem de endpoints que ainda não existem no backend.
            </p>
          )}

          <Link className="product-seller" to={`/vendedor/${produto.seboId}`}>
            <span>Vendido por</span>
            <strong>{sebo?.nome ?? `Sebo #${produto.seboId}`}</strong>
            <small>Ver perfil do vendedor →</small>
          </Link>
        </article>
      </section>
    </StorePage>
  )
}
