import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/vitral-sebo-icon.svg'
import { useAuth } from '../hooks/useAuth'
import { SideMenu } from './SideMenu'
import { TopBar } from './TopBar'
import { SearchIcon, UserIcon } from './Layout/Icons'
import './GlobalNavigation.css'

const SEARCH_ROUTES = new Set([
  '/',
  '/busca',
  '/buscar',
  '/painel/perfil',
  '/conta',
  '/painel/sebo',
  '/sebo/perfil',
  '/painel/produtos',
  '/anuncios',
  '/painel/ofertas',
  '/recomendacoes',
  '/painel/sugestoes-catalogo',
])

export function GlobalNavigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { isAuthenticated, isSebo, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const showSearch = SEARCH_ROUTES.has(location.pathname)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const term = search.trim()
    if (term) navigate(`/busca?tab=produtos&q=${encodeURIComponent(term)}`)
  }

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen, closeMenu])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <TopBar />
      <header className="global-navigation">
      {menuOpen ? <SideMenu onClose={closeMenu} /> : null}
      <div className="global-navigation-inner container">
        <div className="global-navigation-start">
          <button
            ref={menuButtonRef}
            type="button"
            className="global-menu-button"
            aria-label="Abrir menu"
            aria-controls="main-side-menu"
            aria-expanded={menuOpen}
            onClick={() => {
              if (menuOpen) closeMenu()
              else setMenuOpen(true)
            }}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <Link to="/" className="global-logo" aria-label="Ir para a página inicial">
            <img src={logo} alt="Vitral" />
          </Link>
        </div>

        {showSearch ? (
          <form className="global-search" role="search" onSubmit={handleSearch}>
            <input
              type="search"
              aria-label="Pesquisar produtos"
              placeholder="O que você está procurando?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <SearchIcon size={20} />
            </button>
          </form>
        ) : null}

        <div className="global-navigation-actions">
          {isAuthenticated ? (
            <>
              <Link className="global-action" to={isAdmin ? '/admin' : isSebo ? '/painel/sebo' : '/painel/perfil'}>
                <UserIcon size={22} />
                <span>{isAdmin ? 'Administração' : isSebo ? 'Meu Sebo' : 'Meu Perfil'}</span>
              </Link>
              <button type="button" className="global-action" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link className="global-action" to="/entrar">
              <UserIcon size={22} />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
      </header>
    </>
  )
}
