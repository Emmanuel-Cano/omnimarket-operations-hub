import type { Activity, Order, Status } from './types'

export class ApiError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message) }
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...init?.headers }, cache: 'no-store' })
  } catch {
    throw new ApiError('Sin conexión con el servidor.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const fields = Object.fromEntries(((data?.errors ?? []) as { field: string; message: string }[]).map(e => [e.field, e.message]))
    throw new ApiError(data?.error || 'No se pudo completar la operación.', fields)
  }
  return data as T
}

const body = (o: unknown) => JSON.stringify(o)
const input = ({ id: _id, ...rest }: Order) => rest

export const api = {
  loadDemo: () => http<{ ok: true; orders: number }>('/api/demo-data', { method: 'POST' }),
  list: () => http<Order[]>('/api/orders'),
  create: (o: Order) => http<Order>('/api/orders', { method: 'POST', body: body(input(o)) }),
  update: (o: Order) => http<Order>(`/api/orders/${o.id}`, { method: 'PATCH', body: body(input(o)) }),
  setStatus: (id: string, status: Status) => http<Order>(`/api/orders/${id}`, { method: 'PATCH', body: body({ status }) }),
  batchStatus: (ids: string[], status: Status) => http<{ ok: true }>('/api/orders/batch', { method: 'POST', body: body({ ids, action: 'status', status }) }),
  batchDelete: (ids: string[]) => http<{ ok: true }>('/api/orders/batch', { method: 'POST', body: body({ ids, action: 'delete' }) }),
  audit: () => http<Activity[]>('/api/audit'),
}
