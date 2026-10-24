import { NextResponse } from 'next/server'
import { paginationSchema } from '@/lib/schemas'
import { prisma } from '@/lib/server/db'
import { fromDb, include, serialize } from '@/lib/server/orders'

export const dynamic = 'force-dynamic'

type Totals = { orders: number; units: number; revenue: number; cost: number }
type Day = { date: string; sales: number; margin: number }

/** GET /api/test/analytics?page=1&limit=50 — métricas de ventas + pedidos paginados. */
export async function GET(req: Request) {
  const t0 = performance.now()
  const parsed = paginationSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Parámetros inválidos: page>=1, 1<=limit<=200' }, { status: 400 })
  const { page, limit } = parsed.data

  const [totals, byDay, byStatus, rows, total] = await Promise.all([
    prisma.$queryRaw<Totals[]>`SELECT COUNT(DISTINCT o.id)::int AS orders, COALESCE(SUM(i.quantity),0)::int AS units,
      COALESCE(SUM(i.price*i.quantity),0)::float8 AS revenue, COALESCE(SUM(i.cost*i.quantity),0)::float8 AS cost
      FROM "Order" o JOIN "OrderItem" i ON i."orderId" = o.id`,
    prisma.$queryRaw<Day[]>`SELECT to_char(o.date,'YYYY-MM-DD') AS date, SUM(i.price*i.quantity)::float8 AS sales,
      SUM((i.price-i.cost)*i.quantity)::float8 AS margin FROM "Order" o JOIN "OrderItem" i ON i."orderId" = o.id
      GROUP BY o.date ORDER BY o.date`,
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.findMany({ include, orderBy: [{ date: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
    prisma.order.count(),
  ])

  const t = totals[0] ?? { orders: 0, units: 0, revenue: 0, cost: 0 }
  const margin = t.revenue - t.cost
  const took = Math.round((performance.now() - t0) * 10) / 10
  return NextResponse.json(
    {
      metrics: {
        orders: t.orders, units: t.units, revenue: t.revenue, cost: t.cost, margin,
        marginPct: t.revenue > 0 ? Number(((margin / t.revenue) * 100).toFixed(2)) : 0,
        avgTicket: t.orders ? Number((t.revenue / t.orders).toFixed(2)) : 0,
        byStatus: Object.fromEntries(byStatus.map(g => [fromDb[g.status], g._count])),
        salesByDay: byDay,
      },
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      items: rows.map(serialize),
      meta: { took_ms: took },
    },
    { headers: { 'Server-Timing': `app;dur=${took}`, 'Cache-Control': 'no-store' } },
  )
}
