import type { InputHTMLAttributes } from 'react'
import './Input.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function Input({ label, id, className, ...rest }: Props) {
  return (
    <label className="vit-input-wrapper" htmlFor={id}>
      {label ? <span className="vit-input-label">{label}</span> : null}
      <input id={id} className={`vit-input ${className ?? ''}`} {...rest} />
    </label>
  )
}
