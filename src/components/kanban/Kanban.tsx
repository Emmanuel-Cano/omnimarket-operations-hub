"use client";
import { useEffect, useMemo, useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { z } from 'zod'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, Boxes, Check, ChevronLeft, ChevronRight,
  ChevronsLeft, CircleDollarSign, Clock3, GripVertical, LayoutDashboard, LogOut, Menu, Moon, MoreHorizontal,
  Package, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, Search, ShoppingBag, Sparkles, Sun, Trash2,
  TrendingUp, Undo2, X, Code2, ShieldCheck, Pencil, AlertTriangle, CircleHelp,
} from 'lucide-react'

import type { Order, Status, View, Toast, Ops } from "@/lib/types";
import { STATUSES, STATUS_META, seedOrders, money, shortDate } from "@/lib/orders";
import {Btn,Badge,Empty} from "@/components/ui/primitives";
export function KanbanCard({o,onMove,dragging=false,dragHandle}:{o:Order;onMove?:(s:Status)=>void;dragging?:boolean;dragHandle?:Record<string,unknown>}) {
  const [open,setOpen]=useState(false)
  return <article className={`kanban-card ${dragging?'dragging':''}`}><div className="kanban-id"><strong>{o.id}</strong><div className="kanban-actions">{onMove&&<button aria-label={`Acciones de ${o.id}`} onPointerDown={e=>e.stopPropagation()} onClick={()=>setOpen(!open)}><MoreHorizontal/></button>}<button className="drag-handle" aria-label={`Arrastrar ${o.id}`} {...dragHandle}><GripVertical/></button>{open&&onMove&&<div className="row-menu kanban-menu" onPointerDown={e=>e.stopPropagation()}><span className="menu-label">Mover pedido a</span>{STATUSES.filter(s=>s!==o.status).map(s=><button key={s} onClick={()=>{onMove(s);setOpen(false)}}><i className={STATUS_META[s].dot}/>{s}</button>)}</div>}</div></div><h4>{o.customer}</h4><p>{o.product}</p><div className="kanban-card-foot"><strong>{money(o.price*o.quantity)}</strong><span><Clock3/>{shortDate(o.date)}</span></div></article>
}
function Column({status,orders,move}:{status:Status;orders:Order[];move:(o:Order,s:Status)=>void}) {
  const {setNodeRef,isOver}=useDroppable({id:status})
  return <section ref={setNodeRef} className={`kanban-column ${isOver?'is-over':''}`}><header><span><i className={STATUS_META[status].dot}/><strong>{status}</strong></span><b>{orders.length}</b></header><div>{orders.length?orders.map(o=><Draggable key={o.id} o={o} move={s=>move(o,s)}/>):<Empty title="Sin pedidos" text="Arrastra un pedido aquí."/ >}</div></section>
}
function Draggable({o,move}:{o:Order;move:(s:Status)=>void}) {
  const {attributes,listeners,setNodeRef,transform,isDragging}=useDraggable({id:o.id})
  return <div ref={setNodeRef} style={{transform:transform?`translate3d(${transform.x}px,${transform.y}px,0)`:undefined,opacity:isDragging?0.35:1}}><KanbanCard o={o} onMove={move} dragHandle={{...listeners,...attributes}}/></div>
}
export function Kanban({orders,ops,loading}:{orders:Order[];ops:Ops;loading:boolean}) {
  const [active,setActive]=useState<Order|null>(null), sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}))
  const move=(o:Order,s:Status)=>{if(o.status===s)return;void ops.setStatus(o.id,s,{text:`${o.id} movido a “${s}”.`,undo:true})}
  const end=(e:DragEndEvent)=>{if(active&&e.over&&STATUSES.includes(e.over.id as Status))move(active,e.over.id as Status);setActive(null)}
  if(loading)return <div className="page"><div className="kanban-info"><span><RefreshCw className="spin"/>Cargando pedidos…</span></div></div>
  return <div className="page"><div className="kanban-info"><span><Sparkles/>Los cambios se guardan en la base de datos y se sincronizan entre dispositivos.</span><span><GripVertical/>Arrastra desde el asa o usa el menú de acciones.</span></div><DndContext sensors={sensors} onDragStart={(e:DragStartEvent)=>setActive(orders.find(o=>o.id===e.active.id)||null)} onDragEnd={end} onDragCancel={()=>setActive(null)}><div className="kanban-board">{STATUSES.map(s=><Column key={s} status={s} orders={orders.filter(o=>o.status===s)} move={move}/>)}</div><DragOverlay>{active&&<KanbanCard o={active} dragging/>}</DragOverlay></DndContext></div>
}
