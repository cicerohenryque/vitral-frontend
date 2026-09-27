import { Link } from 'react-router-dom'
import type { Produto } from '../types/produto'
import './ProductCard.css'
import { bookGenreLabel } from '../constants/productCatalog'

type Props = {
  produto?: Produto
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function ProductCard({ produto }: Props) {
  if (!produto) {
    return <div className="product-card skeleton-card" aria-hidden="true" />
  }

  const unavailable = produto.disponivel !== undefined
    ? !produto.disponivel
    : !produto.ativo || Number(produto.estoque ?? 0) <= 0
  const hasPromotion = produto.precoPromocional != null && Number(produto.precoPromocional) < Number(produto.preco)

  return (
    <Link
      to={`/produto/${produto.id}`}
      className={`product-card product-card-real${unavailable ? ' product-card-unavailable' : ''}`}
      aria-label={`${produto.titulo}, ${formatBRL(Number(hasPromotion ? produto.precoPromocional : produto.preco))}${unavailable ? ', indisponivel' : ''}`}
    >
      <div className="product-card-media">
        {unavailable ? <span className="product-card-badge product-card-badge-danger">Indisponível</span> : null}
        {hasPromotion ? <span className="product-card-badge product-card-badge-promo">Oferta</span> : null}
        {produto.fotoUrl ? (
          <img src={produto.fotoUrl} alt={produto.titulo} />
        ) : (
          <div className="product-card-placeholder">Sem imagem</div>
        )}
      </div>

      <div className="product-card-info">
        <div className="product-card-heading">
          <strong title={produto.titulo}>{produto.titulo}</strong>
          {produto.seboVerificado ? <span className="product-card-verified">✓ Verificado</span> : null}
        </div>

        {produto.autor ? <small className="product-card-author">{produto.autor}</small> : null}

        <div className="product-card-tags">
          {produto.condicao ? <span>{produto.condicao}</span> : null}
          {produto.categoriaNome ? <span>{produto.categoriaNome}</span> : null}
          {produto.bookGenre ? <span>{bookGenreLabel(produto.bookGenre) ?? produto.bookGenre}</span> : null}
        </div>

        {produto.seboNome ? <small className="product-card-seller">{produto.seboNome}</small> : null}

        <div className="product-card-footer">
          <span className="product-card-price">
            {hasPromotion ? <s>{formatBRL(Number(produto.preco))}</s> : null}
            <strong>{formatBRL(Number(hasPromotion ? produto.precoPromocional : produto.preco))}</strong>
          </span>
          {!unavailable && produto.estoque != null ? (
            <small>{produto.estoque} {produto.estoque === 1 ? 'unidade' : 'unidades'}</small>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
