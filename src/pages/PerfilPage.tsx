import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ImageUploadField } from '../components/ui/ImageUploadField'
import { Input } from '../components/ui/Input'
import { usuarioService } from '../services/usuarioService'
import { extractErrorMessage } from '../services/api'
import { useAuthStore } from '../store/authStore'
import type { Account, UpdateProfileRequest } from '../types/account'
import { formatCep, formatCpf, isValidCpf, onlyDigits } from '../utils/personalData'
import './FormPage.css'

type ProfileForm = Omit<UpdateProfileRequest, 'cpf' | 'cep'> & { cpf: string; cep: string }

const EMPTY: ProfileForm = { name: '', fotoUrl: '', cpf: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }

function accountToForm(account: Account): ProfileForm {
  return {
    name: account.name ?? '', fotoUrl: account.fotoUrl ?? '', cpf: formatCpf(account.cpf ?? ''),
    cep: formatCep(account.cep ?? ''), logradouro: account.logradouro ?? '', numero: account.numero ?? '',
    complemento: account.complemento ?? '', bairro: account.bairro ?? '', cidade: account.cidade ?? '', estado: account.estado ?? '',
  }
}

export function PerfilPage() {
  const account = useAuthStore((s) => s.account)
  const setAccount = useAuthStore((s) => s.setAccount)
  const [form, setForm] = useState<ProfileForm>(() => account ? accountToForm(account) : EMPTY)
  const [loading, setLoading] = useState(!account)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    usuarioService.buscarPerfil().then((current) => {
      if (!active) return
      setAccount(current)
      setForm(accountToForm(current))
      setErro(null)
    }).catch((err) => {
      if (active) setErro(extractErrorMessage(err, 'Falha ao carregar o perfil'))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [setAccount])

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)
    if (!isValidCpf(form.cpf)) {
      setErro('Informe um CPF válido.')
      return
    }
    if (onlyDigits(form.cep).length !== 8) {
      setErro('Informe um CEP válido com 8 dígitos.')
      return
    }
    setBusy(true)
    try {
      const updated = await usuarioService.atualizarPerfil({
        ...form, cpf: onlyDigits(form.cpf), cep: onlyDigits(form.cep),
        estado: form.estado.trim().toUpperCase(), complemento: form.complemento?.trim() || undefined,
        fotoUrl: form.fotoUrl?.trim() || undefined,
      })
      setAccount(updated)
      setForm(accountToForm(updated))
      setSucesso('Perfil atualizado com sucesso.')
    } catch (err) {
      setErro(extractErrorMessage(err, 'Falha ao atualizar perfil'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="page"><main className="container form-page" aria-busy="true"><h1 className="form-page-title">Meu Perfil</h1><p>Carregando seus dados...</p></main></div>

  return (
    <div className="page">
      <main className="container form-page">
        <h1 className="form-page-title">Meu Perfil</h1>
        {erro ? <div className="flash error" role="alert">{erro}</div> : null}
        {sucesso ? <div className="flash success" role="status">{sucesso}</div> : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <h2 className="form-section-title">Dados pessoais</h2>
          <Input id="perfil-name" label="Nome" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          <Input id="perfil-username" label="Username" value={account?.username ?? ''} disabled />
          <Input id="perfil-email" label="E-mail" type="email" value={account?.email ?? ''} disabled />
          <Input id="perfil-tipo" label="Tipo da conta" value={account?.type ?? ''} disabled />
          <Input id="perfil-email-status" label="Situação do e-mail" value={account?.emailVerificado ? 'Verificado' : 'Não verificado'} disabled />
          <Input id="perfil-cpf" label="CPF" inputMode="numeric" value={form.cpf} onChange={(e) => update('cpf', formatCpf(e.target.value))} maxLength={14} required />
          <ImageUploadField id="perfil-foto" label="Foto do perfil" value={form.fotoUrl} onChange={(value) => update('fotoUrl', value)} />

          <h2 className="form-section-title">Endereço</h2>
          <Input id="perfil-cep" label="CEP" inputMode="numeric" value={form.cep} onChange={(e) => update('cep', formatCep(e.target.value))} maxLength={9} required />
          <Input id="perfil-logradouro" label="Logradouro" value={form.logradouro} onChange={(e) => update('logradouro', e.target.value)} required />
          <Input id="perfil-numero" label="Número" value={form.numero} onChange={(e) => update('numero', e.target.value)} required />
          <Input id="perfil-complemento" label="Complemento (opcional)" value={form.complemento ?? ''} onChange={(e) => update('complemento', e.target.value)} />
          <Input id="perfil-bairro" label="Bairro" value={form.bairro} onChange={(e) => update('bairro', e.target.value)} required />
          <Input id="perfil-cidade" label="Cidade" value={form.cidade} onChange={(e) => update('cidade', e.target.value)} required />
          <Input id="perfil-estado" label="Estado (UF)" value={form.estado} onChange={(e) => update('estado', e.target.value.toUpperCase().slice(0, 2))} minLength={2} maxLength={2} required />
          <div className="form-actions">
            <Button type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</Button>
            <Link to="/conta/excluir">Excluir conta</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
