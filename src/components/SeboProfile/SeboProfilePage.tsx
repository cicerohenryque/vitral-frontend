import { useState } from 'react'
import { StorePage } from '../Layout/StorePage'
import './SeboProfilePage.css'

export function SeboProfilePage() {
  const [saved, setSaved] = useState(false)

  return (
    <StorePage title="Informações do sebo" subtitle="Atualize os dados exibidos publicamente no Vitral.">
      <form
        className="sebo-profile-form"
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(true)
        }}
      >
        <aside className="sebo-photo-panel">
          <div className="sebo-photo">SC</div>
          <h2>Sebo Central</h2>
          <p>Perfil público do estabelecimento</p>
          <label>
            Alterar foto
            <input type="file" accept="image/*" />
          </label>
        </aside>

        <section className="sebo-fields">
          <header>
            <div>
              <h2>Dados públicos</h2>
              <p>Essas informações ajudam compradores a conhecer e encontrar o sebo.</p>
            </div>
            {saved && <span>Alterações salvas.</span>}
          </header>

          <div className="sebo-field-grid">
            <label>Nome do sebo<input defaultValue="Sebo Central" /></label>
            <label>Telefone<input defaultValue="(83) 99999-0000" /></label>
            <label>E-mail de contato<input type="email" defaultValue="contato@sebocentral.com" /></label>
            <label>Horário de funcionamento<input defaultValue="Segunda a sábado, 9h às 18h" /></label>
            <label className="sebo-wide-field">Endereço<input defaultValue="Rua das Letras, 120 - Centro, Campina Grande - PB" /></label>
            <label className="sebo-wide-field">
              Descrição
              <textarea
                rows={5}
                defaultValue="Livros, discos e raridades selecionadas para leitores e colecionadores."
              />
            </label>
          </div>

          <button type="submit">Salvar informações</button>
        </section>
      </form>
    </StorePage>
  )
}
