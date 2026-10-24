import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { fromDb } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await prisma.orderItem.findMany({ include: { order: true } })
  let revenue = 0, margin = 0, units = 0
  const byStatus: Record<string, number> = {}, byDay: Record<string, number> = {}
  const orderIds = new Set<string>()
  for (const i of items) {
    const rev = Number(i.price) * i.quantity
    revenue += rev; margin += (Number(i.price) - Number(i.cost)) * i.quantity; units += i.quantity
    orderIds.add(i.orderId)
    const day = i.order.date.toISOString().slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + rev
  }
  const orders = await prisma.order.groupBy({ by: ['status'], _count: true })
  for (const g of orders) byStatus[fromDb[g.status]] = g._count
  const total = orderIds.size
  return NextResponse.json({
    orders: total, revenue, margin, units,
    avgTicket: total ? revenue / total : 0,
    marginPct: revenue ? (margin / revenue) * 100 : 0,
    byStatus,
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date, total })),
  })
}
