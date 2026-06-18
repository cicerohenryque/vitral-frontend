import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authService } from '../services/authService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { AccountType } from '../types/account'
import logo from '../assets/vitral-sebo-icon.svg'
import './AuthPage.css'

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginBusy, setLoginBusy] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regType, setRegType] = useState<AccountType>(AccountType.USUARIO)
  const [regError, setRegError] = useState<string | null>(null)
  const [regBusy, setRegBusy] = useState(false)
  const [regSuccess, setRegSuccess] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginBusy(true)
    try {
      const res = await authService.login({ email: loginEmail, password: loginPassword })
      login(res.token, res.account)
      navigate('/')
    } catch (err) {
      setLoginError(extractErrorMessage(err, 'Falha ao entrar'))
    } finally {
      setLoginBusy(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError(null)
    if (regPassword !== regConfirm) {
      setRegError('As senhas nao coincidem')
      return
    }
    if (regPassword.length < 8) {
      setRegError('A senha deve ter ao menos 8 caracteres')
      return
    }
    setRegBusy(true)
    try {
      const res = await authService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        type: regType,
      })
      setRegSuccess(res.mensagem)
    } catch (err) {
      setRegError(extractErrorMessage(err, 'Falha ao cadastrar'))
    } finally {
      setRegBusy(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-top">
        <Link to="/" className="auth-back">↶ Voltar</Link>
        <img src={logo} alt="Vitral" className="auth-logo" />
        <div className="auth-spacer" />
      </div>

      <div className="auth-grid">
        <form className="auth-card" onSubmit={handleLogin}>
          {loginError ? <div className="flash error">{loginError}</div> : null}
          <Input
            id="login-email"
            label="Usuário ou E-mail:"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
          <Input
            id="login-password"
            label="Senha:"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loginBusy}>
            {loginBusy ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {regSuccess ? (
          <div className="auth-card auth-success-card">
            <div className="flash success">{regSuccess}</div>
            <p className="auth-card-subtitle">Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.</p>
            <Button type="button" onClick={() => setRegSuccess(null)}>
              Cadastrar outra conta
            </Button>
          </div>
        ) : (
          <form className="auth-card" onSubmit={handleRegister}>
            <p className="auth-card-title">Ainda não possui conta?</p>
            <p className="auth-card-subtitle"><em>Cadastra-se:</em></p>
            {regError ? <div className="flash error">{regError}</div> : null}
            <Input
              id="reg-name"
              label="Usuário:"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <Input
              id="reg-email"
              label="Email:"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <Input
              id="reg-password"
              label="Senha:"
              type="password"
              placeholder="Necessário ao menos 8 caracteres"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <Input
              id="reg-confirm"
              label="Confirme sua senha:"
              type="password"
              placeholder="Repita a senha"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.target.value)}
              required
            />
            <div className="auth-type-toggle">
              <label>
                <input
                  type="radio"
                  name="account-type"
                  value={AccountType.USUARIO}
                  checked={regType === AccountType.USUARIO}
                  onChange={() => setRegType(AccountType.USUARIO)}
                />
                <span>Sou cliente</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="account-type"
                  value={AccountType.SEBO}
                  checked={regType === AccountType.SEBO}
                  onChange={() => setRegType(AccountType.SEBO)}
                />
                <span>Sou um sebo</span>
              </label>
            </div>
            <Button type="submit" disabled={regBusy}>
              {regBusy ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
