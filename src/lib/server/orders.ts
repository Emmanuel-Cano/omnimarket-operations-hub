import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import type { Order, Status } from '@/lib/types'
import { STATUSES } from '@/lib/orders'
import { prisma } from './db'

export const toDb = { Pendiente: 'PENDIENTE', 'En proceso': 'EN_PROCESO', Enviado: 'ENVIADO', Entregado: 'ENTREGADO' } as const
export const fromDb: Record<string, Status> = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', ENVIADO: 'Enviado', ENTREGADO: 'Entregado' }

export const orderInput = z.object({
  customer: z.string().trim().min(3, 'Ingresa el nombre completo'),
  email: z.email('Correo no válido'),
  product: z.string().trim().min(2, 'Ingresa un producto'),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  cost: z.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida'),
  status: z.enum(STATUSES as [Status, ...Status[]]),
})
export type OrderInput = z.infer<typeof orderInput>

export const include = { customer: true, items: { include: { product: true } } } satisfies Prisma.OrderInclude
type Row = Prisma.OrderGetPayload<{ include: typeof include }>

export function serialize(o: Row): Order {
  const it = o.items[0]
  return {
    id: o.id,
    customer: o.customer.name,
    email: o.customer.email,
    product: it?.product.name ?? '—',
    quantity: it?.quantity ?? 0,
    price: Number(it?.price ?? 0),
    cost: Number(it?.cost ?? 0),
    date: o.date.toISOString().slice(0, 10),
    status: fromDb[o.status],
  }
}

export async function nextFolio(tx: Prisma.TransactionClient) {
  const all = await tx.order.findMany({ select: { id: true } })
  const max = all.reduce((m, { id }) => Math.max(m, Number(id.replace('OM-', '')) || 0), 1000)
  return `OM-${max + 1}`
}

export async function log(tx: Prisma.TransactionClient, orderId: string, action: string, detail: string, actor = 'demo') {
  await tx.auditLog.create({ data: { orderId, action, detail, actor } })
}

/** Crea/actualiza cliente y producto por clave natural y devuelve sus ids. */
export async function upsertRefs(tx: Prisma.TransactionClient, d: OrderInput) {
  const customer = await tx.customer.upsert({ where: { email: d.email }, update: { name: d.customer }, create: { name: d.customer, email: d.email } })
  const product = await tx.product.upsert({ where: { name: d.product }, update: {}, create: { name: d.product, price: d.price, cost: d.cost } })
  return { customer, product }
}

export { prisma }
