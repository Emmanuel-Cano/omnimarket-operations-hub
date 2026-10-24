import { describe, expect, it } from 'vitest'
import { filterOrders, paginate } from '@/lib/filters'
import { seedOrders } from '@/lib/orders'

describe('lógica de filtrado', () => {
  it('sin filtros devuelve todos los pedidos', () => {
    expect(filterOrders(seedOrders, {})).toHaveLength(seedOrders.length)
  })

  it('busca por id, cliente o producto sin distinguir mayúsculas', () => {
    expect(filterOrders(seedOrders, { q: 'om-1048' })).toHaveLength(1)
    expect(filterOrders(seedOrders, { q: 'SOFÍA' })[0].customer).toContain('Sofía')
    expect(filterOrders(seedOrders, { q: 'monitor' }).every(o => o.product.toLowerCase().includes('monitor'))).toBe(true)
  })

  it('filtra por estado y por fecha exacta', () => {
    const pend = filterOrders(seedOrders, { status: 'Pendiente' })
    expect(pend.length).toBeGreaterThan(0)
    expect(pend.every(o => o.status === 'Pendiente')).toBe(true)
    const day = seedOrders[0].date
    expect(filterOrders(seedOrders, { date: day }).every(o => o.date === day)).toBe(true)
  })

  it('pagina y ajusta páginas fuera de rango', () => {
    const p1 = paginate(seedOrders, 1, 7)
    expect(p1.items).toHaveLength(7)
    expect(p1.pages).toBe(Math.ceil(seedOrders.length / 7))
    expect(paginate(seedOrders, 999, 7).page).toBe(p1.pages)
    expect(paginate([], 1, 7)).toMatchObject({ pages: 1, total: 0, items: [] })
  })
})
