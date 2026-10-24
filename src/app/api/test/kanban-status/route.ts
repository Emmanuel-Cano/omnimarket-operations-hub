import { NextResponse } from 'next/server'
import { STATUSES } from '@/lib/orders'
import { prisma } from '@/lib/server/db'
import { fromDb } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

/** GET /api/test/kanban-status?id=OM-1048 — estado actual de un pedido (y su columna) tras un drag & drop.
 *  Sin `id` devuelve el conteo por columna. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    const groups = await prisma.order.groupBy({ by: ['status'], _count: true })
    const counts = Object.fromEntries(STATUSES.map(s => [s, 0]))
    for (const g of groups) counts[fromDb[g.status]] = g._count
    return NextResponse.json({ columns: STATUSES, counts }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const o = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true, updatedAt: true } })
  if (!o) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  const status = fromDb[o.status]
  return NextResponse.json({ id: o.id, status, column: STATUSES.indexOf(status), updatedAt: o.updatedAt.toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
}
