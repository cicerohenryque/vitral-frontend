import axe from 'axe-core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GlobalNavigation } from '../components/GlobalNavigation'
import { OffersPage } from '../components/Offers/OffersPage'
import { ofertaService } from '../services/ofertaService'

describe('acessibilidade e viewports', () => {
  it.each([
    ['mobile', 375, 812],
    ['desktop', 1440, 900],
  ])('nao possui violacoes axe na tela de ofertas em viewport %s', async (_name, width, height) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
    vi.spyOn(ofertaService, 'listarAtivas').mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true,
    })
    const { container, findByText } = render(<MemoryRouter><OffersPage /></MemoryRouter>)
    await findByText('Nenhuma oferta ativa')

    const result = await axe.run(container)

    expect(result.violations).toEqual([])
  })

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
