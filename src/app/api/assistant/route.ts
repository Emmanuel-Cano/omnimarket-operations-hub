import { denyAnonymous } from '@/lib/server/orders'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildSnapshot, llmContext, localAnswer } from '@/lib/server/insights'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const body = z.object({ question: z.string().trim().min(2).max(400) })

export async function POST(req: Request) {
  const denied = await denyAnonymous()
  if (denied) return denied
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json({ error: 'Escribe una pregunta.' }, { status: 400 })
  const snap = await buildSnapshot()
  const key = process.env.ANTHROPIC_API_KEY

  if (key) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
          max_tokens: 500,
          system: 'Eres el analista de operaciones de OmniMarket, un e-commerce mexicano. Responde en español, en máximo 4 frases claras, usando SOLO los datos JSON proporcionados. Cita folios (OM-xxxx) y montos en MXN cuando ayude. Si falta información, dilo. Cierra con una acción recomendada si aplica.',
          messages: [{ role: 'user', content: `Datos del negocio (JSON):\n${llmContext(snap)}\n\nPregunta: ${p.data.question}` }],
        }),
        signal: AbortSignal.timeout(20000),
      })
      if (res.ok) {
        const data = await res.json()
        const text = (data.content ?? []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n').trim()
        if (text) return NextResponse.json({ answer: text, source: 'claude' })
      }
    } catch {
      /* cae al análisis local */
    }
  }
  return NextResponse.json({ answer: localAnswer(p.data.question, snap), source: 'local' })
}
