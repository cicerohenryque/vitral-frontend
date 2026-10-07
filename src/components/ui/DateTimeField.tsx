import './DateTimeField.css'

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export function DateTimeField({ id, label, value, onChange }: Props) {
  const [datePart = '', timePart = ''] = value ? value.split('T') : []
  const [hour = '', minute = ''] = timePart ? timePart.split(':') : []

  function compose(nextDate: string, nextHour: string, nextMinute: string) {
    if (!nextDate) {
      onChange('')
      return
    }
    const h = (nextHour || '00').padStart(2, '0')
    const m = (nextMinute || '00').padStart(2, '0')
    onChange(`${nextDate}T${h}:${m}`)
  }

  return (
    <div className="vit-input-wrapper">
      <label className="vit-input-label" htmlFor={id}>{label}</label>
      <div className="vit-datetime">
        <input
          id={id}
          className="vit-input vit-datetime-date"
          type="date"
          value={datePart}
          onChange={(event) => compose(event.target.value, hour, minute)}
        />
        <select
          className="vit-input vit-datetime-part"
          aria-label={`Hora de ${label.toLowerCase()}`}
          value={hour || '00'}
          disabled={!datePart}
          onChange={(event) => compose(datePart, event.target.value, minute)}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="vit-datetime-sep" aria-hidden="true">:</span>
        <select
          className="vit-input vit-datetime-part"
          aria-label={`Minuto de ${label.toLowerCase()}`}
          value={minute || '00'}
          disabled={!datePart}
          onChange={(event) => compose(datePart, hour, event.target.value)}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
