import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button className={`vit-btn vit-btn-${variant} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  )
}
