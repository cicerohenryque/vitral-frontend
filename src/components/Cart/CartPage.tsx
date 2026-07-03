import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'
import { extractErrorMessage } from '../../services/api'
import { cestaService } from '../../services/cestaService'
import type { CestaItem } from '../../types/cesta'

export function CartPage() {
  const [items, setItems] = useState<CestaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.subtotal), 0),
    [items],
  )
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantidade), 0),
    [items],
  )

  useEffect(() => {
    let active = true
    cestaService
      .listar()
      .then((data) => {
        if (!active) return
        setItems(data)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setItems([])
        setError(extractErrorMessage(err, 'Nao foi possivel carregar a cesta.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function remover(produtoId: number) {
    setBusyId(produtoId)
    setError(null)
    try {
      await cestaService.remover(produtoId)
      setItems((current) => current.filter((item) => item.produtoId !== produtoId))
    } catch (err) {
      setError(extractErrorMessage(err, 'Nao foi possivel remover o item da cesta.'))
    } finally {
      setBusyId(null)
    }
  }

  async function atualizarQuantidade(item: CestaItem, quantidade: number) {
    const nextQuantity = Math.max(1, Math.min(quantidade, item.estoqueDisponivel))
    setBusyId(item.produtoId)
    setError(null)
    try {
      await cestaService.atualizarQuantidade(item.produtoId, nextQuantity)
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.produtoId === item.produtoId
            ? {
              ...currentItem,
              quantidade: nextQuantity,
              subtotal: Number(currentItem.preco) * nextQuantity,
            }
            : currentItem,
        ),
      )
    } catch (err) {
      setError(extractErrorMessage(err, 'Nao foi possivel atualizar a quantidade.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <StorePage
      title="Carrinho"
      subtitle="Confira os itens guardados na sua cesta de compras."
      searchPlaceholder="Pesquisar no acervo"
    >
      {loading ? (
        <StoreStatus title="Carregando carrinho" description="Buscando os itens salvos na sua cesta." busy />
      ) : error ? (
        <StoreStatus title="Erro ao carregar carrinho" description={error} tone="error" />
      ) : items.length === 0 ? (
        <StoreStatus
          title="Seu carrinho está vazio"
          description="Adicione produtos disponíveis ao carrinho para confirmar um pedido."
          action={<Link to="/busca">Buscar produtos</Link>}
        />
      ) : (
        <>
          <section className="store-summary" aria-label="Resumo do carrinho">
            <div>
              <p>{totalItems} {totalItems === 1 ? 'item' : 'itens'} na cesta</p>
              <strong>R$ {total.toFixed(2)}</strong>
            </div>
            <Link className="primary" to="/confirmar-pedido">Confirmar pedido</Link>
          </section>

          <section className="store-list" aria-label="Itens do carrinho">
            {items.map((item) => (
              <article className="store-list-card" key={item.id}>
                <Link className="store-list-image" to={`/produto/${item.produtoId}`}>
                  {item.fotoUrl ? <img src={item.fotoUrl} alt={item.titulo} /> : 'Sem imagem'}
                </Link>
                <div className="store-list-copy">
                  <h2>{item.titulo}</h2>
                  <p>{item.autor ?? 'Autor nao informado'} · {item.condicao}</p>
                  <p>Estoque disponível: {item.estoqueDisponivel}</p>
                  <strong className="store-list-price">
                    {item.precoOriginal != null && Number(item.precoOriginal) > Number(item.preco) ? (
                      <>
                        <s style={{ opacity: 0.6, marginRight: 6, fontWeight: 400 }}>
                          R$ {(Number(item.precoOriginal) * item.quantidade).toFixed(2)}
                        </s>
                        R$ {Number(item.subtotal).toFixed(2)}
                      </>
                    ) : (
                      <>R$ {Number(item.subtotal).toFixed(2)}</>
                    )}
                  </strong>
                </div>
                <div className="store-list-actions">
                  <label className="store-quantity">
                    Qtd.
                    <input
                      type="number"
                      min={1}
                      max={item.estoqueDisponivel}
                      value={item.quantidade}
                      disabled={busyId === item.produtoId}
                      onChange={(event) => atualizarQuantidade(item, Number(event.target.value))}
                    />
                  </label>
                  <Link to={`/produto/${item.produtoId}`} className="primary">Ver produto</Link>
                  <button
                    className="danger"
                    type="button"
                    disabled={busyId === item.produtoId}
                    onClick={() => remover(item.produtoId)}
                  >
                    {busyId === item.produtoId ? 'Removendo...' : 'Remover'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </StorePage>
  )
}
