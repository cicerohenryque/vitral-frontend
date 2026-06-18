import { Link } from 'react-router-dom'
import { StorePage, StoreStatus } from '../Layout/StorePage'

export function ReleasesPage() {
  return (
    <StorePage title="Lançamentos" subtitle="As novidades que acabaram de chegar ao Vitral.">
      <StoreStatus
        title="A API ainda não possui endpoint para novidades"
        description="Os cards fictícios foram removidos. Quando houver filtro de produtos recentes no backend, esta tela pode listar os itens publicados por data."
        action={<Link to="/busca">Ver acervo real</Link>}
      />
    </StorePage>
  )
}
