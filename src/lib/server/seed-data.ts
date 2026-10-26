import type { PrismaClient } from '@prisma/client'
import { seedOrders } from './seed-orders'

const map = { Pendiente: 'PENDIENTE', 'En proceso': 'EN_PROCESO', Enviado: 'ENVIADO', Entregado: 'ENTREGADO' } as const

function shifter() {
  const base = new Date(); base.setUTCHours(0, 0, 0, 0)
  const latest = Math.max(...seedOrders.map(o => new Date(`${o.date}T00:00:00Z`).getTime()))
  return (d: string) => new Date(base.getTime() - (latest - new Date(`${d}T00:00:00Z`).getTime()))
}

/** Restablece el conjunto "demo" (24 pedidos OM-1025…OM-1048, el más reciente con fecha de hoy). Los datos de otras cuentas no se tocan. */
export async function resetDatabase(prisma: PrismaClient) {
  const shift = shifter()
  const ownerId = 'demo'
  await prisma.$transaction(async tx => {
    await tx.auditLog.deleteMany({ where: { ownerId } })
    await tx.order.deleteMany({ where: { ownerId } }) // los items caen en cascada
    await tx.customer.deleteMany({ where: { ownerId } })
    await tx.product.deleteMany({ where: { ownerId } })
    for (const o of [...seedOrders].reverse()) {
      const customer = await tx.customer.upsert({ where: { ownerId_email: { ownerId, email: o.email } }, update: {}, create: { name: o.customer, email: o.email, ownerId } })
      const product = await tx.product.upsert({ where: { ownerId_name: { ownerId, name: o.product } }, update: {}, create: { name: o.product, price: o.price, cost: o.cost, ownerId } })
      await tx.order.create({ data: { id: o.id, ownerId, customerId: customer.id, status: map[o.status], date: shift(o.date), items: { create: { productId: product.id, quantity: o.quantity, price: o.price, cost: o.cost } } } })
      await tx.auditLog.create({ data: { orderId: o.id, ownerId, action: 'CREATE', detail: `Pedido importado (${o.product} ×${o.quantity})`, actor: 'seed' } })
    }
  }, { timeout: 30000 })
  return { orders: seedOrders.length }
}

/** Carga datos de ejemplo en la cuenta de un usuario (folios nuevos, únicos en toda la base). */
export async function loadSampleFor(prisma: PrismaClient, ownerId: string) {
  const shift = shifter()
  return prisma.$transaction(async tx => {
    if (await tx.order.count({ where: { ownerId } })) return { orders: 0 }
    const all = await tx.order.findMany({ select: { id: true } })
    let n = all.reduce((m, { id }) => Math.max(m, Number(id.replace('OM-', '')) || 0), 1000)
    for (const o of [...seedOrders].reverse()) {
      const id = `OM-${++n}`
      const customer = await tx.customer.upsert({ where: { ownerId_email: { ownerId, email: o.email } }, update: {}, create: { name: o.customer, email: o.email, ownerId } })
      const product = await tx.product.upsert({ where: { ownerId_name: { ownerId, name: o.product } }, update: {}, create: { name: o.product, price: o.price, cost: o.cost, ownerId } })
      await tx.order.create({ data: { id, ownerId, customerId: customer.id, status: map[o.status], date: shift(o.date), items: { create: { productId: product.id, quantity: o.quantity, price: o.price, cost: o.cost } } } })
      await tx.auditLog.create({ data: { orderId: id, ownerId, action: 'CREATE', detail: `Pedido de ejemplo (${o.product} ×${o.quantity})`, actor: ownerId } })
    }
    return { orders: seedOrders.length }
  }, { timeout: 30000 })
}
