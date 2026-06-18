import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { BackIcon, SearchIcon, UserIcon } from './Icons'
import './StorePage.css'

type StorePageProps = {
  title: string
  subtitle?: string
  children: ReactNode
  searchPlaceholder?: string
}

export function StorePage({
  title,
  subtitle,
  children,
  searchPlaceholder = 'O que você está procurando?',
}: StorePageProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const term = search.trim()
    if (term) navigate(`/busca?tab=produtos&q=${encodeURIComponent(term)}`)
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <Link className="store-back" to="/">
          <BackIcon size={33} />
          Voltar
        </Link>

        <Link className="store-logo-link" to="/" aria-label="Ir para a página inicial">
          <BrandLogo size={145} />
        </Link>

        <Link className="store-login" to="/entrar">
          <UserIcon size={27} />
          Entrar
        </Link>
      </header>

      <section className="store-intro">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <form className="store-search" role="search" onSubmit={handleSearch}>
          <input
            aria-label="Pesquisar"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" aria-label="Pesquisar">
            <SearchIcon size={20} />
          </button>
        </form>
      </section>

      <div className="store-content">{children}</div>
    </main>
  )
}

export function ProductPlaceholder({
  label,
  badge,
}: {
  label: string
  badge?: string
}) {
  return (
    <article className="store-product">
      <div className="store-product-image">
        {badge && <span className="store-product-badge">{badge}</span>}
      </div>
      <h2>{label}</h2>
      <span className="store-product-line" />
    </article>
  )
}
