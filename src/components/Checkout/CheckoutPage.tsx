import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './CheckoutPage.css'

const checkoutItems = [
  { name: 'Livro selecionado', seller: 'Sebo Central', value: 'R$ 38,00' },
  { name: 'Disco clássico', seller: 'Acervo 33', value: 'R$ 65,00' },
  { name: 'Item colecionável', seller: 'Livraria da Praça', value: 'R$ 42,50' },
]

export function CheckoutPage() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <StorePage title="Confirmar pedido" subtitle="Revise os dados e envie as solicitações aos vendedores.">
      {confirmed ? (
        <section className="checkout-success">
          <span>Pedido enviado</span>
          <h2>Suas solicitações foram registradas.</h2>
          <p>
            Cada vendedor receberá o pedido e poderá confirmar disponibilidade, pagamento e forma de
            entrega.
          </p>
          <div>
            <Link to="/reservas">Acompanhar reservas</Link>
            <Link to="/">Voltar para o início</Link>
          </div>
        </section>
      ) : (
        <section className="checkout-layout">
          <div className="checkout-details">
            <section>
              <header><span>1</span><div><h2>Contato</h2><p>Dados usados pelos vendedores para responder.</p></div></header>
              <div className="checkout-fields">
                <label>Nome<input defaultValue="Rute Silva" /></label>
                <label>Telefone<input placeholder="(83) 99999-9999" /></label>
                <label className="checkout-wide">E-mail<input defaultValue="rute.silva@ccc.ufcg.edu.br" /></label>
              </div>
            </section>

            <section>
              <header><span>2</span><div><h2>Preferência de recebimento</h2><p>A opção será confirmada diretamente com cada sebo.</p></div></header>
              <div className="checkout-options">
                <label><input type="radio" name="delivery" defaultChecked /> Retirada no sebo</label>
                <label><input type="radio" name="delivery" /> Entrega a combinar</label>
              </div>
              <label className="checkout-note">Observações<textarea rows={4} placeholder="Inclua horários ou informações úteis para os vendedores" /></label>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>Resumo do pedido</h2>
            {checkoutItems.map((item) => (
              <article key={item.name}>
                <div className="checkout-item-image" />
                <div><strong>{item.name}</strong><span>{item.seller}</span></div>
                <strong>{item.value}</strong>
              </article>
            ))}
            <dl>
              <div><dt>Total dos itens</dt><dd>R$ 145,50</dd></div>
              <div><dt>Pagamento</dt><dd>A combinar</dd></div>
            </dl>
            <p>O envio do pedido não realiza cobrança e depende da confirmação dos vendedores.</p>
            <button type="button" onClick={() => setConfirmed(true)}>Confirmar pedido</button>
            <Link to="/carrinho">Voltar ao carrinho</Link>
          </aside>
        </section>
      )}
    </StorePage>
  )
}
