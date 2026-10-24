import { prisma } from './db'
import { fromDb } from './orders'

const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export async function buildSnapshot() {
  const orders = await prisma.order.findMany({ include: { customer: true, items: { include: { product: true } } } })
  const today = new Date()
  const rows = orders.map(o => {
    const it = o.items[0]
    const total = it ? Number(it.price) * it.quantity : 0
    const margin = it ? (Number(it.price) - Number(it.cost)) * it.quantity : 0
    const ageDays = Math.floor((today.getTime() - o.date.getTime()) / 86400000)
    return { id: o.id, customer: o.customer.name, product: it?.product.name ?? '—', qty: it?.quantity ?? 0, total, margin, status: fromDb[o.status], date: o.date.toISOString().slice(0, 10), ageDays }
  })
  const revenue = rows.reduce((a, r) => a + r.total, 0)
  const margin = rows.reduce((a, r) => a + r.margin, 0)
  const byStatus: Record<string, number> = {}
  const byProduct: Record<string, { units: number; revenue: number; margin: number }> = {}
  const byCustomer: Record<string, number> = {}
  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    const p = (byProduct[r.product] ??= { units: 0, revenue: 0, margin: 0 })
    p.units += r.qty; p.revenue += r.total; p.margin += r.margin
    byCustomer[r.customer] = (byCustomer[r.customer] ?? 0) + r.total
  }
  const stalled = rows.filter(r => (r.status === 'Pendiente' || r.status === 'En proceso') && r.ageDays >= 3).sort((a, b) => b.ageDays - a.ageDays)
  const products = Object.entries(byProduct).map(([name, v]) => ({ name, ...v, marginPct: v.revenue ? (v.margin / v.revenue) * 100 : 0 }))
  const customers = Object.entries(byCustomer).sort((a, b) => b[1] - a[1])
  return { rows, revenue, margin, marginPct: revenue ? (margin / revenue) * 100 : 0, byStatus, products, customers, stalled }
}
type Snap = Awaited<ReturnType<typeof buildSnapshot>>

/** Respuestas locales (sin LLM) para que la demo funcione aunque no haya API key. */
export function localAnswer(q: string, s: Snap): string {
  const t = q.toLowerCase()
  const topRev = [...s.products].sort((a, b) => b.revenue - a.revenue)[0]
  const topMargin = [...s.products].sort((a, b) => b.marginPct - a.marginPct)[0]
  if (/(atrasad|retras|pendient|estancad|más de|tarde)/.test(t)) {
    if (!s.stalled.length) return 'No hay pedidos pendientes o en proceso con más de 3 días. Operación al corriente.'
    return `Hay ${s.stalled.length} pedidos detenidos 3+ días. Los más antiguos: ${s.stalled.slice(0, 5).map(r => `${r.id} (${r.customer}, ${r.ageDays} días, ${r.status})`).join('; ')}.`
  }
  if (/(margen|rentab|ganancia|utilidad)/.test(t))
    return `Margen total: ${money(s.margin)} (${s.marginPct.toFixed(1)}% de ${money(s.revenue)}). Producto más rentable: ${topMargin.name} con ${topMargin.marginPct.toFixed(1)}% de margen.`
  if (/(producto|vend|top|mejor)/.test(t) && !/cliente/.test(t))
    return `Producto con más ingresos: ${topRev.name} (${money(topRev.revenue)}, ${topRev.units} piezas). Más rentable por margen: ${topMargin.name} (${topMargin.marginPct.toFixed(1)}%).`
  if (/(cliente|comprador)/.test(t)) {
    const [name, total] = s.customers[0]
    return `Cliente principal: ${name} con ${money(total)}. Siguientes: ${s.customers.slice(1, 4).map(([n, v]) => `${n} (${money(v)})`).join(', ')}.`
  }
  return `Resumen: ${s.rows.length} pedidos, ${money(s.revenue)} en ventas y ${money(s.margin)} de margen (${s.marginPct.toFixed(1)}%). Por estado: ${Object.entries(s.byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}. ${s.stalled.length ? `Atención: ${s.stalled.length} pedidos llevan 3+ días sin avanzar.` : 'Sin pedidos detenidos.'}`
}

export function llmContext(s: Snap) {
  return JSON.stringify({
    hoy: new Date().toISOString().slice(0, 10),
    ventas: s.revenue, margen: s.margin, margenPct: Number(s.marginPct.toFixed(1)), porEstado: s.byStatus,
    productos: s.products, topClientes: s.customers.slice(0, 8), detenidos3dias: s.stalled.slice(0, 15),
    pedidos: s.rows.slice(0, 60),
  })
}
