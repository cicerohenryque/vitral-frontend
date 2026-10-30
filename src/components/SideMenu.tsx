import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './SideMenu.css'

type Props = {
  onClose: () => void
}

const publicItems = [
  { label: 'Categorias', to: '/categorias' },
  { label: 'Ofertas', to: '/ofertas' },
  { label: 'Lançamentos', to: '/lancamentos' },
  { label: 'Suporte', to: '/suporte' },
]

const userItems = [
  { label: 'Informar produto de um sebo', to: '/painel/sugestoes-catalogo' },
  { label: 'Recomendados para você', to: '/recomendacoes' },
  { label: 'Carrinho', to: '/carrinho' },
  { label: 'Favoritos', to: '/favoritos' },
  { label: 'Reservas', to: '/reservas' },
  { label: 'Histórico', to: '/historico' },
  { label: 'Mensagens', to: '/mensagens' },
]

const seboItems = [
  { label: 'Compras recebidas', to: '/vendas' },
  { label: 'Histórico de vendas', to: '/vendas/historico' },
  { label: 'Mensagens', to: '/mensagens' },
]

export function SideMenu({ onClose }: Props) {
  const { isAuthenticated, isSebo, isAdmin } = useAuth()
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    const firstFocusable = menu?.querySelector<HTMLElement>('button, a[href]')
    firstFocusable?.focus()
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') return
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('button, a[href]')
    if (!focusable?.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <div className="sidemenu-backdrop" aria-hidden="true" onClick={onClose} />
      <aside
        ref={menuRef}
        className="sidemenu"
        id="main-side-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidemenu-title"
        onKeyDown={handleKeyDown}
      >
        <div className="sidemenu-header">
          <strong id="sidemenu-title">Menu</strong>
          <button type="button" className="sidemenu-close" onClick={onClose} aria-label="Fechar menu">
            ×
          </button>
        </div>
        <nav aria-label="Navegação principal">
          <ul>
            {!isAuthenticated ? (
              <li>
                <Link to="/auth" onClick={onClose}>Entrar</Link>
              </li>
            ) : isAdmin ? (
              <li><Link to="/admin/sebos" onClick={onClose}>Verificar Sebos</Link></li>
            ) : isSebo ? (
              <>
                <li>
                  <Link to="/painel/sebo" onClick={onClose}>Meu catálogo</Link>
                </li>
                <li>
                  <Link to="/painel/produtos" onClick={onClose}>Meus Produtos</Link>
                </li>
                <li>
                  <Link to="/painel/ofertas" onClick={onClose}>Minhas Ofertas</Link>
                </li>
                <li><Link to="/painel/sebo/documentos" onClick={onClose}>Documentos de verificação</Link></li>
                <li><Link to="/painel/sugestoes-catalogo" onClick={onClose}>Produtos informados por usuários</Link></li>
              </>
            ) : (
              <li>
                <Link to="/painel/perfil" onClick={onClose}>Meu Perfil</Link>
              </li>
            )}

            {isAuthenticated && !isSebo && !isAdmin
              ? userItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              ))
              : null}

            {isAuthenticated && isSebo
              ? seboItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              ))
              : null}

            {publicItems.map((item) => (
              <li key={item.label}>
                <Link to={item.to} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
