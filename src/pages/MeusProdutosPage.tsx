import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { ImageUploadField } from '../components/ui/ImageUploadField'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { categoriaService } from '../services/categoriaService'
import { produtoService } from '../services/produtoService'
import { extractErrorMessage } from '../services/api'
import { seboService } from '../services/seboService'
import { useAuth } from '../hooks/useAuth'
import type { Categoria } from '../types/categoria'
import { StatusVerificacao, type StatusVerificacao as VerificationStatus } from '../types/sebo'
import { CondicaoProduto } from '../types/produto'
import type { Produto, ProdutoRequest } from '../types/produto'
import './FormPage.css'
import './MeusProdutosPage.css'
import { isValidIsbn, normalizeIsbn } from '../utils/isbn'

const EMPTY: ProdutoRequest = {
  isbn: '',
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
  const [sellingId, setSellingId] = useState<number | null>(null)
  const [verification, setVerification] = useState<VerificationStatus | null>(null)

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

  useEffect(() => {
    if (!seboId) return
    seboService.buscarPorId(seboId).then((item) => setVerification(item.statusVerificacao ?? null)).catch(() => setVerification(null))
  }, [seboId])

  function update<K extends keyof ProdutoRequest>(key: K, value: ProdutoRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit(p: Produto) {
    setEditingId(p.id)
    setForm({
      isbn: p.isbn ?? '',
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
      if (form.isbn && !isValidIsbn(form.isbn)) {
        setError('Informe um ISBN-10 ou ISBN-13 válido.')
        return
      }
      const payload: ProdutoRequest = {
        ...form,
        isbn: form.isbn ? normalizeIsbn(form.isbn) : undefined,
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

  async function handlePhysicalSale(p: Produto) {
    const raw = prompt(`Quantidade vendida de "${p.titulo}":`, '1')
    if (raw === null) return
    const quantidade = Number(raw)
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      setError('Informe uma quantidade inteira maior que zero.')
      return
    }
    if (quantidade > (p.estoque ?? 0)) {
      setError('A quantidade informada é maior que o estoque disponível.')
      return
    }
    setSellingId(p.id)
    setError(null)
    setSuccess(null)
    try {
      const response = await produtoService.registrarVendaFisica(p.id, quantidade)
      setProdutos((current) => current.map((item) => item.id === p.id
        ? { ...item, estoque: response.estoqueAtual ?? Math.max((item.estoque ?? 0) - quantidade, 0) }
        : item))
      setSuccess(response.mensagem || 'Venda física registrada com sucesso.')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível registrar a venda física.'))
    } finally {
      setSellingId(null)
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

  if (verification && verification !== StatusVerificacao.VERIFICADO) {
    return <div className="page"><TopBar /><Header /><main className="container form-page"><StoreStatus title="Sebo ainda não verificado" description="Cadastro de produtos e vendas serão liberados após a aprovação dos documentos." tone={verification === StatusVerificacao.REJEITADO ? 'error' : 'neutral'} action={<Link to="/painel/sebo/documentos">Gerenciar documentos</Link>} /></main></div>
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
          <Input id="isbn" label="ISBN (opcional)" maxLength={20}
            value={form.isbn ?? ''} onChange={(e) => update('isbn', e.target.value)} />
          <Input id="titulo" label="Título" required
            value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
          <Input id="autor" label="Autor"
            value={form.autor ?? ''} onChange={(e) => update('autor', e.target.value)} />
          <CurrencyInput id="preco" label="Preço (R$)" required
            value={form.preco} onChange={(value) => update('preco', value)} />
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
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={(p.estoque ?? 0) === 0 || sellingId === p.id}
                        onClick={() => handlePhysicalSale(p)}
                      >
                        {sellingId === p.id ? 'Registrando...' : 'Registrar venda física'}
                      </Button>
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
