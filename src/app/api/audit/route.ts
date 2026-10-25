import { denyAnonymous } from '@/lib/server/orders'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const denied = await denyAnonymous()
  if (denied) return denied
  const orderId = new URL(req.url).searchParams.get('orderId') ?? undefined
  const rows = await prisma.auditLog.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json(rows.map(r => ({ id: r.id, orderId: r.orderId, action: r.action, detail: r.detail, actor: r.actor, createdAt: r.createdAt.toISOString() })))
}
