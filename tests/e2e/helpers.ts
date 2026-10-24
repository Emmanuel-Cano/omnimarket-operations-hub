import { expect, type Page } from '@playwright/test'

/** Restablece la base al conjunto de prueba conocido (endpoint de auditoría). */
export async function resetData(page: Page) {
  const r = await page.request.post('/api/test/reset-data')
  expect(r.ok()).toBe(true)
}

/** Simula una sesión autenticada con el proveedor de pruebas (solo existe con E2E_TEST_MODE=true). */
export async function loginAsTestUser(page: Page) {
  const { csrfToken } = await (await page.request.get('/api/auth/csrf')).json()
  const r = await page.request.post('/api/auth/callback/e2e', { form: { csrfToken, callbackUrl: '/dashboard', json: 'true' } })
  expect(r.ok()).toBe(true)
}
