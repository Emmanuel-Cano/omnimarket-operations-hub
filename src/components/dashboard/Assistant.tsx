"use client";
import { useState } from 'react'
import { Sparkles, Send, RefreshCw } from 'lucide-react'

const SUGGESTIONS = ['¿Qué pedidos llevan más de 3 días sin avanzar?', '¿Cuál es mi producto más rentable?', '¿Quién es mi mejor cliente?', 'Dame un resumen del día']

export function Assistant() {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [chat, setChat] = useState<{ q: string; a: string; source: string }[]>([])

  const ask = async (question: string) => {
    if (!question.trim() || busy) return
    setBusy(true); setQ('')
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question }) })
      const d = await r.json()
      setChat(c => [{ q: question, a: r.ok ? d.answer : d.error || 'No pude responder.', source: d.source || 'error' }, ...c])
    } catch {
      setChat(c => [{ q: question, a: 'Sin conexión con el servidor.', source: 'error' }, ...c])
    } finally { setBusy(false) }
  }

  return <article className="panel assistant">
    <div className="panel-head"><div><h3><Sparkles/> Asistente de operaciones</h3><p>Pregunta en lenguaje natural sobre tus pedidos, márgenes y clientes.</p></div></div>
    <div className="assistant-chips">{SUGGESTIONS.map(s => <button key={s} disabled={busy} onClick={() => ask(s)}>{s}</button>)}</div>
    <form className="assistant-form" onSubmit={e => { e.preventDefault(); ask(q) }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ej. ¿Qué producto deja más margen?" maxLength={400}/>
      <button type="submit" disabled={busy || !q.trim()} aria-label="Enviar">{busy ? <RefreshCw className="spin"/> : <Send/>}</button>
    </form>
    <div className="assistant-log">{chat.map((m, i) => <div key={i}><b>{m.q}</b><p>{m.a}</p>{m.source === 'claude' && <small>Respuesta generada por Claude</small>}</div>)}</div>
  </article>
}
