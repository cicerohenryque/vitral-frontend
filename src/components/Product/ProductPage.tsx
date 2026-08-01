import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../services/api'
import { cestaService } from '../../services/cestaService'
import { favoritoService } from '../../services/favoritoService'
import { produtoService } from '../../services/produtoService'
import { seboService } from '../../services/seboService'
import type { Produto, ProdutoVendedor } from '../../types/produto'
import type { Sebo } from '../../types/sebo'
import { formatDateBR } from '../../utils/date'
import './ProductPage.css'
import { bookGenreLabel } from '../../constants/productCatalog'

const formatBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

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
  const [vendedores, setVendedores] = useState<ProdutoVendedor[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [loadingVendedores, setLoadingVendedores] = useState(true)
  const [vendedoresError, setVendedoresError] = useState<string | null>(null)

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

  useEffect(() => {
    let active = true
    if (invalidProductId) return
    produtoService.listarVendedores(numericProductId)
      .then((items) => {
        if (!active) return
        const sorted = [...items].sort((a, b) => Number(a.precoEfetivo) - Number(b.precoEfetivo))
        setVendedores(sorted)
        setSelectedProductId(sorted[0]?.produtoId ?? null)
      })
      .catch((err) => {
        if (!active) return
        setVendedoresError(extractErrorMessage(err, 'Não foi possível carregar os vendedores.'))
      })
      .finally(() => {
        if (active) setLoadingVendedores(false)
      })
    return () => { active = false }
  }, [invalidProductId, numericProductId])

  const selectedSeller = vendedores.find((item) => item.produtoId === selectedProductId) ?? null

  async function adicionarCesta() {
    if (!produto || !selectedProductId) return
    setBusyAction('cesta')
    setActionMessage(null)
    setActionError(null)
    try {
      const response = await cestaService.adicionar(selectedProductId)
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
      const response = await favoritoService.favoritar(selectedProductId ?? produto.id)
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
          description={error ?? 'Não encontramos este produto no acervo.'}
          tone="error"
          action={<Link to="/busca">Voltar para busca</Link>}
        />
      </StorePage>
    )
  }

  const publicationDate = formatDateBR(produto.dataPublicacao ?? produto.createdAt)

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
          {publicationDate ? <p className="product-description">Publicado em: {publicationDate}</p> : null}
          {produto.precoPromocional != null && Number(produto.precoPromocional) < Number(produto.preco) ? (
            <p className="product-price">
              <s style={{ opacity: 0.6, marginRight: 8, fontWeight: 400 }}>
                R$ {Number(produto.preco).toFixed(2)}
              </s>
              R$ {Number(produto.precoPromocional).toFixed(2)}
            </p>
          ) : (
            <p className="product-price">R$ {Number(produto.preco).toFixed(2)}</p>
          )}
          <p className="product-description">
            {produto.descricao || 'Consulte o vendedor para combinar pagamento, entrega ou retirada.'}
          </p>

          <dl className="product-metadata">
            <div><dt>Estado</dt><dd>{produto.condicao}</dd></div>
            <div><dt>Categoria</dt><dd>{produto.categoriaNome ?? 'Nao informada'}</dd></div>
            {produto.bookGenre ? <div><dt>Gênero</dt><dd>{bookGenreLabel(produto.bookGenre) ?? produto.bookGenre}</dd></div> : null}
            {produto.classico ? <div><dt>Curadoria</dt><dd>Clássico</dd></div> : null}
            <div><dt>Autor</dt><dd>{produto.autor ?? 'Nao informado'}</dd></div>
            <div><dt>Estoque</dt><dd>{produto.estoque ?? 0}</dd></div>
            <div><dt>Disponibilidade</dt><dd>{produto.ativo && Number(produto.estoque ?? 0) > 0 ? 'Disponivel' : 'Indisponivel'}</dd></div>
          </dl>

          <section className="product-sellers" aria-labelledby="product-sellers-title">
            <h3 id="product-sellers-title">Escolha o vendedor</h3>
            {loadingVendedores ? (
              <p className="product-sellers-state">Carregando vendedores verificados...</p>
            ) : vendedoresError ? (
              <div className="flash error" role="alert">{vendedoresError}</div>
            ) : vendedores.length === 0 ? (
              <p className="product-sellers-state">Nenhum vendedor verificado disponível para este produto.</p>
            ) : (
              <div className="product-seller-options">
                {vendedores.map((vendedor, index) => (
                  <label className={`product-seller-option${selectedProductId === vendedor.produtoId ? ' selected' : ''}`} key={vendedor.produtoId}>
                    <input
                      type="radio"
                      name="vendedor"
                      value={vendedor.produtoId}
                      checked={selectedProductId === vendedor.produtoId}
                      onChange={() => setSelectedProductId(vendedor.produtoId)}
                    />
                    <span className="product-seller-option-copy">
                      <strong>{vendedor.seboNome} <small>✓ Sebo verificado</small></strong>
                      <span>{vendedor.condicao} · {vendedor.estoque} em estoque</span>
                    </span>
                    <span className="product-seller-option-price">
                      {vendedor.precoPromocional != null && Number(vendedor.precoPromocional) < Number(vendedor.preco) ? <s>{formatBRL.format(vendedor.preco)}</s> : null}
                      <strong>{formatBRL.format(vendedor.precoEfetivo)}</strong>
                      {index === 0 ? <em>Menor preço</em> : null}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <div className="product-actions">
            {isAuthenticated && isUsuario ? (
              <>
                <button
                  className="product-reserve"
                  type="button"
                  disabled={!selectedSeller || selectedSeller.estoque <= 0 || Boolean(busyAction)}
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
          {!loadingVendedores && (!selectedSeller || selectedSeller.estoque <= 0) ? (
            <p className="product-action-note">Este produto está indisponível no acervo.</p>
          ) : (
            <p className="product-action-note">
              Adicione o item à cesta e confirme o pedido para enviá-lo ao sebo.
            </p>
          )}

          <Link className="product-seller" to={`/vendedor/${selectedSeller?.seboId ?? produto.seboId}`}>
            <span>Vendido por</span>
            <strong>{selectedSeller?.seboNome ?? sebo?.nome ?? `Sebo #${produto.seboId}`}</strong>
            <small>Ver perfil do vendedor →</small>
          </Link>
        </article>
      </section>
    </StorePage>
  )
}
