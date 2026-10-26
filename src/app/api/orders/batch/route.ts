import { NextResponse } from 'next/server'
import { batchSchema } from '@/lib/schemas'
import { getActor, log, prisma, toDb, denyAnonymous, getOwner } from '@/lib/server/orders'

export async function POST(req: Request) {
  const denied = await denyAnonymous()
  if (denied) return denied
  const actor = await getActor()
  const owner = await getOwner()
  const p = batchSchema.safeParse(await req.json().catch(() => null))
  if (!p.success || (p.data.action === 'status' && !p.data.status)) return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  const { ids, action, status } = p.data
  await prisma.$transaction(async tx => {
    if (action === 'status') {
      await tx.order.updateMany({ where: { id: { in: ids }, ownerId: owner }, data: { status: toDb[status!] } })
      for (const id of ids) await log(tx, id, 'STATUS', `Estado (lote) → ${status}`, actor, owner)
    } else {
      await tx.order.deleteMany({ where: { id: { in: ids }, ownerId: owner } })
      for (const id of ids) await log(tx, id, 'DELETE', 'Pedido eliminado (lote)', actor, owner)
    }
  })
  return NextResponse.json({ ok: true, count: ids.length })
}
