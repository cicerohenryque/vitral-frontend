export function normalizeIsbn(value: string) {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

export function isValidIsbn(value: string) {
  const isbn = normalizeIsbn(value)
  if (/^\d{13}$/.test(isbn)) {
    const sum = isbn.slice(0, 12).split('').reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)
    return (10 - (sum % 10)) % 10 === Number(isbn[12])
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = isbn.split('').reduce((total, digit, index) => total + (digit === 'X' ? 10 : Number(digit)) * (10 - index), 0)
    return sum % 11 === 0
  }
  return false
}
