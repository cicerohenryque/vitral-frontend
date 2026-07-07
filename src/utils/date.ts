export function parseDate(value?: string | null) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const dateOnly = new Date(year, month - 1, day)
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateBR(value?: string | null) {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat('pt-BR').format(date) : null
}

export function formatDateTimeBR(value?: string | null) {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date) : null
}

export function daysSince(value?: string | null, now = new Date()) {
  const date = parseDate(value)
  if (!date) return null
  const diff = now.getTime() - date.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}
