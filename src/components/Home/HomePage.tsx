import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../Layout/BrandLogo'
import { HeartIcon, SearchIcon, UserIcon } from '../Layout/Icons'
import './HomePage.css'

const sections = ['Mais vendidos', 'Clássicos', 'Lançamentos']
const menuItems = [
  { label: 'Favoritos', to: '/favoritos' },
  { label: 'Categorias', to: '#categorias' },
  { label: 'Mensagens', to: '#mensagens' },
  { label: 'Ofertas', to: '#ofertas' },
  { label: 'Lançamentos', to: '#lancamentos' },
  { label: 'Suporte', to: '#suporte' },
]

function ProductSection({ title }: { title: string }) {
  return (
    <section className="product-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="product-carousel">
        <button className="carousel-arrow carousel-arrow-left" aria-label={`Ver ${title} anteriores`}>
          ‹
        </button>
        <div className="product-list">
          {Array.from({ length: 5 }, (_, index) => (
            <article className="product-card" key={index} aria-label={`${title}, item ${index + 1}`} />
          ))}
        </div>
        <button className="carousel-arrow carousel-arrow-right" aria-label={`Ver mais ${title}`}>
          ›
        </button>
      </div>
    </section>
  )
}

export function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <main className={`home-page${isMenuOpen ? ' menu-is-open' : ''}`}>
      <div className="announcement">
        <p>Livros, discos, cds, eletrônicos, colecionáveis e muito mais no Vitral, seu sebo virtual.</p>
        <Link to="/ajuda">Ajuda</Link>
      </div>

      <header className="home-header">
        <button
          className="logo-button"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <BrandLogo />
        </button>

        <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
          <input aria-label="Pesquisar" placeholder="O que você está procurando?" />
          <button type="submit" aria-label="Pesquisar">
            <SearchIcon size={21} />
          </button>
        </form>

        {isMenuOpen ? (
          <button className="favorites-button" type="button" aria-label="Favoritos">
            <HeartIcon size={35} />
          </button>
        ) : (
          <Link className="login-link" to="/entrar">
            <UserIcon size={27} />
            Entrar
          </Link>
        )}
      </header>

      {isMenuOpen && (
        <aside className="side-menu">
          <button
            type="button"
            className="menu-close"
            aria-label="Fechar menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav aria-label="Menu principal">
            {menuItems.map((item) => (
              <Link to={item.to} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}

      <div className="catalog">
        {sections.map((section) => (
          <ProductSection title={section} key={section} />
        ))}
      </div>
    </main>
  )
}
