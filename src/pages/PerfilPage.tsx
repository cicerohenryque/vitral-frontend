import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { usuarioService } from '../services/usuarioService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import './FormPage.css'

export function PerfilPage() {
  const { account } = useAuth()
  const setAccount = useAuthStore((s) => s.setAccount)

  const [name, setName] = useState(account?.name ?? '')
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)
    setBusy(true)
    try {
      const updated = await usuarioService.atualizarPerfil({ name })
      setAccount(updated)
      setSucesso('Perfil atualizado com sucesso.')
    } catch (err) {
      setErro(extractErrorMessage(err, 'Falha ao atualizar perfil'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <TopBar />
        <Header />
      <main className="container form-page">
        <h1 className="form-page-title">Meu Perfil</h1>
        {erro ? <div className="flash error" role="alert">{erro}</div> : null}
        {sucesso ? <div className="flash success" role="status">{sucesso}</div> : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input
            id="perfil-name"
            label="Nome de exibição"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="perfil-email">
            <strong>E-mail:</strong> {account?.email}
          </p>
          <div className="form-actions">
            <Button type="submit" disabled={busy}>
              {busy ? 'Salvando...' : 'Salvar'}
            </Button>
            <Link to="/conta/excluir">Excluir conta</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
