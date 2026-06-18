import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { SideMenu } from './SideMenu'
import logo from '../assets/vitral-sebo-icon.svg'
import './Header.css'

export function Header() {
  const { isAuthenticated, logout, isSebo } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      {isAuthenticated && menuOpen ? <SideMenu onClose={() => setMenuOpen(false)} /> : null}
      <div className="header-inner container">
        {isAuthenticated ? (
          <button
            type="button"
            className="header-menu-button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        ) : (
          <Link to="/" className="header-logo">
            <img src={logo} alt="Vitral" width={120} height={120} />
          </Link>
        )}

        <form
          className="header-search"
          onSubmit={(e) => {
            e.preventDefault()
            const term = search.trim()
            if (term) navigate(`/busca?tab=produtos&q=${encodeURIComponent(term)}`)
          }}
        >
          <input
            type="search"
            placeholder="O que você está procurando?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">🔍</button>
        </form>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              {isSebo ? (
                <Link to="/painel/sebo" className="header-action-link">Meu Sebo</Link>
              ) : (
                <Link to="/painel/perfil" className="header-action-link">Meu Perfil</Link>
              )}
              <button type="button" className="header-action-link" onClick={handleLogout}>
                Sair
              </button>
              <span className="header-fav" aria-label="Favoritos">♥</span>
            </>
          ) : (
            <Link to="/auth" className="header-entrar">
              <span className="header-entrar-icon">👤</span>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
