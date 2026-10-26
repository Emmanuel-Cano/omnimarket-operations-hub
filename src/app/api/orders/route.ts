import { NextResponse } from 'next/server'
import { getActor, include, log, nextFolio, orderInput, prisma, serialize, toDb, upsertRefs, denyAnonymous, getOwner } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await denyAnonymous()
  if (denied) return denied
  const rows = await prisma.order.findMany({ where: { ownerId: await getOwner() }, include, orderBy: [{ date: 'desc' }, { id: 'desc' }] })
  return NextResponse.json(rows.map(serialize))
}

export async function POST(req: Request) {
  const denied = await denyAnonymous()
  if (denied) return denied
  const actor = await getActor()
  const owner = await getOwner()
  const parsed = orderInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.issues.map(i => ({ field: String(i.path[0]), message: i.message })) }, { status: 400 })
  const d = parsed.data
  const created = await prisma.$transaction(async tx => {
    const { customer, product } = await upsertRefs(tx, d, owner)
    const id = await nextFolio(tx)
    await tx.order.create({ data: { id, ownerId: owner, customerId: customer.id, status: toDb[d.status], date: new Date(`${d.date}T00:00:00Z`), items: { create: { productId: product.id, quantity: d.quantity, price: d.price, cost: d.cost } } } })
    await log(tx, id, 'CREATE', `Pedido creado para ${d.customer} (${d.product} ×${d.quantity})`, actor, owner)
    return tx.order.findUniqueOrThrow({ where: { id }, include })
  })
  return NextResponse.json(serialize(created), { status: 201 })
}
