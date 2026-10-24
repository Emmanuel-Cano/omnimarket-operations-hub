import { NextResponse } from 'next/server'
import { z } from 'zod'
import { STATUSES } from '@/lib/orders'
import type { Status } from '@/lib/types'
import { log, prisma, toDb } from '@/lib/server/orders'

const body = z.object({ ids: z.array(z.string()).min(1).max(200), action: z.enum(['status', 'delete']), status: z.enum(STATUSES as [Status, ...Status[]]).optional() })

export async function POST(req: Request) {
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success || (p.data.action === 'status' && !p.data.status)) return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
  const { ids, action, status } = p.data
  await prisma.$transaction(async tx => {
    if (action === 'status') {
      await tx.order.updateMany({ where: { id: { in: ids } }, data: { status: toDb[status!] } })
      for (const id of ids) await log(tx, id, 'STATUS', `Estado (lote) → ${status}`)
    } else {
      await tx.order.deleteMany({ where: { id: { in: ids } } })
      for (const id of ids) await log(tx, id, 'DELETE', 'Pedido eliminado (lote)')
    }
  })
  return NextResponse.json({ ok: true, count: ids.length })
}
