import { act, render } from '@testing-library/react'
import axe from 'axe-core'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AccountType, type Account } from '../types/account'

type AuditRoute = {
  name: string
  path: string
  role?: Account['type']
  seboId?: number
}

const routes: AuditRoute[] = [
  { name: 'home', path: '/' },
  { name: 'autenticação', path: '/auth' },
  { name: 'confirmação de e-mail', path: '/auth/confirmar?token=teste' },
  { name: 'recuperação de senha', path: '/auth/recuperar-senha' },
  { name: 'redefinição de senha', path: '/auth/redefinir-senha?token=teste' },
  { name: 'reenvio de confirmação', path: '/auth/reenviar-confirmacao' },
  { name: 'busca', path: '/busca?q=livro' },
  { name: 'perfil', path: '/painel/perfil', role: AccountType.USUARIO },
  { name: 'perfil do sebo', path: '/painel/sebo', role: AccountType.SEBO, seboId: 3 },
  { name: 'produtos do sebo', path: '/painel/produtos', role: AccountType.SEBO, seboId: 3 },
  { name: 'ofertas do sebo', path: '/painel/ofertas', role: AccountType.SEBO, seboId: 3 },
  { name: 'documentos do sebo', path: '/painel/sebo/documentos', role: AccountType.SEBO, seboId: 3 },
  { name: 'administração', path: '/admin', role: AccountType.ADMIN },
  { name: 'verificação administrativa de sebos', path: '/admin/sebos', role: AccountType.ADMIN },
  { name: 'exclusão de conta', path: '/conta/excluir', role: AccountType.USUARIO },
  { name: 'carrinho', path: '/carrinho', role: AccountType.USUARIO },
  { name: 'confirmação de pedido', path: '/confirmar-pedido', role: AccountType.USUARIO },
  { name: 'categorias', path: '/categorias' },
  { name: 'favoritos', path: '/favoritos', role: AccountType.USUARIO },
  { name: 'recomendações', path: '/recomendacoes', role: AccountType.USUARIO },
  { name: 'histórico', path: '/historico', role: AccountType.USUARIO },
  { name: 'mensagens', path: '/mensagens', role: AccountType.USUARIO },
  { name: 'ofertas', path: '/ofertas' },
  { name: 'produto', path: '/produto/1' },
  { name: 'reservas', path: '/reservas', role: AccountType.USUARIO },
  { name: 'compras recebidas', path: '/vendas', role: AccountType.SEBO, seboId: 3 },
  { name: 'histórico de vendas', path: '/vendas/historico', role: AccountType.SEBO, seboId: 3 },
  { name: 'confirmação de venda', path: '/vendas/1/confirmar', role: AccountType.SEBO, seboId: 3 },
  { name: 'perfil público do sebo', path: '/vendedor/3' },
  { name: 'lançamentos', path: '/lancamentos' },
  { name: 'clássicos', path: '/classicos' },
  { name: 'suporte', path: '/suporte', role: AccountType.USUARIO },
  { name: 'ajuda', path: '/ajuda' },
  { name: 'página não encontrada', path: '/rota-inexistente' },
]

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
]

const nativeGetComputedStyle = window.getComputedStyle.bind(window)

function authenticate(role?: Account['type'], seboId?: number) {
  const account = role ? { id: 1, name: 'Conta de teste', username: 'teste', email: 'teste@vitral.com', type: role } : null
  useAuthStore.setState({ token: role ? 'token-de-teste' : null, account, seboId: seboId ?? null, sessionMessage: null })
}

describe('auditoria axe de todas as telas', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => ({ measureText: () => ({ width: 0 }) }),
    })
    // O JSDOM não implementa estilos de pseudo-elementos; usar o estilo do
    // elemento permite que o axe execute a regra de contraste sem omiti-la.
    window.getComputedStyle = ((element: Element) => nativeGetComputedStyle(element)) as typeof window.getComputedStyle
  })

  afterAll(() => {
    window.getComputedStyle = nativeGetComputedStyle
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it.each(viewports.flatMap((viewport) => routes.map((route) => ({ viewport, route }))))(
    '$route.name em $viewport.name não possui violações automáticas',
    async ({ viewport, route }) => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: viewport.width })
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewport.height })
      window.history.replaceState({}, '', route.path)
      authenticate(route.role, route.seboId)

      const unavailable = Promise.reject(new Error('Serviço indisponível durante a auditoria'))
      unavailable.catch(() => undefined)
      vi.spyOn(api, 'get').mockReturnValue(unavailable)

      const { container } = render(<App />)
      await act(async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 0))
      })

      const result = await axe.run(container)
      expect(result.violations, result.violations.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([])
    },
    10_000,
  )
})
