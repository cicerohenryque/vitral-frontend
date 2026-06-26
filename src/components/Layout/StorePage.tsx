import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BrandLogo } from './BrandLogo'
import { BackIcon, SearchIcon, UserIcon } from './Icons'
import './StorePage.css'

type StorePageProps = {
  title: string
  subtitle?: string
  children: ReactNode
  searchPlaceholder?: string
}

type StoreStatusProps = {
  title: string
  description: string
  action?: ReactNode
  tone?: 'neutral' | 'success' | 'error'
  busy?: boolean
}

export function StorePage({
  title,
  subtitle,
  children,
  searchPlaceholder = 'O que você está procurando?',
}: StorePageProps) {
  const navigate = useNavigate()
  const { isAuthenticated, isSebo, logout } = useAuth()
  const [search, setSearch] = useState('')

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const term = search.trim()
    if (term) navigate(`/busca?tab=produtos&q=${encodeURIComponent(term)}`)
  }

  function handleLogout() {
    logout()
    navigate('/')
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

        {isAuthenticated ? (
          <div className="store-login-actions">
            <Link className="store-login" to={isSebo ? '/painel/sebo' : '/painel/perfil'}>
              <UserIcon size={27} />
              {isSebo ? 'Meu Sebo' : 'Meu Perfil'}
            </Link>
            <button type="button" className="store-logout" onClick={handleLogout}>
              Sair
            </button>
          </div>
        ) : (
          <Link className="store-login" to="/entrar">
            <UserIcon size={27} />
            Entrar
          </Link>
        )}
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

export function StoreStatus({
  title,
  description,
  action,
  tone = 'neutral',
  busy = false,
}: StoreStatusProps) {
  return (
    <section
      className={`store-status store-status-${tone}`}
      aria-busy={busy}
      aria-live={busy ? 'polite' : undefined}
    >
      {busy ? <span className="store-status-spinner" aria-hidden="true" /> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="store-status-action">{action}</div> : null}
    </section>
  )
}
