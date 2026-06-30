type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: string
}

export function Pagination({ page, totalPages, onPageChange, label = 'Paginação' }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span aria-live="polite">Página {page + 1} de {totalPages}</span>
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        Próxima
      </button>
    </nav>
  )
}
