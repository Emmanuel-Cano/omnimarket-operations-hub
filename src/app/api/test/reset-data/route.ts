import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { resetDatabase } from '@/lib/server/seed-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** POST /api/test/reset-data — restablece la base al conjunto de prueba conocido (24 pedidos OM-1025…OM-1048). */
export async function POST() {
  const t0 = performance.now()
  const { orders } = await resetDatabase(prisma)
  return NextResponse.json({ ok: true, orders, took_ms: Math.round(performance.now() - t0) })
}
