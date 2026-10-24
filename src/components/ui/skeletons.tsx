"use client";

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

export function AppSkeleton() {
  return <div className="app-shell" role="status" aria-busy="true" aria-label="Cargando aplicación">
    <aside className="sidebar"><div className="side-head"><Skeleton style={{ width: 130, height: 32 }} /></div>
      <nav>{[0, 1, 2].map(i => <Skeleton key={i} style={{ height: 40, margin: '6px 0' }} />)}</nav></aside>
    <div className="main"><header className="topbar"><Skeleton style={{ width: 220, height: 34 }} /></header>
      <div className="page"><DashboardSkeleton /></div></div>
  </div>
}

export function DashboardSkeleton() {
  return <div aria-busy="true" aria-label="Cargando métricas" role="status">
    <section className="kpi-grid">{[0, 1, 2, 3].map(i => <div className="kpi" key={i}><Skeleton style={{ width: 38, height: 38 }} /><Skeleton style={{ width: '55%', height: 12, marginTop: 18 }} /><Skeleton style={{ width: '70%', height: 26, marginTop: 10 }} /><Skeleton style={{ width: '40%', height: 12, marginTop: 14 }} /></div>)}</section>
    <section className="dashboard-grid"><article className="panel"><Skeleton style={{ width: 180, height: 16 }} /><Skeleton style={{ height: 290, marginTop: 22 }} /></article>
      <article className="panel"><Skeleton style={{ width: 150, height: 16 }} />{[0, 1, 2, 3].map(i => <Skeleton key={i} style={{ height: 14, marginTop: 28 }} />)}</article></section>
  </div>
}

export function TableSkeleton({ rows = 7 }: { rows?: number }) {
  return <div role="status" aria-busy="true" aria-label="Cargando pedidos" style={{ padding: 18, display: 'grid', gap: 14 }}>
    {Array.from({ length: rows }, (_, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 90px 1fr 100px 110px 70px', gap: 16, alignItems: 'center' }}>
      <Skeleton style={{ height: 16 }} /><Skeleton style={{ height: 14 }} /><Skeleton style={{ height: 14 }} /><Skeleton style={{ height: 14 }} /><Skeleton style={{ height: 22, borderRadius: 99 }} /><Skeleton style={{ height: 14 }} /></div>)}
  </div>
}

export function KanbanSkeleton() {
  return <div className="kanban-board" role="status" aria-busy="true" aria-label="Cargando tablero">
    {[0, 1, 2, 3].map(c => <section className="kanban-column" key={c}><header><Skeleton style={{ width: 110, height: 14 }} /></header>
      <div>{[0, 1, 2].map(i => <Skeleton key={i} style={{ height: 96, marginBottom: 10 }} />)}</div></section>)}
  </div>
}

export function LinesSkeleton({ lines = 3 }: { lines?: number }) {
  return <div role="status" aria-busy="true" aria-label="Cargando" style={{ display: 'grid', gap: 8 }}>
    {Array.from({ length: lines }, (_, i) => <Skeleton key={i} style={{ height: 14, width: `${100 - i * 15}%` }} />)}
  </div>
}
