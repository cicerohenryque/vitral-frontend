import { StorePage } from '../Layout/StorePage'
import './SupportPage.css'

const questions = [
  'Como faço uma reserva?',
  'Como conversar com um vendedor?',
  'Posso denunciar um anúncio?',
  'Como altero os dados da minha conta?',
]

export function SupportPage() {
  return (
    <StorePage
      title="Suporte"
      subtitle="Encontre respostas ou fale com a equipe do Vitral."
      searchPlaceholder="Como podemos ajudar?"
    >
      <section className="support-shortcuts" aria-label="Canais de suporte">
        <article>
          <span>01</span>
          <h2>Central de ajuda</h2>
          <p>Consulte orientações para comprar, reservar e usar sua conta.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Fale conosco</h2>
          <p>Envie uma mensagem para nossa equipe analisar sua solicitação.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Segurança</h2>
          <p>Informe anúncios ou comportamentos que precisam de atenção.</p>
        </article>
      </section>

      <section className="support-main">
        <div className="support-faq">
          <h2>Perguntas frequentes</h2>
          {questions.map((question) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>
                Acesse a área correspondente pelo menu principal. Caso ainda precise de ajuda, envie sua
                dúvida pelo formulário.
              </p>
            </details>
          ))}
        </div>

        <form className="support-form" onSubmit={(event) => event.preventDefault()}>
          <h2>Envie sua dúvida</h2>
          <label htmlFor="support-subject">Assunto</label>
          <input id="support-subject" placeholder="Informe o assunto" />

          <label htmlFor="support-message">Mensagem</label>
          <textarea id="support-message" rows={5} placeholder="Conte o que aconteceu" />

          <button type="submit">Enviar mensagem</button>
        </form>
      </section>
    </StorePage>
  )
}
