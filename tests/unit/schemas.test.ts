import { describe, expect, it } from 'vitest'
import { batchSchema, orderInputSchema, paginationSchema } from '@/lib/schemas'

const valid = { customer: 'Sofía Hernández', email: 'sofia@correo.mx', product: 'Teclado', quantity: 2, price: 1500, cost: 800, date: '2026-10-24', status: 'Pendiente' as const }

describe('esquemas Zod', () => {
  it('acepta un pedido válido', () => {
    expect(orderInputSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza correo inválido y nombre corto', () => {
    const r = orderInputSchema.safeParse({ ...valid, email: 'no-es-correo', customer: 'Al' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.map(i => i.path[0])).toEqual(expect.arrayContaining(['email', 'customer']))
  })

  it('rechaza cantidad menor a 1, decimal o precio no positivo', () => {
    expect(orderInputSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, quantity: 1.5 }).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, price: 0 }).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, cost: -1 }).success).toBe(false)
  })

  it('rechaza estados y fechas fuera de formato', () => {
    expect(orderInputSchema.safeParse({ ...valid, status: 'Cancelado' }).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, date: '24/10/2026' }).success).toBe(false)
  })

  it('aplica valores por defecto y límites a la paginación', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 50 })
    expect(paginationSchema.parse({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10 })
    expect(paginationSchema.safeParse({ page: '0' }).success).toBe(false)
    expect(paginationSchema.safeParse({ limit: '500' }).success).toBe(false)
  })

  it('valida la edición en lote', () => {
    expect(batchSchema.safeParse({ ids: ['OM-1', 'OM-2'], action: 'status', status: 'Enviado' }).success).toBe(true)
    expect(batchSchema.safeParse({ ids: [], action: 'delete' }).success).toBe(false)
    expect(batchSchema.safeParse({ ids: ['OM-1'], action: 'borrar' }).success).toBe(false)
  })
})
