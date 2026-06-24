import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { TopBar } from '../components/TopBar'
import { ProductCard } from '../components/ProductCard'
import { extractErrorMessage } from '../services/api'
import { buscaService } from '../services/buscaService'
import type { Produto } from '../types/produto'
import type { Sebo } from '../types/sebo'
import { CondicaoProduto } from '../types/produto'
import './BuscaPage.css'

type Tab = 'produtos' | 'sebos'

export function BuscaPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = (searchParams.get('tab') as Tab) ?? 'produtos'
  const q = searchParams.get('q') ?? ''

  const [inputQ, setInputQ] = useState(q)
  const [condicao, setCondicao] = useState(searchParams.get('condicao') ?? '')
  const [seboId, setSeboId] = useState(searchParams.get('seboId') ?? '')
  const [precoMin, setPrecoMin] = useState(searchParams.get('precoMin') ?? '')
  const [precoMax, setPrecoMax] = useState(searchParams.get('precoMax') ?? '')
  const [cidade, setCidade] = useState(searchParams.get('cidade') ?? '')
  const [uf, setUf] = useState(searchParams.get('uf') ?? '')

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [sebos, setSebos] = useState<Sebo[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [loadingSebos, setLoadingSebos] = useState(true)
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null)
  const [errorSebos, setErrorSebos] = useState<string | null>(null)
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [totalSebos, setTotalSebos] = useState(0)

  useEffect(() => {
    // Keep the editable input aligned with browser navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputQ(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const params = {
      q: q || undefined,
      seboId: seboId ? Number(seboId) : undefined,
      condicao: condicao ? (condicao as CondicaoProduto) : undefined,
      precoMin: precoMin ? Number(precoMin) : undefined,
      precoMax: precoMax ? Number(precoMax) : undefined,
    }

    buscaService
      .buscarProdutos(params)
      .then((page) => {
        setErrorProdutos(null)
        setProdutos(page.content)
        setTotalProdutos(page.totalElements)
      })
      .catch((err) => {
        setErrorProdutos(extractErrorMessage(err, 'Nao foi possivel carregar os produtos.'))
        setProdutos([])
        setTotalProdutos(0)
      })
      .finally(() => setLoadingProdutos(false))
  }, [q, seboId, condicao, precoMin, precoMax])

  useEffect(() => {
    const params = {
      q: q || undefined,
      cidade: cidade || undefined,
      uf: uf || undefined,
    }

    buscaService
      .buscarSebos(params)
      .then((page) => {
        setErrorSebos(null)
        setSebos(page.content)
        setTotalSebos(page.totalElements)
      })
      .catch((err) => {
        setErrorSebos(extractErrorMessage(err, 'Nao foi possivel carregar os sebos.'))
        setSebos([])
        setTotalSebos(0)
      })
      .finally(() => setLoadingSebos(false))
  }, [q, cidade, uf])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (inputQ.trim()) {
      next.set('q', inputQ.trim())
    } else {
      next.delete('q')
    }
    setLoadingProdutos(true)
    setLoadingSebos(true)
    setErrorProdutos(null)
    setErrorSebos(null)
    setSearchParams(next)
  }

  function setTab(t: Tab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    setSearchParams(next)
  }

  function aplicarFiltros(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (tab === 'produtos') {
      if (condicao) next.set('condicao', condicao)
      else next.delete('condicao')
      if (seboId) next.set('seboId', seboId)
      else next.delete('seboId')
      if (precoMin) next.set('precoMin', precoMin)
      else next.delete('precoMin')
      if (precoMax) next.set('precoMax', precoMax)
      else next.delete('precoMax')
      setLoadingProdutos(true)
      setErrorProdutos(null)
    } else {
      if (cidade) next.set('cidade', cidade)
      else next.delete('cidade')
      if (uf) next.set('uf', uf)
      else next.delete('uf')
      setLoadingSebos(true)
      setErrorSebos(null)
    }
    setSearchParams(next)
  }

  function limparFiltros() {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    next.set('tab', tab)
    setSearchParams(next)
    setCondicao('')
    setSeboId('')
    setPrecoMin('')
    setPrecoMax('')
    setCidade('')
    setUf('')
    setLoadingProdutos(true)
    setLoadingSebos(true)
    setErrorProdutos(null)
    setErrorSebos(null)
  }

  return (
    <div className="page busca-page">
      <TopBar />
      <Header />
      <main className="container busca-main">
        <form className="busca-search-bar" onSubmit={handleSearch}>
          <input
            type="search"
            aria-label="Pesquisar produtos ou sebos"
            placeholder="O que você está procurando?"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        {q ? <p className="busca-termo">Resultados para: <strong>"{q}"</strong></p> : null}

        <div className="busca-layout">
          <aside className="busca-filtros">
            <form onSubmit={aplicarFiltros}>
              <h3>Filtros</h3>
              {tab === 'produtos' ? (
                <>
                  <label className="busca-filtro-label">
                    Condição
                    <select value={condicao} onChange={(e) => setCondicao(e.target.value)}>
                      <option value="">Todas</option>
                      <option value={CondicaoProduto.NOVO}>Novo</option>
                      <option value={CondicaoProduto.SEMINOVO}>Seminovo</option>
                      <option value={CondicaoProduto.USADO}>Usado</option>
                    </select>
                  </label>
                  <label className="busca-filtro-label">
                    ID do sebo
                    <input
                      type="number"
                      min={1}
                      value={seboId}
                      onChange={(e) => setSeboId(e.target.value)}
                      placeholder="ex: 1"
                    />
                  </label>
                  <label className="busca-filtro-label">
                    Preço mín. (R$)
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={precoMin}
                      onChange={(e) => setPrecoMin(e.target.value)}
                      placeholder="0,00"
                    />
                  </label>
                  <label className="busca-filtro-label">
                    Preço máx. (R$)
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      placeholder="sem limite"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="busca-filtro-label">
                    Cidade
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="ex: Campina Grande"
                    />
                  </label>
                  <label className="busca-filtro-label">
                    Estado (UF)
                    <input
                      type="text"
                      maxLength={2}
                      value={uf}
                      onChange={(e) => setUf(e.target.value.toUpperCase())}
                      placeholder="ex: PB"
                    />
                  </label>
                </>
              )}
              <button type="submit" className="busca-filtro-btn">Aplicar</button>
              <button type="button" className="busca-filtro-btn busca-filtro-btn-ghost" onClick={limparFiltros}>
                Limpar
              </button>
            </form>
          </aside>

          <section className="busca-resultados">
            <div className="busca-tabs" role="tablist" aria-label="Tipo de resultado">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'produtos'}
                className={`busca-tab${tab === 'produtos' ? ' active' : ''}`}
                onClick={() => setTab('produtos')}
              >
                Produtos {totalProdutos > 0 ? `(${totalProdutos})` : ''}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'sebos'}
                className={`busca-tab${tab === 'sebos' ? ' active' : ''}`}
                onClick={() => setTab('sebos')}
              >
                Sebos {totalSebos > 0 ? `(${totalSebos})` : ''}
              </button>
            </div>

            {tab === 'produtos' ? (
              errorProdutos ? (
                <div className="flash error" role="alert">{errorProdutos}</div>
              ) : loadingProdutos ? (
                <div className="busca-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : produtos.length === 0 ? (
                <p className="busca-empty">Nenhum produto encontrado.</p>
              ) : (
                <div className="busca-grid">
                  {produtos.map((p) => (
                    <ProductCard key={p.id} produto={p} />
                  ))}
                </div>
              )
            ) : errorSebos ? (
              <div className="flash error" role="alert">{errorSebos}</div>
            ) : loadingSebos ? (
              <p className="busca-empty">Carregando sebos...</p>
            ) : sebos.length === 0 ? (
              <p className="busca-empty">Nenhum sebo encontrado.</p>
            ) : (
              <div className="busca-sebos-lista">
                {sebos.map((s) => (
                  <Link key={s.id} className="busca-sebo-card" to={`/vendedor/${s.id}`}>
                    {s.fotoUrl ? (
                      <img src={s.fotoUrl} alt={s.nome} className="busca-sebo-foto" />
                    ) : (
                      <div className="busca-sebo-foto busca-sebo-foto-placeholder">S</div>
                    )}
                    <div className="busca-sebo-info">
                      <h3>{s.nome}</h3>
                      {s.cidade ? (
                        <p className="busca-sebo-local">{s.cidade}{s.uf ? ` - ${s.uf}` : ''}</p>
                      ) : null}
                      {s.descricao ? <p className="busca-sebo-desc">{s.descricao}</p> : null}
                      {s.horarioFuncionamento ? (
                        <p className="busca-sebo-horario">{s.horarioFuncionamento}</p>
                      ) : null}
                      {s.telefone ? <p className="busca-sebo-tel">{s.telefone}</p> : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
