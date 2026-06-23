import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../services/api'
import { cestaService } from '../../services/cestaService'
import { favoritoService } from '../../services/favoritoService'
import { produtoService } from '../../services/produtoService'
import { seboService } from '../../services/seboService'
import type { Produto } from '../../types/produto'
import type { Sebo } from '../../types/sebo'
import './ProductPage.css'

export function ProductPage() {
  const { isAuthenticated, isUsuario } = useAuth()
  const { productId } = useParams()
  const numericProductId = Number(productId)
  const invalidProductId = !Number.isFinite(numericProductId)
  const [produto, setProduto] = useState<Produto | null>(null)
  const [sebo, setSebo] = useState<Sebo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<'cesta' | 'favorito' | null>(null)

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

  async function adicionarCesta() {
    if (!produto) return
    setBusyAction('cesta')
    setActionMessage(null)
    setActionError(null)
    try {
      const response = await cestaService.adicionar(produto.id)
      setActionMessage(response.mensagem)
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Nao foi possivel adicionar à cesta.'))
    } finally {
      setBusyAction(null)
    }
  }

  async function favoritar() {
    if (!produto) return
    setBusyAction('favorito')
    setActionMessage(null)
    setActionError(null)
    try {
      const response = await favoritoService.favoritar(produto.id)
      setActionMessage(response.mensagem)
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Nao foi possivel favoritar o produto.'))
    } finally {
      setBusyAction(null)
    }
  }

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
          <span className="product-category">{produto.categoriaNome ?? produto.condicao}</span>
          <h2>{produto.titulo}</h2>
          <p className="product-price">R$ {Number(produto.preco).toFixed(2)}</p>
          <p className="product-description">
            {produto.descricao || 'Consulte o vendedor para combinar pagamento, entrega ou retirada.'}
          </p>

          <dl className="product-metadata">
            <div><dt>Estado</dt><dd>{produto.condicao}</dd></div>
            <div><dt>Categoria</dt><dd>{produto.categoriaNome ?? 'Nao informada'}</dd></div>
            <div><dt>Autor</dt><dd>{produto.autor ?? 'Nao informado'}</dd></div>
            <div><dt>Estoque</dt><dd>{produto.estoque ?? 0}</dd></div>
            <div><dt>Disponibilidade</dt><dd>{produto.ativo && Number(produto.estoque ?? 0) > 0 ? 'Disponivel' : 'Indisponivel'}</dd></div>
          </dl>

          <div className="product-actions">
            {isAuthenticated && isUsuario ? (
              <>
                <button
                  className="product-reserve"
                  type="button"
                  disabled={!produto.ativo || Number(produto.estoque ?? 0) <= 0 || Boolean(busyAction)}
                  onClick={adicionarCesta}
                >
                  {busyAction === 'cesta' ? 'Adicionando...' : 'Adicionar à cesta'}
                </button>
                <Link className="product-cart" to="/carrinho">
                  Ver carrinho
                </Link>
                <button
                  className="product-favorite"
                  type="button"
                  disabled={!produto.ativo || Number(produto.estoque ?? 0) <= 0 || Boolean(busyAction)}
                  onClick={favoritar}
                >
                  {busyAction === 'favorito' ? 'Salvando...' : 'Favoritar'}
                </button>
              </>
            ) : isAuthenticated ? (
              <button className="product-reserve" type="button" disabled>
                Ações disponíveis para usuários
              </button>
            ) : (
              <Link className="product-cart" to="/auth">
                Entrar para comprar
              </Link>
            )}
          </div>
          {actionError ? <div className="flash error" role="alert">{actionError}</div> : null}
          {actionMessage ? <div className="flash success" role="status">{actionMessage}</div> : null}
          {!produto.ativo || Number(produto.estoque ?? 0) <= 0 ? (
            <p className="product-action-note">Este produto está indisponível no acervo.</p>
          ) : (
            <p className="product-action-note">
              Adicione o item à cesta e confirme o pedido para enviá-lo ao sebo.
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
