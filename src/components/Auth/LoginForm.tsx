import { useState } from 'react'
import type { FormEvent } from 'react'
import { getAuthError, login } from '../../api'
import './AuthForms.css'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    try {
      const data = await login({ email, password })

      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      setStatus('Login realizado com sucesso.')
    } catch (error) {
      setStatus(getAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-panel login-panel" aria-label="Entrar" onSubmit={handleSubmit}>
      <label htmlFor="login-email">Usuário ou E-mail:</label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label htmlFor="login-password">Senha:</label>
      <input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {status && <p className="form-status">{status}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
