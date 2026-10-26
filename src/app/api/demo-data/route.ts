import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { denyAnonymous, getOwner } from '@/lib/server/orders'
import { loadSampleFor } from '@/lib/server/seed-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** POST /api/demo-data — carga pedidos de ejemplo en la cuenta del usuario (solo si aún no tiene pedidos). */
export async function POST() {
  const denied = await denyAnonymous()
  if (denied) return denied
  const r = await loadSampleFor(prisma, await getOwner())
  return NextResponse.json({ ok: true, ...r })
}
