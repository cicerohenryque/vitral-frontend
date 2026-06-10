import { useState } from 'react'
import { StorePage } from '../Layout/StorePage'
import './AccountPage.css'

export function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <StorePage title="Minha conta" subtitle="Gerencie seus dados e preferências no Vitral.">
      <section className="account-layout">
        <aside className="account-summary">
          <div className="account-avatar">RS</div>
          <h2>Rute Silva</h2>
          <p>rute.silva@ccc.ufcg.edu.br</p>
          <span>Conta de usuário</span>
          <nav aria-label="Áreas da conta">
            <a className="is-active" href="#dados">Dados pessoais</a>
            <a href="#endereco">Endereço</a>
            <a href="#seguranca">Segurança</a>
            <a href="#preferencias">Preferências</a>
          </nav>
        </aside>

        <form className="account-form" onSubmit={(event) => event.preventDefault()}>
          <header>
            <div>
              <h2>Dados pessoais</h2>
              <p>Essas informações identificam sua conta.</p>
            </div>
            <button type="button" onClick={() => setIsEditing((value) => !value)}>
              {isEditing ? 'Cancelar' : 'Editar dados'}
            </button>
          </header>

          <div className="account-fields">
            <label>
              Nome completo
              <input defaultValue="Rute Silva" disabled={!isEditing} />
            </label>
            <label>
              Nome de usuário
              <input defaultValue="rutesilvva" disabled={!isEditing} />
            </label>
            <label>
              E-mail
              <input type="email" defaultValue="rute.silva@ccc.ufcg.edu.br" disabled={!isEditing} />
            </label>
            <label>
              Telefone
              <input placeholder="Adicionar telefone" disabled={!isEditing} />
            </label>
            <label className="account-wide-field">
              Sobre você
              <textarea
                rows={4}
                defaultValue="Apaixonada por livros, discos e itens com história."
                disabled={!isEditing}
              />
            </label>
          </div>

          {isEditing && <button className="account-save" type="submit">Salvar alterações</button>}
        </form>
      </section>
    </StorePage>
  )
}
