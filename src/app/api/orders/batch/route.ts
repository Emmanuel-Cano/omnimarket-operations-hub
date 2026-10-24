import { NextResponse } from 'next/server'
import { batchSchema } from '@/lib/schemas'
import { getActor, log, prisma, toDb } from '@/lib/server/orders'

export async function POST(req: Request) {
  const actor = await getActor()
  const p = batchSchema.safeParse(await req.json().catch(() => null))
  if (!p.success || (p.data.action === 'status' && !p.data.status)) return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  const { ids, action, status } = p.data
  await prisma.$transaction(async tx => {
    if (action === 'status') {
      await tx.order.updateMany({ where: { id: { in: ids } }, data: { status: toDb[status!] } })
      for (const id of ids) await log(tx, id, 'STATUS', `Estado (lote) → ${status}`, actor)
    } else {
      await tx.order.deleteMany({ where: { id: { in: ids } } })
      for (const id of ids) await log(tx, id, 'DELETE', 'Pedido eliminado (lote)', actor)
    }
  })
  return NextResponse.json({ ok: true, count: ids.length })
}
