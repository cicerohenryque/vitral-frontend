import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { MeuSeboPage } from '../pages/MeuSeboPage'
import { pedidoService } from '../services/pedidoService'
import { seboService } from '../services/seboService'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'

describe('mascara de CNPJ no cadastro do sebo', () => {
  it('exibe o CNPJ completo e corretamente mascarado ao reabrir o perfil de um sebo ja cadastrado', async () => {
    const seboAccount = { id: 1, name: 'Sebo', username: 'sebo', email: 'sebo@teste.com', type: AccountType.SEBO }
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: 3 })
    vi.spyOn(seboService, 'buscarMeu').mockResolvedValue({
      id: 3, accountId: 1, nome: 'Sebo', email: 'sebo@teste.com',
      cnpj: '51601902000114', descricao: null, telefone: null, fotoUrl: null,
    })
    vi.spyOn(pedidoService, 'buscarFaturamentoMensal').mockResolvedValue([])

    render(<MemoryRouter><MeuSeboPage /></MemoryRouter>)

    expect(await screen.findByLabelText('CNPJ')).toHaveValue('51.601.902/0001-14')
  })

  it('mascara o CNPJ corretamente enquanto o usuario digita todos os 14 digitos', async () => {
    const seboAccount = { id: 2, name: 'Sebo', username: 'sebo', email: 'sebo2@teste.com', type: AccountType.SEBO }
    useAuthStore.setState({ token: 'jwt', account: seboAccount, seboId: null })
    vi.spyOn(seboService, 'buscarMeu').mockRejectedValue(new Error('Sebo nao encontrado'))
    vi.spyOn(pedidoService, 'buscarFaturamentoMensal').mockResolvedValue([])

    render(<MemoryRouter><MeuSeboPage /></MemoryRouter>)
    expect(await screen.findByText('Cadastrar perfil do sebo')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('CNPJ'), '11222333000181')

    expect(screen.getByLabelText('CNPJ')).toHaveValue('11.222.333/0001-81')
  })
})
