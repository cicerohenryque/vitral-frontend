import { BrandMark } from './BrandMark'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { Link } from 'react-router-dom'
import './AuthPage.css'

export function AuthPage() {
  return (
    <main className="auth-page">
      <Link to="/" className="back-link" aria-label="Voltar para a página anterior">
        <span aria-hidden="true">←</span>
        Voltar
      </Link>

      <BrandMark />

      <section className="auth-layout" aria-label="Acesso e cadastro">
        <LoginForm />
        <SignupForm />
      </section>
    </main>
  )
}
