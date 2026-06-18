import { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { seboService } from '../services/seboService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Sebo, SeboRequest } from '../types/sebo'
import './FormPage.css'

const EMPTY: SeboRequest = {
  descricao: '',
  telefone: '',
  cep: '',
  logradouro: '',
  cidade: '',
  uf: '',
  horarioFuncionamento: '',
  fotoUrl: '',
}

export function MeuSeboPage() {
  const { seboId, setSeboId } = useAuth()
  const [form, setForm] = useState<SeboRequest>(EMPTY)
  const [existing, setExisting] = useState<Sebo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const request = seboId ? seboService.buscarPorId(seboId) : seboService.buscarMeu()

    request
      .then((sebo) => {
        if (!active) return
        setExisting(sebo)
        setSeboId(sebo.id)
        setForm({
          descricao: sebo.descricao ?? '',
          telefone: sebo.telefone ?? '',
          cep: sebo.cep ?? '',
          logradouro: sebo.logradouro ?? '',
          cidade: sebo.cidade ?? '',
          uf: sebo.uf ?? '',
          horarioFuncionamento: sebo.horarioFuncionamento ?? '',
          fotoUrl: sebo.fotoUrl ?? '',
        })
      })
      .catch(() => {
        if (active) setExisting(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [seboId, setSeboId])

  function update<K extends keyof SeboRequest>(key: K, value: SeboRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const payload: SeboRequest = {
        ...form,
        uf: form.uf ? form.uf.toUpperCase() : undefined,
      }
      const saved = existing
        ? await seboService.atualizarMeu(payload)
        : await seboService.criar(payload)
      setExisting(saved)
      setSeboId(saved.id)
      setSuccess(existing ? 'Sebo atualizado com sucesso!' : 'Sebo cadastrado com sucesso!')
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar o sebo'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <TopBar />
        <Header />
        <main className="container"><p>Carregando...</p></main>
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar />
      <Header />
      <main className="container form-page">
        <h1 className="form-page-title">{existing ? 'Editar perfil do sebo' : 'Cadastrar perfil do sebo'}</h1>
        {error ? <div className="flash error">{error}</div> : null}
        {success ? <div className="flash success">{success}</div> : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input id="descricao" label="Descrição"
            value={form.descricao ?? ''} onChange={(e) => update('descricao', e.target.value)} />
          <Input id="telefone" label="Telefone"
            value={form.telefone ?? ''} onChange={(e) => update('telefone', e.target.value)} />
          <Input id="cep" label="CEP"
            value={form.cep ?? ''} onChange={(e) => update('cep', e.target.value)} />
          <Input id="logradouro" label="Endereço"
            value={form.logradouro ?? ''} onChange={(e) => update('logradouro', e.target.value)} />
          <Input id="cidade" label="Cidade"
            value={form.cidade ?? ''} onChange={(e) => update('cidade', e.target.value)} />
          <Input id="uf" label="UF" maxLength={2}
            value={form.uf ?? ''} onChange={(e) => update('uf', e.target.value.toUpperCase())} />
          <Input id="horario" label="Horário de funcionamento"
            value={form.horarioFuncionamento ?? ''}
            onChange={(e) => update('horarioFuncionamento', e.target.value)} />
          <Input id="fotoUrl" label="URL da foto"
            value={form.fotoUrl ?? ''} onChange={(e) => update('fotoUrl', e.target.value)} />
          <div className="form-actions">
            <Button type="submit" disabled={busy}>
              {busy ? 'Salvando...' : existing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
