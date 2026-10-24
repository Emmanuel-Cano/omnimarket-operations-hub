import { expect, test } from '@playwright/test'
import { loginAsTestUser, resetData } from './helpers'

test.beforeEach(async ({ page }) => resetData(page))

test('E2E 1 · autenticación: las rutas privadas redirigen al login y la sesión da acceso', async ({ page }) => {
  // Sin sesión: las rutas privadas redirigen al login
  for (const route of ['/dashboard', '/pedidos', '/kanban']) {
    await page.goto(route)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: /Continuar con Google/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continuar con GitHub/ })).toBeVisible()
  }
  // La API privada responde 401, pero los endpoints de auditoría siguen abiertos
  expect((await page.request.get('/api/orders')).status()).toBe(401)
  expect((await page.request.get('/api/test/kanban-status')).status()).toBe(200)

  // Con sesión simulada se accede al dashboard
  await loginAsTestUser(page)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Resumen general' })).toBeVisible()
  await expect(page.getByText('Ingresos totales')).toBeVisible()
})
