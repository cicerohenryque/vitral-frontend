import { Link } from 'react-router-dom'
import { SearchIcon } from '../Layout/Icons'
import { StorePage } from '../Layout/StorePage'
import './EmptySearchPage.css'

export function EmptySearchPage() {
  return (
    <StorePage
      title="Resultados da pesquisa"
      subtitle="Não encontramos itens para “produto inexistente”."
      searchPlaceholder="Tente outro termo"
    >
      <section className="empty-search">
        <SearchIcon size={58} />
        <h2>Nenhum resultado encontrado</h2>
        <p>Verifique a escrita, use termos mais gerais ou explore as categorias disponíveis no Vitral.</p>
        <div>
          <Link to="/categorias">Explorar categorias</Link>
          <Link to="/">Voltar para o início</Link>
        </div>
        <aside>
          <strong>Sugestões de busca</strong>
          <span>Livros</span>
          <span>Discos</span>
          <span>Clássicos</span>
          <span>Colecionáveis</span>
        </aside>
      </section>
    </StorePage>
  )
}
