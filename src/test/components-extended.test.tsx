import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductCard } from '../components/ProductCard'
import { ProductCarousel } from '../components/ProductCarousel'
import { SideMenu } from '../components/SideMenu'
import { TopBar } from '../components/TopBar'
import {
  UserIcon,
  SearchIcon,
  HeartIcon,
  BackIcon,
  InfoIcon,
  CardIcon,
  MinusCircleIcon,
  CartIcon,
} from '../components/Layout/Icons'
import { useAuthStore } from '../store/authStore'
import { AccountType } from '../types/account'
import { CondicaoProduto } from '../types/produto'

const produto = {
  id: 7,
  seboId: 3,
  categoriaId: 2,
  categoriaNome: 'Romance',
  titulo: 'Livro Teste',
  autor: 'Autor',
  descricao: 'Descrição',
  preco: 25,
  estoque: 2,
  condicao: CondicaoProduto.USADO,
  fotoUrl: 'https://img.test/livro.jpg',
  ativo: true,
}

describe('componentes pequenos e interações', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, account: null, seboId: null })
  })

  it('renderiza a topbar com mensagem e link de ajuda', () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>,
    )

    expect(screen.getByText(/seu sebo virtual/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajuda' })).toHaveAttribute('href', '/ajuda')
  })

  it('mostra card de produto e estado skeleton quando não há produto', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard produto={undefined} />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.querySelector('.product-card.skeleton-card')).toBeInTheDocument()
  })

  it('renderiza card de produto indisponível sem imagem e sem categoria', () => {
    const unavailableProduct = {
      id: 7,
      seboId: 2,
      categoriaId: 1,
      categoriaNome: null,
      titulo: 'Livro sem imagem',
      autor: 'Autor',
      descricao: 'Descrição',
      preco: 15,
      estoque: 0,
      condicao: CondicaoProduto.NOVO,
      fotoUrl: null,
      ativo: false,
    }

    render(
      <MemoryRouter>
        <ProductCard produto={unavailableProduct} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Indisponível')).toBeInTheDocument()
    expect(screen.getByText('Sem imagem')).toBeInTheDocument()
    expect(screen.queryByText('Romance')).not.toBeInTheDocument()
  })

  it('renderiza todos os ícones de layout corretamente', () => {
    const { container } = render(
      <>
        <UserIcon className="icon-user" size={18} />
        <SearchIcon className="icon-search" size={18} />
        <HeartIcon className="icon-heart" size={18} />
        <BackIcon className="icon-back" size={18} />
        <InfoIcon className="icon-info" size={18} />
        <CardIcon className="icon-card" size={18} />
        <MinusCircleIcon className="icon-minus" size={18} />
        <CartIcon className="icon-cart" size={18} />
      </>,
    )

    expect(container.querySelector('.icon-user')).toBeInTheDocument()
    expect(container.querySelector('.icon-search')).toBeInTheDocument()
    expect(container.querySelector('.icon-heart')).toBeInTheDocument()
    expect(container.querySelector('.icon-back')).toBeInTheDocument()
    expect(container.querySelector('.icon-info')).toBeInTheDocument()
    expect(container.querySelector('.icon-card')).toBeInTheDocument()
    expect(container.querySelector('.icon-minus')).toBeInTheDocument()
    expect(container.querySelector('.icon-cart')).toBeInTheDocument()
  })

  it('renderiza carousel com produto, navegação e vazio personalizado', async () => {
    const scrollBy = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', { configurable: true, value: scrollBy })

    const { rerender } = render(
      <MemoryRouter>
        <ProductCarousel title="Vitrine" produtos={[produto]} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Vitrine' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(scrollBy).toHaveBeenCalledTimes(2)

    rerender(
      <MemoryRouter>
        <ProductCarousel title="Vitrine" produtos={[]} emptyMessage="Sem produtos" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Sem produtos')).toBeInTheDocument()
  })

  it('renderiza menu lateral para visitante, usuário e sebo', () => {
    const close = vi.fn()
    const visitorRender = render(
      <MemoryRouter>
        <SideMenu onClose={close} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    visitorRender.unmount()

    act(() => {
      useAuthStore.setState({ token: 'jwt', account: { id: 1, name: 'Rute', email: 'rute@teste.com', type: AccountType.USUARIO }, seboId: null })
    })
    const userRender = render(
      <MemoryRouter>
        <SideMenu onClose={close} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Meu Perfil' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Carrinho' })).toBeInTheDocument()
    userRender.unmount()

    act(() => {
      useAuthStore.setState({ token: 'jwt', account: { id: 2, name: 'Sebo', email: 'sebo@teste.com', type: AccountType.SEBO }, seboId: 3 })
    })
    render(
      <MemoryRouter>
        <SideMenu onClose={close} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Meu Sebo' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Carrinho' })).not.toBeInTheDocument()
  })
})
