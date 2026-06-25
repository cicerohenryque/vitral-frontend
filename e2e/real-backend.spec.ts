import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/auth')
  await page.getByLabel('Usuário ou E-mail:').fill(email)
  await page.locator('#login-password').fill('senha1234')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/')
}

test.describe.serial('frontend integrado ao backend real', () => {
  test('consulta catalogo, categoria e detalhes sem mocks', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Produtos disponíveis' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Livro E2E Integrado/ }).first()).toBeVisible()

    await page.goto('/categorias')
    await page.getByRole('button', { name: /Romance E2E/ }).click()
    await expect(page.getByRole('link', { name: /Livro E2E Integrado/ })).toBeVisible()

    await page.goto('/produto/1')
    await expect(page.getByRole('heading', { name: 'Livro E2E Integrado' })).toBeVisible()
    await expect(page.getByText('Autora E2E')).toBeVisible()
    await expect(page.getByText('Sebo E2E')).toBeVisible()
  })

  test('busca produtos, aplica filtros e alterna para sebos', async ({ page }) => {
    await page.goto('/busca')
    await page.getByLabel('Pesquisar produtos ou sebos').fill('Livro E2E')
    await page.locator('.busca-search-bar').getByRole('button', { name: 'Buscar' }).click()

    await expect(page.getByText('Resultados para: "Livro E2E"')).toBeVisible()
    await expect(page.getByRole('link', { name: /Livro E2E Integrado/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Segundo Livro E2E/ })).toBeVisible()

    await page.getByLabel('Condição').selectOption('USADO')
    await page.getByLabel('Preço máx. (R$)').fill('43')
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByRole('tab', { name: 'Produtos (1)' })).toBeVisible()
    await expect(page.locator('.busca-grid .product-card-real', { hasText: 'Livro E2E Integrado' })).toBeVisible()
    await expect(page.locator('.busca-grid .product-card-real', { hasText: 'Segundo Livro E2E' })).toHaveCount(0)

    await page.getByRole('tab', { name: /Sebos/ }).click()
    await expect(page).toHaveURL(/tab=sebos/)
    const pageSearch = page.getByLabel('Pesquisar produtos ou sebos')
    await pageSearch.fill('Sebo E2E')
    await expect(pageSearch).toHaveValue('Sebo E2E')
    await page.locator('.busca-search-bar').getByRole('button', { name: 'Buscar' }).click()
    await expect(page).toHaveURL(/q=Sebo\+E2E|q=Sebo%20E2E/)
    await expect(page.getByRole('link', { name: /Sebo E2E/ })).toBeVisible()
    await page.getByLabel('Cidade').fill('Fortaleza')
    await page.getByLabel('Estado (UF)').fill('CE')
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByRole('link', { name: /Sebo E2E/ })).toBeVisible()
  })

  test('autentica e conclui favorito, cesta e pedido pela API real', async ({ page }) => {
    await login(page, 'cliente.e2e@vitral.test')

    await page.goto('/produto/1')
    await page.getByRole('button', { name: 'Favoritar' }).click()
    await expect(page.getByRole('status')).toContainText('favorit')
    await page.getByRole('button', { name: 'Adicionar à cesta' }).click()
    await expect(page.getByRole('status')).toContainText('cesta')

    await page.goto('/favoritos')
    await expect(page.getByRole('heading', { name: 'Livro E2E Integrado' })).toBeVisible()

    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Livro E2E Integrado' })).toBeVisible()
    await page.getByRole('spinbutton', { name: 'Qtd.' }).fill('2')
    await expect(page.getByText('2 itens na cesta')).toBeVisible()

    await page.goto('/confirmar-pedido')
    await page.getByRole('button', { name: 'Confirmar pedido' }).click()
    await expect(page.getByRole('heading', { name: /Pedido #\d+ enviado/ })).toBeVisible()

    await page.goto('/reservas')
    await page.getByRole('button', { name: 'Cancelar pedido' }).click()
    await expect(page.getByText('Nenhuma reserva em aberto')).toBeVisible()
  })

  test('cliente confirma pedido e sebo confirma a venda', async ({ page }) => {
    await login(page, 'cliente.e2e@vitral.test')

    await page.goto('/produto/2')
    await page.getByRole('button', { name: 'Adicionar à cesta' }).click()
    await expect(page.getByRole('status')).toContainText('cesta')

    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Segundo Livro E2E' })).toBeVisible()
    await expect(page.getByText('1 item na cesta')).toBeVisible()

    await page.goto('/confirmar-pedido')
    await page.getByRole('button', { name: 'Confirmar pedido' }).click()
    const confirmation = page.getByRole('heading', { name: /Pedido #\d+ enviado/ })
    await expect(confirmation).toBeVisible()
    const heading = await confirmation.textContent()
    const orderId = heading?.match(/#(\d+)/)?.[1]
    expect(orderId).toBeTruthy()

    await login(page, 'sebo.e2e@vitral.test')

    await page.goto('/vendas')
    const orderCard = page.locator('article.store-order-card').filter({ hasText: `Pedido #${orderId}` })
    await expect(orderCard).toContainText('Aguardando confirmação')
    await orderCard.getByRole('link', { name: 'Responder pedido' }).click()

    await expect(page.getByRole('heading', { name: `Pedido #${orderId}` })).toBeVisible()
    await page.getByRole('button', { name: 'Confirmar venda' }).click()
    await expect(page.getByRole('status')).toHaveText('Pedido confirmado com sucesso.')
    await expect(page.getByRole('link', { name: 'Ver histórico de vendas' })).toBeVisible()

    await page.goto('/vendas/historico')
    await expect(page.locator('article.store-order-card').filter({ hasText: `Pedido #${orderId}` })).toContainText('Confirmado')
  })
})
