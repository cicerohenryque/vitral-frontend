import { useState } from 'react'
import { StorePage } from '../Layout/StorePage'
import './ListingsPage.css'

const listings = [
  { name: 'Livro clássico', category: 'Livros', price: 'R$ 38,00', status: 'Publicado' },
  { name: 'Disco selecionado', category: 'Discos', price: 'R$ 65,00', status: 'Publicado' },
  { name: 'Coleção especial', category: 'Colecionáveis', price: 'R$ 120,00', status: 'Rascunho' },
]

export function ListingsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <StorePage title="Meus anúncios" subtitle="Cadastre e gerencie os itens do seu acervo.">
      <section className="listings-panel">
        <header>
          <div>
            <h2>Anúncios publicados</h2>
            <p>{listings.length} itens cadastrados</p>
          </div>
          <button type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Fechar formulário' : '+ Novo anúncio'}
          </button>
        </header>

        {showForm && (
          <form className="listing-form" onSubmit={(event) => event.preventDefault()}>
            <label>Nome do item<input placeholder="Ex.: Livro clássico" /></label>
            <label>Categoria<select><option>Livros</option><option>Discos</option><option>Colecionáveis</option></select></label>
            <label>Preço<input placeholder="R$ 0,00" /></label>
            <label>Estado<select><option>Novo</option><option>Muito bom</option><option>Usado</option></select></label>
            <label className="listing-description">Descrição<textarea rows={4} placeholder="Descreva o item e seu estado de conservação" /></label>
            <label className="listing-upload">Imagens<input type="file" multiple /></label>
            <div className="listing-form-actions">
              <button type="button">Salvar rascunho</button>
              <button type="submit">Publicar anúncio</button>
            </div>
          </form>
        )}

        <div className="listing-table">
          <div className="listing-row listing-heading">
            <span>Item</span><span>Categoria</span><span>Preço</span><span>Situação</span><span>Ações</span>
          </div>
          {listings.map((listing) => (
            <article className="listing-row" key={listing.name}>
              <div className="listing-name"><span /><strong>{listing.name}</strong></div>
              <span>{listing.category}</span>
              <strong>{listing.price}</strong>
              <span className={`listing-status ${listing.status === 'Rascunho' ? 'is-draft' : ''}`}>{listing.status}</span>
              <div className="listing-actions">
                <button type="button">Editar</button>
                <button type="button">Excluir</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </StorePage>
  )
}
