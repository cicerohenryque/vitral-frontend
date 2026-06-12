import { Link } from 'react-router-dom'
import { BrandLogo } from '../Layout/BrandLogo'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <Link to="/" aria-label="Ir para a página inicial">
        <BrandLogo size={170} />
      </Link>
      <span>Erro 404</span>
      <h1>Esta página não está no acervo.</h1>
      <p>
        O endereço pode ter mudado ou a página não existe. Volte para a página inicial e continue
        explorando o Vitral.
      </p>
      <div>
        <Link className="not-found-primary" to="/">Voltar para o início</Link>
        <Link className="not-found-secondary" to="/suporte">Ir para o suporte</Link>
      </div>
    </main>
  )
}
