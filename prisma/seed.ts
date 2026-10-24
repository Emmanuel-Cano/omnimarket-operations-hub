import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { seedOrders } from '../src/lib/orders'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const map = { Pendiente: 'PENDIENTE', 'En proceso': 'EN_PROCESO', Enviado: 'ENVIADO', Entregado: 'ENTREGADO' } as const

const DAY = 86400000
async function main() {
  const base = new Date(); base.setUTCHours(0, 0, 0, 0)
  const latest = Math.max(...seedOrders.map(o => new Date(`${o.date}T00:00:00Z`).getTime()))
  const shift = (d: string) => new Date(base.getTime() - (latest - new Date(`${d}T00:00:00Z`).getTime()))
  await prisma.auditLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  for (const o of [...seedOrders].reverse()) {
    const customer = await prisma.customer.upsert({ where: { email: o.email }, update: {}, create: { name: o.customer, email: o.email } })
    const product = await prisma.product.upsert({ where: { name: o.product }, update: {}, create: { name: o.product, price: o.price, cost: o.cost } })
    await prisma.order.create({ data: { id: o.id, customerId: customer.id, status: map[o.status], date: shift(o.date), items: { create: { productId: product.id, quantity: o.quantity, price: o.price, cost: o.cost } } } })
    await prisma.auditLog.create({ data: { orderId: o.id, action: 'CREATE', detail: `Pedido importado (${o.product} ×${o.quantity})`, actor: 'seed' } })
  }
  console.log(`Seed OK: ${seedOrders.length} pedidos`)
}
main().finally(() => prisma.$disconnect())
