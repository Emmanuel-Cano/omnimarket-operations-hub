import type { Order } from './types'

export const lineTotal = (o: Pick<Order, 'price' | 'quantity'>) => o.price * o.quantity
export const lineCost = (o: Pick<Order, 'cost' | 'quantity'>) => o.cost * o.quantity
export const lineMargin = (o: Pick<Order, 'price' | 'cost' | 'quantity'>) => (o.price - o.cost) * o.quantity

export type Summary = { count: number; units: number; revenue: number; cost: number; margin: number; marginPct: number; avgTicket: number }

/** Métricas financieras de un conjunto de pedidos (ticket promedio y márgenes). */
export function summarize(orders: Order[]): Summary {
  const revenue = orders.reduce((a, o) => a + lineTotal(o), 0)
  const cost = orders.reduce((a, o) => a + lineCost(o), 0)
  const units = orders.reduce((a, o) => a + o.quantity, 0)
  const margin = revenue - cost
  return {
    count: orders.length, units, revenue, cost, margin,
    marginPct: revenue > 0 ? (margin / revenue) * 100 : 0,
    avgTicket: orders.length ? revenue / orders.length : 0,
  }
}

/** Variación porcentual contra el periodo anterior; null si no hay base de comparación. */
export function percentChange(current: number, previous: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null
}

export function countByStatus(orders: Order[]) {
  return orders.reduce<Record<string, number>>((acc, o) => ((acc[o.status] = (acc[o.status] ?? 0) + 1), acc), {})
}
