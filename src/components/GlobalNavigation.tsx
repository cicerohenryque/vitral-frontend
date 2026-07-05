import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/vitral-sebo-icon.svg'
import { useAuth } from '../hooks/useAuth'
import { SideMenu } from './SideMenu'
import { BackIcon, UserIcon } from './Layout/Icons'
import './GlobalNavigation.css'

export function GlobalNavigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, isSebo, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="global-navigation">
      {menuOpen ? <SideMenu onClose={() => setMenuOpen(false)} /> : null}
      <div className="global-navigation-inner container">
        <div className="global-navigation-start">
          <button
            type="button"
            className="global-menu-button"
            aria-label="Abrir menu"
            aria-controls="main-side-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <Link to="/" className="global-logo" aria-label="Ir para a página inicial">
            <img src={logo} alt="Vitral" />
          </Link>

          {location.pathname !== '/' ? (
            <button type="button" className="global-action global-back" onClick={() => navigate(-1)}>
              <BackIcon size={23} />
              <span>Voltar</span>
            </button>
          ) : null}
        </div>

        <div className="global-navigation-actions">
          {isAuthenticated ? (
            <>
              <Link className="global-action" to={isAdmin ? '/admin/sebos' : isSebo ? '/painel/sebo' : '/painel/perfil'}>
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
  )
}
