import { expect, test } from '@playwright/test'
import { loginAsTestUser, resetData } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetData(page)
  await loginAsTestUser(page)
})

test('E2E 2 · creación: un pedido nuevo se refleja en la tabla y persiste', async ({ page }) => {
  await page.goto('/pedidos')
  await expect(page.getByText('24 pedidos')).toBeVisible()

  await page.getByRole('button', { name: /Nuevo pedido/ }).click()
  const form = page.locator('.modal')
  await form.getByPlaceholder('Sofía Hernández').fill('Cliente Playwright')
  await form.getByPlaceholder('sofia@correo.mx').fill('playwright@correo.mx')
  await form.getByPlaceholder('Nombre del producto').fill('Producto E2E')
  await form.getByPlaceholder('0.00').first().fill('1500')
  await form.getByPlaceholder('0.00').last().fill('700')
  await form.getByRole('button', { name: /Guardar pedido/ }).click()

  await expect(page.locator('.toast')).toContainText('creado correctamente')
  await expect(page.getByText('25 pedidos')).toBeVisible()
  const row = page.locator('tbody tr', { hasText: 'Cliente Playwright' })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Producto E2E')

  // Persistencia: tras recargar sigue en la tabla
  await page.reload()
  await expect(page.locator('tbody tr', { hasText: 'Cliente Playwright' })).toBeVisible()
})
