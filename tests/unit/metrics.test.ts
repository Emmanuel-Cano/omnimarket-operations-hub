import { describe, expect, it } from 'vitest'
import { countByStatus, lineMargin, lineTotal, percentChange, summarize } from '@/lib/metrics'
import type { Order } from '@/lib/types'

const o = (p: Partial<Order>): Order => ({ id: 'OM-1', customer: 'Ana Pérez', email: 'a@x.mx', product: 'X', quantity: 1, price: 100, cost: 60, date: '2026-01-01', status: 'Pendiente', ...p })

describe('métricas financieras', () => {
  it('calcula total y margen por línea', () => {
    expect(lineTotal(o({ price: 250, quantity: 3 }))).toBe(750)
    expect(lineMargin(o({ price: 250, cost: 100, quantity: 3 }))).toBe(450)
  })

  it('calcula el ticket promedio', () => {
    const s = summarize([o({ price: 100, quantity: 1 }), o({ price: 300, quantity: 1 })])
    expect(s.revenue).toBe(400)
    expect(s.avgTicket).toBe(200)
  })

  it('calcula margen bruto y porcentaje de margen', () => {
    const s = summarize([o({ price: 200, cost: 150, quantity: 2 })])
    expect(s.margin).toBe(100)
    expect(s.marginPct).toBeCloseTo(25, 5)
  })

  it('no divide entre cero con una lista vacía', () => {
    const s = summarize([])
    expect(s).toMatchObject({ count: 0, revenue: 0, avgTicket: 0, marginPct: 0 })
  })

  it('calcula variación porcentual y devuelve null sin base', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
    expect(percentChange(10, 0)).toBeNull()
  })

  it('cuenta pedidos por estado', () => {
    const c = countByStatus([o({ status: 'Enviado' }), o({ status: 'Enviado' }), o({ status: 'Entregado' })])
    expect(c).toEqual({ Enviado: 2, Entregado: 1 })
  })
})
