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
import { STATUSES, STATUS_META, money, shortDate } from "@/lib/orders";
import {Btn} from "@/components/ui/primitives";
export function Sidebar({ view, setView, collapsed, setCollapsed, mobile, close }: {view:View;setView:(v:View)=>void;collapsed:boolean;setCollapsed:(v:boolean)=>void;mobile:boolean;close:()=>void}) {
  const nav = [{id:'dashboard' as View,label:'Dashboard',icon:LayoutDashboard},{id:'orders' as View,label:'Pedidos',icon:ShoppingBag},{id:'kanban' as View,label:'Kanban',icon:Boxes}]
  return <aside className={`sidebar ${collapsed?'collapsed':''} ${mobile?'mobile-open':''}`}>
    <div className="side-head"><div className="brand"><span className="logo">O</span>{!collapsed&&<span>OmniMarket</span>}</div>{mobile&&<Btn variant="ghost" onClick={close} aria-label="Cerrar"><X/></Btn>}</div>
    <nav>{nav.map(({id,label,icon:Icon})=><button key={id} className={view===id?'active':undefined} aria-current={view===id?'page':undefined} onClick={()=>{setView(id);close()}}><Icon/><span>{label}</span></button>)}</nav>
    <div className="side-bottom">{!collapsed&&<div className="mini-upgrade"><Sparkles/><strong>PostgreSQL en vivo</strong><span>Datos sincronizados con la API.</span></div>}<button className="collapse" onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen/>:<PanelLeftClose/>}<span>Contraer menú</span></button></div>
  </aside>
}

const viewCopy = {
  dashboard: ['Resumen general','Monitorea el rendimiento de tu negocio en tiempo real.'],
  orders: ['Gestión de pedidos','Consulta, crea y administra todos tus pedidos.'],
  kanban: ['Flujo de pedidos','Mueve pedidos entre etapas y mantén al equipo sincronizado.'],
}
export function Header({view,user,theme,toggleTheme,onLogout,openMenu}:{view:View;user?:{name?:string|null;email?:string|null;image?:string|null};theme:string;toggleTheme:()=>void;onLogout:()=>void;openMenu:()=>void}) {
  return <header className="topbar"><div className="top-title"><Btn variant="ghost" className="mobile-menu" onClick={openMenu}><Menu/></Btn><div><h2>{viewCopy[view][0]}</h2><p>{viewCopy[view][1]}</p></div></div>
    <div className="user-actions"><Btn variant="ghost" aria-label="Notificaciones"><Bell/></Btn><Btn variant="ghost" onClick={toggleTheme} aria-label="Cambiar tema">{theme==='dark'?<Sun/>:<Moon/>}</Btn><div className="user"><span className="avatar">{(user?.name||user?.email||'?').split(/[\s@]/).filter(Boolean).slice(0,2).map(w=>w[0]?.toUpperCase()).join('')}</span><div><strong>{user?.name||user?.email}</strong><span>{user?.email}</span></div></div><Btn variant="secondary" onClick={onLogout}><LogOut/><span className="logout-label">Cerrar sesión</span></Btn></div>
  </header>
}
