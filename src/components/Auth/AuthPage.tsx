import { BrandMark } from './BrandMark'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import './AuthPage.css'

export function AuthPage() {
  return (
    <main className="auth-page">
      <a href="/" className="back-link" aria-label="Voltar para a página anterior">
        <span aria-hidden="true">←</span>
        Voltar
      </a>

      <BrandMark />

      <section className="auth-layout" aria-label="Acesso e cadastro">
        <LoginForm />
        <SignupForm />
      </section>
    </main>
  )
}
