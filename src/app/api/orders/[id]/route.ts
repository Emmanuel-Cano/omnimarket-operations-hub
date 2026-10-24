import { NextResponse } from 'next/server'
import { include, log, orderInput, prisma, serialize, toDb, upsertRefs } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params
  const o = await prisma.order.findUnique({ where: { id }, include })
  return o ? NextResponse.json(serialize(o)) : NextResponse.json({ error: 'No encontrado' }, { status: 404 })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  const parsed = orderInput.partial().safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.issues.map(i => ({ field: String(i.path[0]), message: i.message })) }, { status: 400 })
  const before = await prisma.order.findUnique({ where: { id }, include })
  if (!before) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const cur = serialize(before)
  const d = { ...cur, ...parsed.data }
  const full = orderInput.safeParse(d)
  if (!full.success) return NextResponse.json({ errors: full.error.issues.map(i => ({ field: String(i.path[0]), message: i.message })) }, { status: 400 })

  const updated = await prisma.$transaction(async tx => {
    const { customer, product } = await upsertRefs(tx, full.data)
    await tx.order.update({ where: { id }, data: { customerId: customer.id, status: toDb[full.data.status], date: new Date(`${full.data.date}T00:00:00Z`) } })
    await tx.orderItem.deleteMany({ where: { orderId: id } })
    await tx.orderItem.create({ data: { orderId: id, productId: product.id, quantity: full.data.quantity, price: full.data.price, cost: full.data.cost } })
    const onlyStatus = Object.keys(parsed.data).length === 1 && parsed.data.status
    if (onlyStatus) await log(tx, id, 'STATUS', `Estado: ${cur.status} → ${full.data.status}`)
    else await log(tx, id, 'UPDATE', `Pedido editado${cur.status !== full.data.status ? ` (estado: ${cur.status} → ${full.data.status})` : ''}`)
    return tx.order.findUniqueOrThrow({ where: { id }, include })
  })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params
  const o = await prisma.order.findUnique({ where: { id }, include })
  if (!o) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  await prisma.$transaction(async tx => {
    await tx.order.delete({ where: { id } })
    await log(tx, id, 'DELETE', `Pedido eliminado (${o.customer.name})`)
  })
  return NextResponse.json({ ok: true })
}
