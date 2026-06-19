import { useRef } from 'react'
import type { Produto } from '../types/produto'
import { ProductCard } from './ProductCard'
import './ProductCarousel.css'

type Props = {
  title: string
  produtos: Produto[]
  loading?: boolean
  placeholderCount?: number
  emptyMessage?: string
}

export function ProductCarousel({ title, produtos, loading, placeholderCount = 5, emptyMessage }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const items = loading
    ? Array.from({ length: placeholderCount }, (_, i) => ({ key: `skel-${i}`, produto: undefined }))
    : produtos.map((p) => ({ key: `p-${p.id}`, produto: p }))

  function scrollBy(direction: -1 | 1) {
    const node = trackRef.current
    if (!node) return
    node.scrollBy({ left: direction * node.clientWidth * 0.6, behavior: 'smooth' })
  }

  return (
    <section className="carousel" aria-busy={loading}>
      <h2 className="section-title">{title}</h2>
      {!loading && produtos.length === 0 ? (
        <p className="carousel-empty">{emptyMessage ?? 'Nenhum produto para exibir.'}</p>
      ) : (
      <div className="carousel-wrapper">
        <button
          type="button"
          aria-label="Anterior"
          className="carousel-arrow left"
          onClick={() => scrollBy(-1)}
        >
          ‹
        </button>
        <div className="carousel-track" ref={trackRef}>
          {items.map((item) => (
            <div className="carousel-item" key={item.key}>
              <ProductCard produto={item.produto} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Próximo"
          className="carousel-arrow right"
          onClick={() => scrollBy(1)}
        >
          ›
        </button>
      </div>
      )}
    </section>
  )
}
