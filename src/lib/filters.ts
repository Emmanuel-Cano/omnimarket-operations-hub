import type { Order } from './types'

export type OrderFilters = { q?: string; status?: string; date?: string }

/** Filtra por texto (id, cliente o producto), estado y fecha exacta. */
export function filterOrders(orders: Order[], { q = '', status = 'Todos', date = '' }: OrderFilters): Order[] {
  const needle = q.trim().toLowerCase()
  return orders.filter(
    o => (status === 'Todos' || o.status === status) && (!date || o.date === date) && `${o.id} ${o.customer} ${o.product}`.toLowerCase().includes(needle),
  )
}

export function paginate<T>(items: T[], page: number, size: number) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), pages)
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total: items.length }
}
