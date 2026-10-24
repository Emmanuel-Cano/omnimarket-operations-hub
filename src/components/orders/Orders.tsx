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

import type { Order, Status, View, Toast } from "@/lib/types";
import { STATUSES, STATUS_META, seedOrders, money, shortDate } from "@/lib/orders";
import {Btn,Badge,Empty} from "@/components/ui/primitives";
const orderSchema=z.object({customer:z.string().min(3,'Ingresa el nombre completo'),email:z.email('Correo no válido'),product:z.string().min(2,'Ingresa un producto'),quantity:z.number().min(1),price:z.number().positive(),cost:z.number().min(0),date:z.string().min(1),status:z.enum(STATUSES)})
function OrderModal({order,onClose,onSave}:{order?:Order;onClose:()=>void;onSave:(o:Order)=>void}) {
  const [f,setF]=useState<Order>(order||{id:'',customer:'',email:'',product:'',quantity:1,price:0,cost:0,date:new Date().toISOString().slice(0,10),status:'Pendiente'})
  const [errors,setErrors]=useState<Record<string,string>>({})
  const save=()=>{const r=orderSchema.safeParse(f);if(!r.success){setErrors(Object.fromEntries(r.error.issues.map(i=>[String(i.path[0]),i.message])));return}onSave({...f,id:f.id||`OM-${Math.floor(1100+Math.random()*800)}`})}
  const field=(k:keyof Order,v:string)=>setF({...f,[k]:['quantity','price','cost'].includes(k)?Number(v):v})
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal"><div className="modal-head"><div><h3>{order?'Editar pedido':'Nuevo pedido'}</h3><p>Captura la información comercial del pedido.</p></div><Btn variant="ghost" onClick={onClose}><X/></Btn></div><div className="form-grid">
    {[['customer','Cliente','Sofía Hernández','text'],['email','Correo electrónico','sofia@correo.mx','email'],['product','Producto','Nombre del producto','text'],['quantity','Cantidad','1','number'],['price','Precio unitario','0.00','number'],['cost','Costo unitario','0.00','number'],['date','Fecha','','date']].map(([k,l,ph,t])=><label className={k==='product'?'span-2':''} key={k}>{l}<input type={t} placeholder={ph} value={f[k as keyof Order]} onChange={e=>field(k as keyof Order,e.target.value)} className={errors[k]?'invalid':''}/>{errors[k]&&<small>{errors[k]}</small>}</label>)}
    <label>Estado<select value={f.status} onChange={e=>field('status',e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
    <div className="total-box span-2"><span>Total calculado</span><strong>{money(f.quantity*f.price)}</strong><small>Margen estimado: {money(f.quantity*(f.price-f.cost))}</small></div>
  </div><div className="modal-actions"><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save}><Check/>{order?'Guardar cambios':'Guardar pedido'}</Btn></div></section></div>
}

export function Orders({orders,setOrders,notify}:{orders:Order[];setOrders:React.Dispatch<React.SetStateAction<Order[]>>;notify:(t:Omit<Toast,'id'>)=>void}) {
  const [q,setQ]=useState(''),[status,setStatus]=useState('Todos'),[date,setDate]=useState(''),[selected,setSelected]=useState<string[]>([]),[page,setPage]=useState(1),[modal,setModal]=useState<Order|undefined|null>(null),[menu,setMenu]=useState<string|null>(null)
  const filtered=orders.filter(o=>(status==='Todos'||o.status===status)&&(!date||o.date===date)&&`${o.id} ${o.customer} ${o.product}`.toLowerCase().includes(q.toLowerCase()))
  const pages=Math.max(1,Math.ceil(filtered.length/7)), visible=filtered.slice((page-1)*7,page*7)
  useEffect(()=>{if(page>pages)setPage(pages)},[pages,page])
  const remove=(ids:string[])=>{if(!confirm(`¿Eliminar ${ids.length===1?'este pedido':`${ids.length} pedidos`}? Esta acción no se puede deshacer.`))return;setOrders(x=>x.filter(o=>!ids.includes(o.id)));setSelected([]);notify({kind:'success',text:'Pedido(s) eliminado(s).'})}
  const save=(o:Order)=>{setOrders(x=>x.some(v=>v.id===o.id)?x.map(v=>v.id===o.id?o:v):[o,...x]);setModal(null);notify({kind:'success',text:o.id&&orders.some(v=>v.id===o.id)?'Pedido actualizado.':'Pedido creado correctamente.'})}
  const batch=(s:Status)=>{setOrders(x=>x.map(o=>selected.includes(o.id)?{...o,status:s}:o));setSelected([]);notify({kind:'success',text:`Pedidos actualizados a “${s}”.`})}
  const changeStatus=(id:string,s:Status)=>{setOrders(x=>x.map(o=>o.id===id?{...o,status:s}:o));setMenu(null);notify({kind:'success',text:`${id} actualizado a “${s}”.`})}
  const clearFilters=()=>{setQ('');setStatus('Todos');setDate('');setPage(1)}
  return <div className="page orders-page"><div className="orders-heading"><span>{filtered.length} pedidos</span><Btn variant="primary" onClick={()=>setModal(undefined)}><Plus/>Nuevo pedido</Btn></div>
    <div className="filters"><div className="search"><Search/><input value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Buscar por ID, cliente o producto…"/></div><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option>Todos</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><input type="date" aria-label="Filtrar fecha" value={date} onChange={e=>{setDate(e.target.value);setPage(1)}}/><Btn variant="ghost" disabled={!q&&status==='Todos'&&!date} onClick={clearFilters}><X/>Limpiar filtros</Btn></div>
    {selected.length>0&&<div className="batch"><strong>{selected.length} seleccionado(s)</strong><span>Cambiar estado:</span>{STATUSES.map(s=><button key={s} onClick={()=>batch(s)}>{s}</button>)}<Btn variant="danger" onClick={()=>remove(selected)}><Trash2/>Eliminar</Btn></div>}
    <div className="table-card">{visible.length?<><table><thead><tr><th><input type="checkbox" checked={visible.every(o=>selected.includes(o.id))} onChange={e=>setSelected(e.target.checked?[...new Set([...selected,...visible.map(o=>o.id)])]:selected.filter(id=>!visible.some(o=>o.id===id)))}/></th><th>Pedido</th><th>Cliente / producto</th><th>Total</th><th>Estado</th><th>Fecha</th><th/></tr></thead><tbody>{visible.map(o=><tr key={o.id}><td><input type="checkbox" checked={selected.includes(o.id)} onChange={()=>setSelected(x=>x.includes(o.id)?x.filter(i=>i!==o.id):[...x,o.id])}/></td><td><strong>{o.id}</strong></td><td><strong>{o.customer}</strong><span>{o.product} · {o.quantity} pza.</span></td><td><strong>{money(o.price*o.quantity)}</strong></td><td><Badge status={o.status}/></td><td>{shortDate(o.date)}</td><td className="action-cell"><Btn variant="ghost" aria-label={`Acciones de ${o.id}`} onClick={()=>setMenu(menu===o.id?null:o.id)}><MoreHorizontal/></Btn>{menu===o.id&&<div className="row-menu"><button onClick={()=>{setModal(o);setMenu(null)}}><Pencil/>Editar</button><span className="menu-label">Cambiar estado</span>{STATUSES.filter(s=>s!==o.status).map(s=><button key={s} onClick={()=>changeStatus(o.id,s)}><i className={STATUS_META[s].dot}/>{s}</button>)}<button className="destructive" onClick={()=>remove([o.id])}><Trash2/>Eliminar</button></div>}</td></tr>)}</tbody></table>
      <div className="mobile-orders">{visible.map(o=><article key={o.id}><div><strong>{o.id}</strong><Badge status={o.status}/></div><h4>{o.customer}</h4><p>{o.product} · {o.quantity} pza.</p><div><strong>{money(o.price*o.quantity)}</strong><span>{shortDate(o.date)}</span></div><div className="mobile-order-actions"><Btn onClick={()=>setModal(o)}><Pencil/>Editar</Btn><select aria-label={`Cambiar estado de ${o.id}`} value={o.status} onChange={e=>changeStatus(o.id,e.target.value as Status)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><Btn variant="danger" onClick={()=>remove([o.id])}><Trash2/></Btn></div></article>)}</div>
      <footer className="pagination"><span>Mostrando {(page-1)*7+1}–{Math.min(page*7,filtered.length)} de {filtered.length}</span><div><Btn variant="ghost" disabled={page===1} onClick={()=>setPage(1)}><ChevronsLeft/></Btn><Btn variant="ghost" disabled={page===1} onClick={()=>setPage(page-1)}><ChevronLeft/></Btn><b>{page} / {pages}</b><Btn variant="ghost" disabled={page===pages} onClick={()=>setPage(page+1)}><ChevronRight/></Btn></div></footer></>:<Empty title="No encontramos pedidos" text="Prueba ajustando o limpiando los filtros."/>}</div>
    {modal!==null&&<OrderModal order={modal} onClose={()=>setModal(null)} onSave={save}/>}
  </div>
}
