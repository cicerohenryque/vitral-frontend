import { expect, test } from '@playwright/test'

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

  test('autentica e conclui favorito, cesta e pedido pela API real', async ({ page }) => {
    await page.goto('/auth')
    await page.getByLabel('Usuário ou E-mail:').fill('cliente.e2e@vitral.test')
    await page.locator('#login-password').fill('senha1234')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/')

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
})
