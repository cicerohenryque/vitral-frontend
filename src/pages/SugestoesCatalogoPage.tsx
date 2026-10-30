import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BOOK_GENRE_OPTIONS, getAllowedCategories, isBookCategory, type BookGenre } from '../constants/productCatalog'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { useAuth } from '../hooks/useAuth'
import { buscaService } from '../services/buscaService'
import { categoriaService } from '../services/categoriaService'
import { extractErrorMessage } from '../services/api'
import { sugestaoCatalogoService } from '../services/sugestaoCatalogoService'
import type { Sebo } from '../types/sebo'
import type { Categoria } from '../types/categoria'
import type { SugestaoCatalogo, SugestaoCatalogoRequest } from '../types/sugestaoCatalogo'
import { StatusSugestaoCatalogo } from '../types/sugestaoCatalogo'
import { CondicaoProduto } from '../types/produto'
import './SugestoesCatalogoPage.css'

const statusLabel = { PENDENTE: 'Pendente de aprovação', APROVADA: 'Aprovada', REJEITADA: 'Rejeitada' }

export function SugestoesCatalogoPage() {
  const { isSebo, isUsuario } = useAuth()
  const [params] = useSearchParams()
  const initialSebo = Number(params.get('seboId')) || 0
  const [items, setItems] = useState<SugestaoCatalogo[]>([])
  const [catalogos, setCatalogos] = useState<Sebo[]>([])
  const [catalogSearch, setCatalogSearch] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reviewId, setReviewId] = useState<number | null>(null)
  const [review, setReview] = useState<SugestaoCatalogoRequest | null>(null)
  const [form, setForm] = useState<SugestaoCatalogoRequest>({
    seboId: initialSebo, titulo: '', categoriaId: 0, autor: '', descricao: '', preco: 0,
    estoque: 1, condicao: CondicaoProduto.USADO, fotoUrl: '',
  })

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const result = isSebo
        ? await sugestaoCatalogoService.listarRecebidas(page)
        : await sugestaoCatalogoService.listarMinhas(page)
      setItems(result.content); setTotalPages(result.totalPages)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível carregar as sugestões.'))
    } finally { setLoading(false) }
  }, [isSebo, page])

  useEffect(() => {
    // Recarrega a página quando o perfil ou a paginação mudam.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isSebo || isUsuario) void load()
  }, [isSebo, isUsuario, load])

  useEffect(() => {
    categoriaService.listar()
      .then((categorias) => {
        const permitidas = getAllowedCategories(categorias.content)
        setCategorias(permitidas)
        if (permitidas[0]) setForm((old) => ({ ...old, categoriaId: old.categoriaId || permitidas[0].id }))
      })
      .catch((err) => setError(extractErrorMessage(err, 'Não foi possível carregar as categorias disponíveis.')))
  }, [])

  useEffect(() => {
    if (!isUsuario) return
    buscaService.buscarSebos({}, 0, 100)
      .then((sebos) => setCatalogos(sebos.content))
      .catch((err) => setError(extractErrorMessage(err, 'Não foi possível carregar os catálogos disponíveis.')))
  }, [isUsuario])

  const visibleCatalogs = useMemo(() => {
    const q = catalogSearch.trim().toLocaleLowerCase('pt-BR')
    return q ? catalogos.filter((item) => `${item.nome} ${item.cidade ?? ''} ${item.uf ?? ''}`.toLocaleLowerCase('pt-BR').includes(q)) : catalogos
  }, [catalogSearch, catalogos])
  const selectedCategory = categorias.find((item) => item.id === form.categoriaId)
  const bookSelected = isBookCategory(selectedCategory)
  const selectedReviewCategory = categorias.find((item) => item.id === review?.categoriaId)
  const reviewBookSelected = isBookCategory(selectedReviewCategory)

  function update<K extends keyof SugestaoCatalogoRequest>(key: K, value: SugestaoCatalogoRequest[K]) {
    setForm((old) => ({ ...old, [key]: value }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setSuccess(null)
    try {
      await sugestaoCatalogoService.criar(form)
      setSuccess('Informação enviada. O responsável pelo catálogo confirmará se o produto está disponível antes da publicação.')
      setForm((old) => ({ ...old, titulo: '', autor: '', descricao: '', ano: undefined, preco: 0, estoque: 1, bookGenre: undefined, fotoUrl: '' }))
      setPage(0); await load()
    } catch (err) { setError(extractErrorMessage(err, 'Não foi possível enviar a sugestão. Revise os dados e tente novamente.')) }
    finally { setBusy(false) }
  }

  function startReview(item: SugestaoCatalogo) {
    setReviewId(item.id)
    setReview({ seboId: item.seboId, titulo: item.titulo, categoriaId: item.categoriaId,
      bookGenre: item.bookGenre, autor: item.autor, descricao: item.descricao, ano: item.ano,
      preco: item.preco, estoque: item.estoque, condicao: item.condicao, fotoUrl: item.fotoUrl })
  }

  async function approve(event: React.FormEvent) {
    event.preventDefault()
    if (!reviewId || !review || !window.confirm(`Deseja confirmar e publicar “${review.titulo}” no catálogo?`)) return
    setBusy(true); setError(null)
    try {
      const { seboId: _seboId, ...payload } = review
      void _seboId
      await sugestaoCatalogoService.aprovar(reviewId, payload)
      setSuccess('Produto confirmado e publicado no catálogo.')
      setReviewId(null); setReview(null)
      await load()
    } catch (err) { setError(extractErrorMessage(err, 'Não foi possível confirmar e publicar o produto.')) }
    finally { setBusy(false) }
  }

  async function reject(item: SugestaoCatalogo) {
    if (!window.confirm(`Deseja rejeitar a informação sobre “${item.titulo}”? O produto não será publicado.`)) return
    const motivo = window.prompt('Motivo da rejeição (opcional):') ?? undefined
    setBusy(true); setError(null)
    try { await sugestaoCatalogoService.rejeitar(item.id, motivo); setSuccess('Informação rejeitada. O produto não foi publicado.'); await load() }
    catch (err) { setError(extractErrorMessage(err, 'Não foi possível rejeitar a informação.')) }
    finally { setBusy(false) }
  }

  if (!isSebo && !isUsuario) return <StorePage title="Sugestões de catálogo"><StoreStatus title="Acesso não permitido" description="Esta área é destinada a usuários e responsáveis por catálogos." tone="error" /></StorePage>

  return <StorePage title={isSebo ? 'Produtos informados por usuários' : 'Informar produto de um sebo'} subtitle={isSebo ? 'Confirme se o produto está disponível, revise os dados e somente então publique no catálogo.' : 'Informe um produto que você sabe que está disponível em um sebo, mas ainda não aparece no Vitral.'}>
    {error ? <div className="flash error" role="alert">{error}</div> : null}
    {success ? <div className="flash success" role="status">{success}</div> : null}
    {isUsuario ? <form className="catalog-suggestion-form" onSubmit={submit}>
      <h2>Informar produto encontrado</h2>
      <Input id="catalog-search" label="Localizar catálogo" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} placeholder="Nome, cidade ou estado" />
      <label><span>Catálogo de destino</span><select required value={form.seboId || ''} onChange={(e) => update('seboId', Number(e.target.value))}>
        <option value="">Selecione</option>{visibleCatalogs.map((item) => <option key={item.id} value={item.id}>{item.nome}{item.cidade ? ` — ${item.cidade}/${item.uf}` : ''}</option>)}
      </select></label>
      <label><span>Categoria</span><select required value={form.categoriaId || ''} onChange={(e) => setForm((old) => ({ ...old, categoriaId: Number(e.target.value), bookGenre: undefined }))}><option value="">Selecione</option>{categorias.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
      <Input id="suggest-title" label="Título do produto" required value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
      <Input id="suggest-author" label={selectedCategory?.slug === 'cds' || selectedCategory?.slug === 'vinis' ? 'Artista' : 'Autor ou fabricante'} value={form.autor ?? ''} onChange={(e) => update('autor', e.target.value)} />
      {bookSelected ? <label><span>Gênero literário</span><select value={form.bookGenre ?? ''} onChange={(e) => update('bookGenre', (e.target.value || undefined) as BookGenre | undefined)}><option value="">Não informado</option>{BOOK_GENRE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></label> : null}
      <Input id="suggest-year" label="Ano" type="number" min={0} max={2200} value={form.ano ?? ''} onChange={(e) => update('ano', e.target.value ? Number(e.target.value) : undefined)} />
      <CurrencyInput id="suggest-price" label="Preço observado" required value={form.preco} onChange={(value) => update('preco', value)} />
      <Input id="suggest-stock" label="Quantidade observada" type="number" min={0} value={form.estoque ?? 1} onChange={(e) => update('estoque', Number(e.target.value))} />
      <label><span>Condição</span><select value={form.condicao} onChange={(e) => update('condicao', e.target.value as typeof form.condicao)}><option value="NOVO">Novo</option><option value="SEMINOVO">Seminovo</option><option value="USADO">Usado</option></select></label>
      <label className="suggestion-wide"><span>Descrição</span><textarea rows={4} maxLength={2000} value={form.descricao ?? ''} onChange={(e) => update('descricao', e.target.value)} /></label>
      <Input id="suggest-image" className="suggestion-wide" label="URL da imagem (opcional)" type="url" value={form.fotoUrl ?? ''} onChange={(e) => update('fotoUrl', e.target.value)} />
      <div className="suggestion-wide"><Button type="submit" disabled={busy || !form.categoriaId}>{busy ? 'Enviando...' : 'Enviar informação ao sebo'}</Button></div>
    </form> : null}

    <section className="suggestion-list"><h2>{isSebo ? 'Informações aguardando confirmação' : 'Produtos que informei'}</h2>
      {loading ? <StoreStatus title="Carregando sugestões" description="Consultando o andamento das solicitações." busy /> : null}
      {!loading && items.length === 0 ? <StoreStatus title="Nenhuma sugestão" description={isSebo ? 'Seu catálogo ainda não recebeu sugestões.' : 'Você ainda não enviou sugestões de produtos.'} /> : null}
      {items.map((item) => <article className="suggestion-card" key={item.id}>
        <div><span className={`suggestion-status ${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span><h3>{item.titulo}</h3><p>{item.autor || 'Autor ou fabricante não informado'} • {item.catalogoNome}</p><small>Enviada por {item.usuarioNome} em {new Date(item.enviadaEm).toLocaleDateString('pt-BR')}</small>{item.motivoRejeicao ? <p><strong>Motivo:</strong> {item.motivoRejeicao}</p> : null}</div>
        <div className="suggestion-actions"><Link to={`/vendedor/${item.seboId}`}>Ver catálogo</Link>{isSebo && item.status === StatusSugestaoCatalogo.PENDENTE ? <><Button type="button" disabled={busy} onClick={() => startReview(item)}>Revisar dados</Button><Button type="button" variant="danger" disabled={busy} onClick={() => void reject(item)}>Rejeitar</Button></> : null}</div>
        {isSebo && reviewId === item.id && review ? <form className="suggestion-review" onSubmit={approve}>
          <h4>Confirme os dados antes da publicação</h4>
          <Input id={`review-title-${item.id}`} label="Título" required value={review.titulo} onChange={(e) => setReview({ ...review, titulo: e.target.value })} />
          <label><span>Categoria</span><select required value={review.categoriaId} onChange={(e) => setReview({ ...review, categoriaId: Number(e.target.value), bookGenre: undefined })}>{categorias.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label>
          <Input id={`review-author-${item.id}`} label="Autor, artista ou fabricante" value={review.autor ?? ''} onChange={(e) => setReview({ ...review, autor: e.target.value })} />
          {reviewBookSelected ? <label><span>Gênero literário</span><select value={review.bookGenre ?? ''} onChange={(e) => setReview({ ...review, bookGenre: (e.target.value || undefined) as BookGenre | undefined })}><option value="">Não informado</option>{BOOK_GENRE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></label> : null}
          <CurrencyInput id={`review-price-${item.id}`} label="Preço confirmado" required value={review.preco} onChange={(preco) => setReview({ ...review, preco })} />
          <Input id={`review-stock-${item.id}`} label="Quantidade disponível" type="number" min={0} required value={review.estoque ?? 0} onChange={(e) => setReview({ ...review, estoque: Number(e.target.value) })} />
          <label><span>Condição</span><select value={review.condicao} onChange={(e) => setReview({ ...review, condicao: e.target.value as typeof review.condicao })}><option value="NOVO">Novo</option><option value="SEMINOVO">Seminovo</option><option value="USADO">Usado</option></select></label>
          <div className="suggestion-review-actions"><Button type="submit" disabled={busy}>{busy ? 'Publicando...' : 'Confirmar e publicar'}</Button><Button type="button" variant="ghost" onClick={() => { setReviewId(null); setReview(null) }}>Cancelar</Button></div>
        </form> : null}
      </article>)}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Páginas de sugestões" />
    </section>
  </StorePage>
}
