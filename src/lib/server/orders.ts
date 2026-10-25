import type { Prisma } from '@prisma/client'
import type { Order, Status } from '@/lib/types'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from './db'

export const toDb = { Pendiente: 'PENDIENTE', 'En proceso': 'EN_PROCESO', Enviado: 'ENVIADO', Entregado: 'ENTREGADO' } as const
export const fromDb: Record<string, Status> = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', ENVIADO: 'Enviado', ENTREGADO: 'Entregado' }

export { orderInputSchema as orderInput } from '@/lib/schemas'
export type { OrderInput } from '@/lib/schemas'

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

/** Quién hace el cambio: el correo de la sesión OAuth. */
export async function getActor() {
  const s = await auth()
  return s?.user?.email ?? s?.user?.name ?? 'sistema'
}

export async function log(tx: Prisma.TransactionClient, orderId: string, action: string, detail: string, actor = 'sistema') {
  await tx.auditLog.create({ data: { orderId, action, detail, actor } })
}

/** Crea/actualiza cliente y producto por clave natural y devuelve sus ids. */
export async function upsertRefs(tx: Prisma.TransactionClient, d: import('@/lib/schemas').OrderInput) {
  const customer = await tx.customer.upsert({ where: { email: d.email }, update: { name: d.customer }, create: { name: d.customer, email: d.email } })
  const product = await tx.product.upsert({ where: { name: d.product }, update: {}, create: { name: d.product, price: d.price, cost: d.cost } })
  return { customer, product }
}

export { prisma }

/** Defensa en profundidad: aunque el middleware ya protege /api/*, cada handler exige sesión. */
export async function denyAnonymous() {
  const s = await auth()
  if (!s?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  return null
}
