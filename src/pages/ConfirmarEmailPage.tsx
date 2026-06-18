import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { extractErrorMessage } from '../services/api'
import './ConfirmarEmailPage.css'

type Estado = 'carregando' | 'sucesso' | 'erro'

export function ConfirmarEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [estado, setEstado] = useState<Estado>(token ? 'carregando' : 'erro')
  const [mensagem, setMensagem] = useState(token ? '' : 'Link de confirmação inválido.')

  useEffect(() => {
    if (!token) return

    authService
      .confirmarEmail(token)
      .then((res) => {
        setMensagem(res.mensagem)
        setEstado('sucesso')
      })
      .catch((err) => {
        setMensagem(extractErrorMessage(err, 'Não foi possível confirmar o e-mail.'))
        setEstado('erro')
      })
  }, [token])

  return (
    <div className="confirmar-email-page">
      <div className="confirmar-email-card">
        {estado === 'carregando' ? (
          <div role="status">
            <div className="confirmar-email-icon">⏳</div>
            <h2>Confirmando seu e-mail...</h2>
          </div>
        ) : estado === 'sucesso' ? (
          <>
            <div className="confirmar-email-icon">✓</div>
            <h2>E-mail confirmado!</h2>
            <div className="flash success" role="status">{mensagem}</div>
            <Link to="/auth" className="confirmar-email-btn">Ir para o login</Link>
          </>
        ) : (
          <>
            <div className="confirmar-email-icon">!</div>
            <h2>Confirmação falhou</h2>
            <div className="flash error" role="alert">{mensagem}</div>
            <p className="confirmar-email-hint">
              O link pode ter expirado ou já ter sido utilizado.
            </p>
            <Link to="/auth" className="confirmar-email-btn">Voltar para o login</Link>
          </>
        )}
      </div>
    </div>
  )
}
