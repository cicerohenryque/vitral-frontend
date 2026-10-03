import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../components/Layout/StorePage'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { adminService } from '../services/adminService'
import { extractErrorMessage } from '../services/api'
import { AccountType } from '../types/account'
import type { AdminAccount, AdminAudit, AdminDashboard, AdminOrder, AdminProduct, AdminStore } from '../types/admin'
import './AdminPage.css'

type Section = 'visao geral' | 'usuarios' | 'sebos' | 'produtos' | 'pedidos' | 'moderacao' | 'auditoria'
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function AdminPage() {
  const [section, setSection] = useState<Section>('visao geral')
  return (
    <StorePage title="Administração" subtitle="Consulte e gerencie as informações essenciais do Vitral.">
      <nav className="admin-tabs" aria-label="Áreas administrativas">
        {(['visao geral', 'usuarios', 'sebos', 'produtos', 'pedidos', 'moderacao', 'auditoria'] as Section[]).map((item) => (
          <button key={item} type="button" className={section === item ? 'active' : ''} onClick={() => setSection(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>
      {section === 'visao geral' ? <DashboardPanel /> : null}
      {section === 'usuarios' ? <UsersPanel /> : null}
      {section === 'produtos' ? <ProductsPanel /> : null}
      {section === 'sebos' ? <StoresPanel /> : null}
      {section === 'pedidos' ? <OrdersPanel /> : null}
      {section === 'moderacao' ? <ModerationPanel /> : null}
      {section === 'auditoria' ? <AuditPanel /> : null}
    </StorePage>
  )
}

function DashboardPanel() {
  const [data, setData] = useState<AdminDashboard | null>(null); const [error, setError] = useState<string | null>(null)
  useEffect(() => { adminService.dashboard().then(setData).catch((e) => setError(extractErrorMessage(e, 'Não foi possível carregar a visão geral.'))) }, [])
  if (error) return <div className="flash error" role="alert">{error}</div>
  if (!data) return <StoreStatus title="Carregando visão geral" description="Aguarde enquanto consultamos os indicadores." busy />
  const cards = [['Usuários', data.usuarios], ['Usuários ativos', data.usuariosAtivos], ['Sebos', data.sebos], ['Produtos', data.produtos], ['Produtos ativos', data.produtosAtivos], ['Pedidos', data.pedidos]]
  return <section className="admin-panel"><h2>Visão geral</h2><div className="admin-metrics">{cards.map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>
    {Object.keys(data.pedidosPorStatus).length ? <div><h3>Pedidos por status</h3><div className="admin-status-list">{Object.entries(data.pedidosPorStatus).map(([status, total]) => <span key={status}>{status}: <strong>{total}</strong></span>)}</div></div> : null}</section>
}

function UsersPanel({ inactiveOnly = false }: { inactiveOnly?: boolean }) {
  const [items, setItems] = useState<AdminAccount[]>([])
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(0)
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    adminService.listarUsuarios(page, term, undefined, inactiveOnly ? false : undefined).then((data) => {
      if (!active) return
      setItems(data.content); setPages(data.totalPages); setError(null)
    }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Não foi possível carregar os usuários.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, term, inactiveOnly])
  async function toggle(item: AdminAccount) {
    const action = item.ativo ? 'desativar' : 'ativar'
    if (!confirm(`Deseja ${action} a conta de ${item.name}?`)) return
    try {
      const updated = await adminService.alterarStatusUsuario(item.id, !item.ativo)
      setItems((current) => inactiveOnly && updated.ativo ? current.filter((account) => account.id !== item.id) : current.map((account) => account.id === updated.id ? updated : account))
      setSuccess(`Conta ${item.ativo ? 'desativada' : 'ativada'} com sucesso.`)
    }
    catch (e) { setError(extractErrorMessage(e, 'Não foi possível alterar o status da conta.')) }
  }
  function changePage(nextPage: number) { setLoading(true); setError(null); setPage(nextPage) }
  function changeTerm(value: string) { setLoading(true); setError(null); setPage(0); setTerm(value) }
  return <AdminPanel title="Usuários" term={term} setTerm={changeTerm} loading={loading} error={error} empty={!items.length}>
    {success ? <div className="flash success" role="status">{success}</div> : null}
    <Table headers={['Nome', 'E-mail', 'Tipo', 'Status', 'Cadastro', 'Ação']}>
      {items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td>{item.type}</td><td>{item.ativo ? 'Ativa' : 'Inativa'}</td><td>{date.format(new Date(item.createdAt))}</td><td>{item.type === AccountType.ADMIN ? 'Protegida' : <Button type="button" variant={item.ativo ? 'danger' : 'ghost'} onClick={() => toggle(item)}>{item.ativo ? 'Desativar' : 'Ativar'}</Button>}</td></tr>)}
    </Table><Pagination page={page} totalPages={pages} onPageChange={changePage} label="Páginas de usuários" />
  </AdminPanel>
}

function ProductsPanel({ inactiveOnly = false }: { inactiveOnly?: boolean }) {
  const [items, setItems] = useState<AdminProduct[]>([]); const [page, setPage] = useState(0); const [pages, setPages] = useState(0)
  const [term, setTerm] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    adminService.listarProdutos(page, term, inactiveOnly ? false : undefined).then((d) => { if (active) { setItems(d.content); setPages(d.totalPages); setError(null) } }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Não foi possível carregar os produtos.')) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, term, inactiveOnly])
  async function toggle(item: AdminProduct) { const action = item.ativo ? 'desativar' : 'ativar'; if (!confirm(`Deseja ${action} o produto "${item.titulo}"?`)) return; try { const updated = await adminService.alterarStatusProduto(item.id, !item.ativo); setItems((current) => inactiveOnly && updated.ativo ? current.filter((product) => product.id !== item.id) : current.map((product) => product.id === updated.id ? updated : product)) } catch (e) { setError(extractErrorMessage(e, 'Não foi possível alterar o produto.')) } }
  function changePage(nextPage: number) { setLoading(true); setError(null); setPage(nextPage) }
  function changeTerm(value: string) { setLoading(true); setError(null); setPage(0); setTerm(value) }
  return <AdminPanel title="Produtos" term={term} setTerm={changeTerm} loading={loading} error={error} empty={!items.length}>
    <Table headers={['Produto', 'Sebo', 'Preço', 'Estoque', 'Cadastro', 'Status', 'Ação']}>{items.map((item) => <tr key={item.id}><td>{item.titulo}</td><td>{item.seboNome}</td><td>{money.format(item.preco)}</td><td>{item.estoque ?? 0}</td><td>{date.format(new Date(item.createdAt))}</td><td>{item.ativo ? 'Ativo' : 'Inativo'}</td><td><Button type="button" variant={item.ativo ? 'danger' : 'ghost'} onClick={() => toggle(item)}>{item.ativo ? 'Desativar' : 'Ativar'}</Button></td></tr>)}</Table>
    <Pagination page={page} totalPages={pages} onPageChange={changePage} label="Páginas de produtos" />
  </AdminPanel>
}

function StoresPanel() {
  const [items, setItems] = useState<AdminStore[]>([]); const [page, setPage] = useState(0); const [pages, setPages] = useState(0)
  const [term, setTerm] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let active = true; adminService.listarSebos(page, term).then((d) => { if (active) { setItems(d.content); setPages(d.totalPages); setError(null) } }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Não foi possível carregar os sebos.')) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [page, term])
  function changePage(nextPage: number) { setLoading(true); setError(null); setPage(nextPage) }
  function changeTerm(value: string) { setLoading(true); setError(null); setPage(0); setTerm(value) }
  return <AdminPanel title="Sebos" term={term} setTerm={changeTerm} loading={loading} error={error} empty={!items.length} action={<Link className="admin-review-link" to="/admin/sebos">Revisar cadastros pendentes</Link>}>
    <Table headers={['Sebo', 'Responsável', 'Conta', 'Verificação', 'Produtos ativos', 'Produtos inativos', 'Cadastro']}>{items.map((item) => <tr key={item.id}><td>{item.nome}</td><td>{item.responsavel}</td><td>{item.contaAtiva ? 'Ativa' : 'Inativa'}</td><td>{item.status}</td><td>{item.produtosAtivos}</td><td>{item.produtosInativos}</td><td>{date.format(new Date(item.createdAt))}</td></tr>)}</Table>
    <Pagination page={page} totalPages={pages} onPageChange={changePage} label="Páginas de sebos" />
  </AdminPanel>
}

function OrdersPanel() {
  const [items, setItems] = useState<AdminOrder[]>([]); const [page, setPage] = useState(0); const [pages, setPages] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let active = true; adminService.listarPedidos(page).then((d) => { if (active) { setItems(d.content); setPages(d.totalPages); setError(null) } }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Não foi possível carregar os pedidos.')) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [page])
  function changePage(nextPage: number) { setLoading(true); setError(null); setPage(nextPage) }
  return <AdminPanel title="Pedidos" loading={loading} error={error} empty={!items.length}>
    <Table headers={['Pedido', 'Usuário', 'Sebo', 'Itens', 'Status', 'Pagamento', 'Total', 'Data']}>{items.map((item) => <tr key={item.id}><td>#{item.id}</td><td>{item.usuarioNome}</td><td>{item.seboNome}</td><td>{item.itens.map((i) => `${i.quantidade}× ${i.titulo}`).join(', ')}</td><td>{item.status}</td><td>{item.statusPagamento}</td><td>{money.format(item.total)}</td><td>{date.format(new Date(item.createdAt))}</td></tr>)}</Table>
    <Pagination page={page} totalPages={pages} onPageChange={changePage} label="Páginas de pedidos" />
  </AdminPanel>
}

function ModerationPanel() {
  return <div className="admin-moderation"><div><h2>Contas desativadas</h2><UsersPanel inactiveOnly /></div><div><h2>Produtos desativados</h2><ProductsPanel inactiveOnly /></div></div>
}

function AuditPanel() {
  const [items, setItems] = useState<AdminAudit[]>([]); const [page, setPage] = useState(0); const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let active = true; adminService.listarAuditoria(page).then((d) => { if (active) { setItems(d.content); setPages(d.totalPages); setError(null) } }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Não foi possível carregar a auditoria.')) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [page])
  function changePage(nextPage: number) { setLoading(true); setError(null); setPage(nextPage) }
  return <AdminPanel title="Auditoria" loading={loading} error={error} empty={!items.length}>
    <Table headers={['Data', 'Administrador', 'Ação', 'Entidade', 'Registro', 'Descrição']}>{items.map((item) => <tr key={item.id}><td>{date.format(new Date(item.createdAt))}</td><td>{item.adminNome}<small>{item.adminEmail}</small></td><td>{item.acao}</td><td>{item.entidade}</td><td>#{item.entidadeId}</td><td>{item.descricao}</td></tr>)}</Table>
    <Pagination page={page} totalPages={pages} onPageChange={changePage} label="Páginas de auditoria" />
  </AdminPanel>
}

function AdminPanel({ title, term, setTerm, loading, error, empty, action, children }: { title: string; term?: string; setTerm?: (value: string) => void; loading: boolean; error: string | null; empty: boolean; action?: ReactNode; children: ReactNode }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><h2>{title}</h2>{action}{setTerm ? <input aria-label={`Pesquisar ${title.toLowerCase()}`} type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Pesquisar" /> : null}</div>
    {error ? <div className="flash error" role="alert">{error}</div> : null}
    {loading ? <StoreStatus title={`Carregando ${title.toLowerCase()}`} description="Aguarde enquanto consultamos os dados." busy /> : empty ? <StoreStatus title={`Nenhum registro em ${title.toLowerCase()}`} description="Não há dados para os filtros informados." /> : children}
  </section>
}

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="admin-table-scroll"><table className="admin-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}
