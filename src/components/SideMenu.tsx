import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './SideMenu.css'

type Props = {
  onClose: () => void
}

const MENU_ITEMS = [
  { label: 'Carrinho', to: '/carrinho' },
  { label: 'Favoritos', to: '/favoritos' },
  { label: 'Categorias', to: '/categorias' },
  { label: 'Mensagens', to: '/mensagens' },
  { label: 'Ofertas', to: '/ofertas' },
  { label: 'Lançamentos', to: '/lancamentos' },
  { label: 'Suporte', to: '/suporte' },
]

export function SideMenu({ onClose }: Props) {
  const { isSebo } = useAuth()

  return (
    <>
      <div className="sidemenu-backdrop" onClick={onClose} />
      <aside className="sidemenu">
        <nav>
          <ul>
            {isSebo ? (
              <>
                <li>
                  <Link to="/painel/sebo" onClick={onClose}>Meu Sebo</Link>
                </li>
                <li>
                  <Link to="/painel/produtos" onClick={onClose}>Meus Produtos</Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/painel/perfil" onClick={onClose}>Meu Perfil</Link>
              </li>
            )}
            {MENU_ITEMS.map((item) => (
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
