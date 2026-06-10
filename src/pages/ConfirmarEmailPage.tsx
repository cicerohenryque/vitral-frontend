import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { extractErrorMessage } from '../services/api'
import './ConfirmarEmailPage.css'

type Estado = 'carregando' | 'sucesso' | 'erro'

export function ConfirmarEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [estado, setEstado] = useState<Estado>('carregando')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!token) {
      setMensagem('Link de confirmação inválido.')
      setEstado('erro')
      return
    }

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
          <>
            <div className="confirmar-email-icon">⏳</div>
            <h2>Confirmando seu e-mail...</h2>
          </>
        ) : estado === 'sucesso' ? (
          <>
            <div className="confirmar-email-icon">✅</div>
            <h2>E-mail confirmado!</h2>
            <div className="flash success">{mensagem}</div>
            <Link to="/auth" className="confirmar-email-btn">Ir para o login</Link>
          </>
        ) : (
          <>
            <div className="confirmar-email-icon">❌</div>
            <h2>Confirmação falhou</h2>
            <div className="flash error">{mensagem}</div>
            <p className="confirmar-email-hint">
              O link pode ter expirado (válido por 24h) ou já foi utilizado.
            </p>
            <Link to="/auth" className="confirmar-email-btn">Voltar para o login</Link>
          </>
        )}
      </div>
    </div>
  )
}
