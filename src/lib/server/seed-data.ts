import type { PrismaClient } from '@prisma/client'
import { seedOrders } from './seed-orders'

const map = { Pendiente: 'PENDIENTE', 'En proceso': 'EN_PROCESO', Enviado: 'ENVIADO', Entregado: 'ENTREGADO' } as const

/** Deja la base en un conjunto de prueba conocido: 24 pedidos OM-1025…OM-1048, el más reciente con fecha de hoy. */
export async function resetDatabase(prisma: PrismaClient) {
  const base = new Date(); base.setUTCHours(0, 0, 0, 0)
  const latest = Math.max(...seedOrders.map(o => new Date(`${o.date}T00:00:00Z`).getTime()))
  const shift = (d: string) => new Date(base.getTime() - (latest - new Date(`${d}T00:00:00Z`).getTime()))

  await prisma.$transaction(async tx => {
    await tx.auditLog.deleteMany()
    await tx.orderItem.deleteMany()
    await tx.order.deleteMany()
    await tx.customer.deleteMany()
    await tx.product.deleteMany()
    for (const o of [...seedOrders].reverse()) {
      const customer = await tx.customer.upsert({ where: { email: o.email }, update: {}, create: { name: o.customer, email: o.email } })
      const product = await tx.product.upsert({ where: { name: o.product }, update: {}, create: { name: o.product, price: o.price, cost: o.cost } })
      await tx.order.create({ data: { id: o.id, customerId: customer.id, status: map[o.status], date: shift(o.date), items: { create: { productId: product.id, quantity: o.quantity, price: o.price, cost: o.cost } } } })
      await tx.auditLog.create({ data: { orderId: o.id, action: 'CREATE', detail: `Pedido importado (${o.product} ×${o.quantity})`, actor: 'seed' } })
    }
  }, { timeout: 30000 })
  return { orders: seedOrders.length }
}
