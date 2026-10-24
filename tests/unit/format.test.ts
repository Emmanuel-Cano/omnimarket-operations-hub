import { describe, expect, it } from 'vitest'
import { money, shortDate, STATUSES } from '@/lib/orders'

describe('formateadores', () => {
  it('formatea moneda en pesos mexicanos', () => {
    expect(money(1299)).toBe('$1,299.00')
    expect(money(0)).toBe('$0.00')
    expect(money(83571.5)).toBe('$83,571.50')
  })

  it('formatea fechas cortas en español', () => {
    expect(shortDate('2026-10-24')).toMatch(/^24[\s.-]*oct/i)
  })

  it('define el flujo de estados del Kanban en orden', () => {
    expect(STATUSES).toEqual(['Pendiente', 'En proceso', 'Enviado', 'Entregado'])
  })
})
