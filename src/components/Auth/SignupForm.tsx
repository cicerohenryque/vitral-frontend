import { useState } from 'react'
import type { FormEvent } from 'react'
import { getAuthError, register } from '../../api'
import './AuthForms.css'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')

    if (password !== passwordConfirm) {
      setStatus('As senhas precisam ser iguais.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await register({
        name,
        email,
        password,
        type: 'USUARIO',
      })

      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      setStatus('Cadastro realizado com sucesso.')
    } catch (error) {
      setStatus(getAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-panel signup-panel" aria-label="Cadastrar" onSubmit={handleSubmit}>
      <p>Ainda não possui conta?</p>
      <h1>Cadastra-se:</h1>

      <label htmlFor="signup-name">Usuário:</label>
      <input
        id="signup-name"
        name="name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <label htmlFor="signup-email">Email:</label>
      <input
        id="signup-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label htmlFor="signup-password">Senha:</label>
      <input
        id="signup-password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo oito letras maiúsculas, números e caracteres especial"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <label htmlFor="signup-password-confirm">Confirme sua senha:</label>
      <input
        id="signup-password-confirm"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo oito letras maiúsculas, números e caracteres especial"
        value={passwordConfirm}
        onChange={(event) => setPasswordConfirm(event.target.value)}
        required
      />

      {status && <p className="form-status">{status}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
