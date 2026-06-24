import axe from 'axe-core'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
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

    const result = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })

    expect(result.violations).toEqual([])
  })
})
