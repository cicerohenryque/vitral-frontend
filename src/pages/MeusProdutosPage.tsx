import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { ImageUploadField } from '../components/ui/ImageUploadField'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { categoriaService } from '../services/categoriaService'
import { produtoService } from '../services/produtoService'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Categoria } from '../types/categoria'
import { CondicaoProduto } from '../types/produto'
import type { Produto, ProdutoRequest } from '../types/produto'
import './FormPage.css'
import './MeusProdutosPage.css'

const EMPTY: ProdutoRequest = {
  titulo: '',
  autor: '',
  descricao: '',
  preco: 0,
  estoque: 1,
  condicao: CondicaoProduto.USADO,
  fotoUrl: '',
}

export function MeusProdutosPage() {
  const { seboId } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProdutoRequest>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)

  const load = useCallback(() => {
    if (!seboId) {
      setLoading(false)
      return
    }
    setLoading(true)
    produtoService
      .listarPorSebo(seboId, page, 10)
      .then((result) => {
        setProdutos(result.content)
        setTotalPages(result.totalPages)
        setTotalProducts(result.totalElements)
      })
      .catch((err) => {
        setProdutos([])
        setError(extractErrorMessage(err, 'Erro ao listar produtos'))
      })
      .finally(() => setLoading(false))
  }, [page, seboId])

  useEffect(() => {
    // Reload the catalog when the authenticated sebo changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  useEffect(() => {
    let active = true
    categoriaService
      .listar()
      .then((page) => {
        if (active) setCategorias(page.content)
      })
      .catch(() => {
        if (active) setCategorias([])
      })

    return () => {
      active = false
    }
  }, [])

  function update<K extends keyof ProdutoRequest>(key: K, value: ProdutoRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit(p: Produto) {
    setEditingId(p.id)
    setForm({
      titulo: p.titulo,
      categoriaId: p.categoriaId ?? undefined,
      autor: p.autor ?? '',
      descricao: p.descricao ?? '',
      preco: p.preco,
      estoque: p.estoque ?? 1,
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
        estoque: Number(form.estoque ?? 1),
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
          <StoreStatus
            title="Perfil do sebo necessário"
            description="Você precisa criar o perfil do seu sebo antes de adicionar produtos ao catálogo."
            action={<Link to="/painel/sebo">Cadastrar sebo</Link>}
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
        <h1 className="form-page-title">Meus produtos</h1>
        {error ? <div className="flash error" role="alert">{error}</div> : null}
        {success ? <div className="flash success" role="status">{success}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <Input id="titulo" label="Título" required
            value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
          <Input id="autor" label="Autor"
            value={form.autor ?? ''} onChange={(e) => update('autor', e.target.value)} />
          <Input id="preco" label="Preço (R$)" type="number" step="0.01" min="0" required
            value={form.preco} onChange={(e) => update('preco', Number(e.target.value))} />
          <Input id="estoque" label="Estoque" type="number" step="1" min="1"
            value={form.estoque ?? 1} onChange={(e) => update('estoque', Number(e.target.value))} />
          <label className="vit-input-wrapper">
            <span className="vit-input-label">Categoria</span>
            <select
              className="vit-input"
              value={form.categoriaId ?? ''}
              onChange={(e) => update('categoriaId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Sem categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </label>
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
          <ImageUploadField
            id="fotoUrl"
            label="Foto do produto"
            value={form.fotoUrl}
            onChange={(url) => update('fotoUrl', url)}
          />
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

        <h2 className="section-title">Catálogo ({totalProducts})</h2>
        {loading ? (
          <StoreStatus
            title="Carregando catálogo"
            description="Buscando os produtos do seu catálogo."
            busy
          />
        ) : produtos.length === 0 ? (
          <StoreStatus
            title="Nenhum produto cadastrado"
            description="Adicione o primeiro item usando o formulário acima para começar seu catálogo."
          />
        ) : (
          <>
            <div className="produto-table-scroll">
              <table className="produto-table">
              <thead>
                <tr>
                  <th scope="col">Título</th>
                  <th scope="col">Autor</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Preço</th>
                  <th scope="col">Estoque</th>
                  <th scope="col">Condição</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.titulo}</td>
                    <td>{p.autor ?? '-'}</td>
                    <td>{p.categoriaNome ?? '-'}</td>
                    <td>R$ {Number(p.preco).toFixed(2)}</td>
                    <td>{p.estoque ?? 0}</td>
                    <td>{p.condicao}</td>
                    <td className="produto-table-actions">
                      <Button type="button" variant="ghost" onClick={() => startEdit(p)}>Editar</Button>
                      <Button type="button" variant="danger" onClick={() => handleRemove(p)}>Remover</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Páginas do catálogo"
            />
          </>
        )}
      </main>
    </div>
  )
}
