import { StorePage } from '../Layout/StorePage'
import './MessagesPage.css'

const conversations = [
  { seller: 'Sebo Central', preview: 'O item continua disponível para reserva.', time: '10:42' },
  { seller: 'Livraria da Praça', preview: 'Podemos combinar a forma de entrega.', time: 'Ontem' },
  { seller: 'Acervo 33', preview: 'Enviei mais detalhes sobre o estado do disco.', time: '08/06' },
]

export function MessagesPage() {
  return (
    <StorePage
      title="Mensagens"
      subtitle="Converse diretamente com os vendedores."
      searchPlaceholder="Pesquisar uma conversa"
    >
      <section className="messages-layout">
        <div className="conversation-list" aria-label="Conversas">
          {conversations.map((conversation, index) => (
            <button className={`conversation-item${index === 0 ? ' is-active' : ''}`} key={conversation.seller}>
              <span className="conversation-avatar">{conversation.seller.charAt(0)}</span>
              <span className="conversation-copy">
                <strong>{conversation.seller}</strong>
                <small>{conversation.preview}</small>
              </span>
              <time>{conversation.time}</time>
            </button>
          ))}
        </div>

        <article className="message-panel">
          <header>
            <span className="conversation-avatar">S</span>
            <div>
              <h2>Sebo Central</h2>
              <p>Vendedor</p>
            </div>
          </header>
          <div className="message-history">
            <p className="message-bubble received">Olá! O item continua disponível para reserva.</p>
            <p className="message-bubble sent">Ótimo. Gostaria de saber quais são as formas de entrega.</p>
          </div>
          <form className="message-compose" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Escrever mensagem" placeholder="Escreva uma mensagem..." />
            <button type="submit">Enviar</button>
          </form>
        </article>
      </section>
    </StorePage>
  )
}
