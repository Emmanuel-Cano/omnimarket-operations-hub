import { NextResponse } from 'next/server'
import { include, log, nextFolio, orderInput, prisma, serialize, toDb, upsertRefs } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.order.findMany({ include, orderBy: [{ date: 'desc' }, { id: 'desc' }] })
  return NextResponse.json(rows.map(serialize))
}

export async function POST(req: Request) {
  const parsed = orderInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.issues.map(i => ({ field: String(i.path[0]), message: i.message })) }, { status: 400 })
  const d = parsed.data
  const created = await prisma.$transaction(async tx => {
    const { customer, product } = await upsertRefs(tx, d)
    const id = await nextFolio(tx)
    await tx.order.create({ data: { id, customerId: customer.id, status: toDb[d.status], date: new Date(`${d.date}T00:00:00Z`), items: { create: { productId: product.id, quantity: d.quantity, price: d.price, cost: d.cost } } } })
    await log(tx, id, 'CREATE', `Pedido creado para ${d.customer} (${d.product} ×${d.quantity})`)
    return tx.order.findUniqueOrThrow({ where: { id }, include })
  })
  return NextResponse.json(serialize(created), { status: 201 })
}
