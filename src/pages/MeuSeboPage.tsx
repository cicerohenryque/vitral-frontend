import { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { ImageUploadField } from '../components/ui/ImageUploadField'
import { Input } from '../components/ui/Input'
import { seboService } from '../services/seboService'
import { pedidoService } from '../services/pedidoService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Sebo, SeboRequest } from '../types/sebo'
import type { FaturamentoMensal } from '../types/pedido'
import './FormPage.css'

const EMPTY: SeboRequest = {
  descricao: '',
  telefone: '',
  fotoUrl: '',
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const formatBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function MeuSeboPage() {
  const { account, seboId, setSeboId } = useAuth()
  const [form, setForm] = useState<SeboRequest>(EMPTY)
  const [existing, setExisting] = useState<Sebo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [faturamento, setFaturamento] = useState<FaturamentoMensal[]>([])
  const [loadingFaturamento, setLoadingFaturamento] = useState(true)
  const [faturamentoError, setFaturamentoError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const request = seboId
      ? seboService.buscarPorId(seboId)
      : account
        ? seboService.buscarPorConta(account.id, account.name, account.email)
        : Promise.resolve(null)

    request
      .then((sebo) => {
        if (!active) return
        if (!sebo) {
          setExisting(null)
          return
        }
        setExisting(sebo)
        setSeboId(sebo.id)
        setForm({
          descricao: sebo.descricao ?? '',
          telefone: sebo.telefone ?? '',
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
  }, [account, seboId, setSeboId])

  useEffect(() => {
    let active = true
    // Reset the visible request state whenever the selected year changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFaturamento(true)
    setFaturamentoError(null)
    pedidoService.buscarFaturamentoMensal(ano)
      .then((data) => {
        if (active) setFaturamento(data)
      })
      .catch((err) => {
        if (!active) return
        setFaturamento([])
        setFaturamentoError(extractErrorMessage(err, 'Não foi possível carregar o faturamento.'))
      })
      .finally(() => {
        if (active) setLoadingFaturamento(false)
      })
    return () => { active = false }
  }, [ano])

  function update<K extends keyof SeboRequest>(key: K, value: SeboRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const payload: SeboRequest = { ...form }
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
        <main className="container form-page">
          <StoreStatus
            title="Carregando perfil do sebo"
            description="Buscando os dados do sebo vinculados à sua conta."
            busy
          />
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar />
      <Header />
      <main className="container form-page">
        <h1 className="form-page-title">{existing ? 'Editar perfil do sebo' : 'Cadastrar perfil do sebo'}</h1>
        {error ? <div className="flash error" role="alert">{error}</div> : null}
        {success ? <div className="flash success" role="status">{success}</div> : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input id="descricao" label="Descrição"
            value={form.descricao ?? ''} onChange={(e) => update('descricao', e.target.value)} />
          <Input id="telefone" label="Telefone"
            value={form.telefone ?? ''} onChange={(e) => update('telefone', e.target.value)} />
          <ImageUploadField
            id="fotoUrl"
            label="Foto do sebo"
            value={form.fotoUrl}
            onChange={(url) => update('fotoUrl', url)}
          />
          <div className="form-actions">
            <Button type="submit" disabled={busy}>
              {busy ? 'Salvando...' : existing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>

        <section className="billing-section" aria-labelledby="billing-title">
          <div className="billing-heading">
            <div>
              <h2 id="billing-title">Faturamento mensal</h2>
              <p>Acompanhe as vendas confirmadas do seu sebo.</p>
            </div>
            <label>
              Ano
              <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          {loadingFaturamento ? (
            <StoreStatus title="Carregando faturamento" description="Consultando os valores mensais." busy />
          ) : faturamentoError ? (
            <div className="flash error" role="alert">{faturamentoError}</div>
          ) : (() => {
            const valores = MESES.map((_, index) => faturamento.find((item) => item.mes === index + 1)?.total ?? 0)
            const total = valores.reduce((sum, value) => sum + Number(value), 0)
            const max = Math.max(...valores, 1)
            return (
              <>
                <p className="billing-total">Total em {ano}: <strong>{formatBRL.format(total)}</strong></p>
                {faturamento.length === 0 ? <p className="billing-empty">Nenhum faturamento registrado neste ano.</p> : null}
                <div className="billing-chart" aria-label={`Faturamento mensal de ${ano}`}>
                  {valores.map((value, index) => (
                    <div className="billing-bar-column" key={MESES[index]}>
                      <span className="billing-value">{formatBRL.format(value)}</span>
                      <span className="billing-bar" style={{ height: `${Math.max((value / max) * 140, value ? 4 : 0)}px` }} />
                      <span>{MESES[index]}</span>
                    </div>
                  ))}
                </div>
                <div className="billing-table-scroll">
                  <table className="billing-table">
                    <thead><tr><th>Mês</th><th>Valor</th></tr></thead>
                    <tbody>{valores.map((value, index) => <tr key={MESES[index]}><td>{MESES[index]}</td><td>{formatBRL.format(value)}</td></tr>)}</tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </section>
      </main>
    </div>
  )
}
