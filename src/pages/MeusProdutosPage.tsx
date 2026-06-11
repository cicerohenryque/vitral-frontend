import { useCallback, useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { produtoService } from '../services/produtoService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { CondicaoProduto } from '../types/produto'
import type { Produto, ProdutoRequest } from '../types/produto'
import './FormPage.css'
import './MeusProdutosPage.css'

const EMPTY: ProdutoRequest = {
  titulo: '',
  autor: '',
  descricao: '',
  preco: 0,
  condicao: CondicaoProduto.USADO,
  fotoUrl: '',
}

export function MeusProdutosPage() {
  const { seboId } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProdutoRequest>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!seboId) {
      setLoading(false)
      return
    }
    setLoading(true)
    produtoService
      .listarPorSebo(seboId, 0, 50)
      .then((page) => setProdutos(page.content))
      .catch((err) => setError(extractErrorMessage(err, 'Erro ao listar produtos')))
      .finally(() => setLoading(false))
  }, [seboId])

  useEffect(() => {
    // Reload the catalog when the authenticated sebo changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  function update<K extends keyof ProdutoRequest>(key: K, value: ProdutoRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit(p: Produto) {
    setEditingId(p.id)
    setForm({
      titulo: p.titulo,
      autor: p.autor ?? '',
      descricao: p.descricao ?? '',
      preco: p.preco,
      condicao: p.condicao,
      fotoUrl: p.fotoUrl ?? '',
    })
    setError(null)
    setSuccess(null)
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const payload: ProdutoRequest = {
        ...form,
        preco: Number(form.preco),
      }
      if (editingId) {
        await produtoService.atualizar(editingId, payload)
        setSuccess('Produto atualizado!')
      } else {
        await produtoService.criar(payload)
        setSuccess('Produto cadastrado!')
      }
      resetForm()
      load()
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar produto'))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(p: Produto) {
    if (!confirm(`Remover "${p.titulo}"?`)) return
    try {
      await produtoService.remover(p.id)
      load()
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao remover produto'))
    }
  }

  if (!seboId) {
    return (
      <div className="page">
        <TopBar />
        <Header />
        <main className="container form-page">
          <h1 className="form-page-title">Cadastre seu sebo primeiro</h1>
          <p>Você precisa criar o perfil do seu sebo antes de adicionar produtos.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar />
      <Header />
      <main className="container form-page">
        <h1 className="form-page-title">Meus produtos</h1>
        {error ? <div className="flash error">{error}</div> : null}
        {success ? <div className="flash success">{success}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <Input id="titulo" label="Título" required
            value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
          <Input id="autor" label="Autor"
            value={form.autor ?? ''} onChange={(e) => update('autor', e.target.value)} />
          <Input id="preco" label="Preço (R$)" type="number" step="0.01" min="0" required
            value={form.preco} onChange={(e) => update('preco', Number(e.target.value))} />
          <label className="vit-input-wrapper">
            <span className="vit-input-label">Condição</span>
            <select
              className="vit-input"
              value={form.condicao}
              onChange={(e) => update('condicao', e.target.value as CondicaoProduto)}
            >
              <option value={CondicaoProduto.NOVO}>Novo</option>
              <option value={CondicaoProduto.SEMINOVO}>Seminovo</option>
              <option value={CondicaoProduto.USADO}>Usado</option>
            </select>
          </label>
          <Input id="fotoUrl" label="URL da foto"
            value={form.fotoUrl ?? ''} onChange={(e) => update('fotoUrl', e.target.value)} />
          <Input id="descricao" label="Descrição"
            value={form.descricao ?? ''} onChange={(e) => update('descricao', e.target.value)} />
          <div className="form-actions">
            {editingId ? (
              <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
            ) : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Salvando...' : editingId ? 'Atualizar produto' : 'Adicionar produto'}
            </Button>
          </div>
        </form>

        <h2 className="section-title">Catálogo ({produtos.length})</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : produtos.length === 0 ? (
          <p>Nenhum produto cadastrado ainda.</p>
        ) : (
          <table className="produto-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Preço</th>
                <th>Condição</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.titulo}</td>
                  <td>{p.autor ?? '-'}</td>
                  <td>R$ {Number(p.preco).toFixed(2)}</td>
                  <td>{p.condicao}</td>
                  <td className="produto-table-actions">
                    <Button type="button" variant="ghost" onClick={() => startEdit(p)}>Editar</Button>
                    <Button type="button" variant="danger" onClick={() => handleRemove(p)}>Remover</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
