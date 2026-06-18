import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usuarioService } from '../../services/usuarioService'
import { MinusCircleIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './DeleteAccountPage.css'

export function DeleteAccountPage() {
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { logout } = useAuth()
  const canDelete = confirmation.trim().toUpperCase() === 'EXCLUIR'

  async function handleDelete() {
    if (!canDelete) return
    setBusy(true)
    setError('')

    try {
      await usuarioService.excluirConta()
      logout()
      navigate('/', { replace: true })
    } catch {
      setError('Não foi possível excluir a conta. Tente novamente.')
      setBusy(false)
    }
  }

  return (
    <StorePage title="Excluir conta" subtitle="Revise as consequências antes de continuar.">
      <section className="delete-account">
        <div className="delete-warning">
          <MinusCircleIcon size={52} />
          <h2>Esta ação é permanente.</h2>
          <p>Ao excluir sua conta, você perderá acesso aos dados associados ao Vitral.</p>
          <ul>
            <li>Favoritos e informações pessoais serão removidos.</li>
            <li>Pedidos ativos precisam ser resolvidos antes da exclusão definitiva.</li>
            <li>O histórico poderá ser mantido apenas quando necessário para integridade dos pedidos.</li>
          </ul>
        </div>

        <div className="delete-confirmation">
          <h2>Confirmar exclusão</h2>
          <p>Digite <strong>EXCLUIR</strong> para confirmar que deseja apagar sua conta.</p>
          <label>
            Confirmação
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Digite EXCLUIR" />
          </label>
          {error && <p>{error}</p>}
          <button type="button" disabled={!canDelete || busy} onClick={handleDelete}>
            {busy ? 'Excluindo...' : 'Excluir minha conta'}
          </button>
          <Link to="/painel/perfil">Cancelar e voltar</Link>
        </div>
      </section>
    </StorePage>
  )
}
