"use client";
import { Activity as Pulse, Pencil, Plus, Trash2, ArrowRight } from 'lucide-react'
import type { Activity } from '@/lib/types'
import { LinesSkeleton } from '@/components/ui/skeletons'

const ICON = { CREATE: Plus, UPDATE: Pencil, STATUS: ArrowRight, DELETE: Trash2 }
const ago = (iso: string) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

export function ActivityFeed({ activity, loading = false }: { activity: Activity[]; loading?: boolean }) {
  return <article className="panel activity">
    <div className="panel-head"><div><h3><Pulse/> Actividad reciente</h3><p>Historial de auditoría en vivo desde la base de datos.</p></div></div>
    {loading ? <div style={{marginTop:18}}><LinesSkeleton lines={5}/></div> : <ul>{activity.slice(0, 8).map(a => { const I = ICON[a.action]; return <li key={a.id}><span className={`act-ico ${a.action.toLowerCase()}`}><I/></span><div><strong>{a.orderId}</strong><span>{a.detail}</span></div><small>{ago(a.createdAt)}</small></li> })}
      {!activity.length && <li className="act-empty">Aún no hay actividad.</li>}</ul>}
  </article>
}
