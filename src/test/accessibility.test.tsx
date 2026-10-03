import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GlobalNavigation } from '../components/GlobalNavigation'

describe('acessibilidade da navegação', () => {
  it('mantem o foco dentro do menu e devolve o foco ao botao ao fechar', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><GlobalNavigation /></MemoryRouter>)

    const openButton = screen.getByRole('button', { name: 'Abrir menu' })
    await user.click(openButton)

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const closeButton = screen.getByRole('button', { name: 'Fechar menu' })
    expect(closeButton).toHaveFocus()

    screen.getByRole('link', { name: 'Suporte' }).focus()
    await user.tab()
    expect(closeButton).toHaveFocus()

    await user.click(closeButton)
    expect(openButton).toHaveFocus()
  })
})
