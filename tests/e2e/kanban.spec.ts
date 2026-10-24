import { expect, test } from '@playwright/test'
import { loginAsTestUser, resetData } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetData(page)
  await loginAsTestUser(page)
})

test('E2E 3 · drag & drop: la tarjeta cambia de columna y el estado persiste', async ({ page }) => {
  await page.goto('/kanban')
  const card = page.locator('.kanban-card', { hasText: 'OM-1048' })
  const pending = page.locator('.kanban-column', { hasText: 'Pendiente' }).first()
  const target = page.locator('.kanban-column').filter({ has: page.locator('header strong', { hasText: /^En proceso$/ }) })
  await expect(pending.locator('.kanban-card', { hasText: 'OM-1048' })).toBeVisible()

  const handle = await card.locator('.drag-handle').boundingBox()
  const drop = await target.boundingBox()
  if (!handle || !drop) throw new Error('No se encontraron los elementos del tablero')
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
  await page.mouse.down()
  await page.mouse.move(handle.x + 20, handle.y + 20, { steps: 5 })
  await page.mouse.move(drop.x + drop.width / 2, drop.y + 120, { steps: 15 })
  await page.mouse.up()

  // Toast de confirmación y cambio de columna en la interfaz
  await expect(page.locator('.toast')).toContainText('OM-1048 movido a “En proceso”')
  await expect(target.locator('.kanban-card', { hasText: 'OM-1048' })).toBeVisible()

  // Persistencia verificada con el endpoint de auditoría
  await expect.poll(async () => (await (await page.request.get('/api/test/kanban-status?id=OM-1048')).json()).status).toBe('En proceso')
})
