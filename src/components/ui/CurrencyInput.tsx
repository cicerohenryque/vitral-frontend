type Props = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
}

const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function format(value: number): string {
  return formatter.format(Number.isFinite(value) ? value : 0)
}

export function CurrencyInput({ id, label, value, onChange, required }: Props) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '')
    const cents = digits === '' ? 0 : Number.parseInt(digits, 10)
    onChange(cents / 100)
  }

  return (
    <label className="vit-input-wrapper">
      <span className="vit-input-label">{label}</span>
      <input
        id={id}
        className="vit-input"
        type="text"
        inputMode="numeric"
        required={required}
        value={format(value)}
        onChange={handleChange}
      />
    </label>
  )
}
