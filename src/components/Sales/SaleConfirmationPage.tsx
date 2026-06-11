import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StorePage } from '../Layout/StorePage'
import './SalesPages.css'

export function SaleConfirmationPage() {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'declined'>('pending')

  return (
    <StorePage title="Confirmar compra" subtitle="Revise os dados antes de responder ao comprador.">
      <section className="sale-confirmation">
        <div className="sale-order-details">
          <header><span>Pedido #1024</span><strong>R$ 38,00</strong></header>
          <article>
            <div className="sale-confirmation-image" />
            <div><h2>Livro clássico</h2><p>1 unidade · Usado, muito bom</p><strong>R$ 38,00</strong></div>
          </article>
          <dl>
            <div><dt>Comprador</dt><dd>Marina Souza</dd></div>
            <div><dt>Data da solicitação</dt><dd>10/06/2026</dd></div>
            <div><dt>Forma de entrega</dt><dd>A combinar com o comprador</dd></div>
            <div><dt>Pagamento</dt><dd>Diretamente com o sebo</dd></div>
          </dl>
        </div>

        <aside className="sale-decision">
          <h2>Responder ao pedido</h2>
          {status === 'pending' ? (
            <>
              <p>Confirme apenas se o produto ainda estiver disponível no estoque.</p>
              <label>Mensagem para o comprador<textarea rows={5} placeholder="Informe os próximos passos para pagamento ou retirada" /></label>
              <button className="confirm-sale" type="button" onClick={() => setStatus('confirmed')}>Confirmar compra</button>
              <button className="decline-sale" type="button" onClick={() => setStatus('declined')}>Recusar pedido</button>
            </>
          ) : (
            <div className={`sale-feedback ${status}`}>
              <strong>{status === 'confirmed' ? 'Compra confirmada' : 'Pedido recusado'}</strong>
              <p>{status === 'confirmed' ? 'O comprador poderá acompanhar a atualização no histórico.' : 'O produto continuará disponível no catálogo.'}</p>
              <Link to="/vendas">Voltar para pedidos</Link>
            </div>
          )}
        </aside>
      </section>
    </StorePage>
  )
}
