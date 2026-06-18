import { Link } from 'react-router-dom'
import type { Produto } from '../types/produto'
import './ProductCard.css'

type Props = {
  produto?: Produto
}

export function ProductCard({ produto }: Props) {
  if (!produto) {
    return <div className="product-card skeleton-card" aria-hidden="true" />
  }

  return (
    <Link to={`/produto/${produto.id}`} className="product-card product-card-real">
      {produto.fotoUrl ? (
        <img src={produto.fotoUrl} alt={produto.titulo} />
      ) : (
        <div className="product-card-placeholder" />
      )}
      <div className="product-card-info">
        <strong>{produto.titulo}</strong>
        <span>R$ {Number(produto.preco).toFixed(2)}</span>
      </div>
    </Link>
  )
}
