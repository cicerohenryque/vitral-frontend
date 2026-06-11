import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './CartPage.css'

type CartItem = {
  id: number
  name: string
  seller: string
  price: number
  quantity: number
}

const initialItems: CartItem[] = [
  { id: 1, name: 'Livro selecionado', seller: 'Sebo Central', price: 38, quantity: 1 },
  { id: 2, name: 'Disco clássico', seller: 'Acervo 33', price: 65, quantity: 1 },
  { id: 3, name: 'Item colecionável', seller: 'Livraria da Praça', price: 42.5, quantity: 1 },
]

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function CartPage() {
  const [items, setItems] = useState(initialItems)

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  )

  function changeQuantity(id: number, amount: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item,
      ),
    )
  }

  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  return (
    <StorePage
      title="Carrinho"
      subtitle="Revise seus itens antes de solicitar a reserva."
      searchPlaceholder="Pesquisar no carrinho"
    >
      {items.length === 0 ? (
        <section className="store-empty">
          <div>
            <CartIcon size={57} />
            <h2>Seu carrinho está vazio</h2>
            <p>Explore o acervo e adicione os itens que deseja reservar com os vendedores.</p>
            <Link className="store-primary-link" to="/">
              Explorar o Vitral
            </Link>
          </div>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items" aria-label="Itens no carrinho">
            <header>
              <h2>Seus itens</h2>
              <span>{items.length} itens</span>
            </header>

            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image" />
                <div className="cart-item-copy">
                  <h3>{item.name}</h3>
                  <p>Vendido por {item.seller}</p>
                  <button type="button" onClick={() => removeItem(item.id)}>
                    Remover
                  </button>
                </div>
                <div className="cart-quantity" aria-label={`Quantidade de ${item.name}`}>
                  <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label="Diminuir">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label="Aumentar">
                    +
                  </button>
                </div>
                <strong>{currency.format(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Resumo</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{currency.format(subtotal)}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>A combinar</dd>
              </div>
              <div className="cart-total">
                <dt>Total dos itens</dt>
                <dd>{currency.format(subtotal)}</dd>
              </div>
            </dl>
            <p>Pagamento, entrega e reserva serão combinados diretamente com cada vendedor.</p>
            <Link className="cart-checkout-link" to="/confirmar-pedido">Confirmar pedido</Link>
            <Link to="/">Continuar comprando</Link>
          </aside>
        </section>
      )}
    </StorePage>
  )
}
