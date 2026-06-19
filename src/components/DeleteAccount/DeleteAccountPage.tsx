import { Link } from 'react-router-dom'
import { MinusCircleIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './DeleteAccountPage.css'

export function DeleteAccountPage() {
  return (
    <StorePage title="Excluir conta" subtitle="Revise as consequências antes de continuar.">
      <section className="delete-account">
        <div className="delete-warning">
          <MinusCircleIcon size={52} />
          <h2>Esta ação é permanente.</h2>
          <p>Ao excluir sua conta, você perderá acesso aos dados associados ao Vitral.</p>
          <ul>
            <li>Favoritos e informações pessoais serão removidos.</li>
            <li>Pedidos ativos precisam ser resolvidos antes da exclusão definitiva.</li>
            <li>O histórico poderá ser mantido apenas quando necessário para integridade dos pedidos.</li>
          </ul>
        </div>

        <div className="delete-confirmation">
          <h2>Endpoint indisponível</h2>
          <p>
            O backend atual não expõe exclusão de usuário. Para evitar erro 403, esta ação fica
            bloqueada até o endpoint existir no contrato da API.
          </p>
          <Link to="/painel/perfil">Cancelar e voltar</Link>
        </div>
      </section>
    </StorePage>
  )
}
