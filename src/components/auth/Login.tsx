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
import {Btn} from "@/components/ui/primitives";
export function Login({ onLogin, theme, toggleTheme }: {onLogin:()=>void;theme:string;toggleTheme:()=>void}) {
  return <main className="login-page">
    <Btn variant="ghost" className="theme-float" onClick={toggleTheme} aria-label="Cambiar tema">{theme==='dark'?<Sun/>:<Moon/>}</Btn>
    <section className="login-card">
      <div className="brand brand-center"><span className="logo">O</span><span>OmniMarket</span></div>
      <div className="login-copy"><span className="eyebrow"><Sparkles/> Centro de operaciones</span><h1>Bienvenido a OmniMarket</h1><p>Administra tu negocio desde un solo lugar.</p></div>
      <div className="oauth">
        <button disabled title="Disponible al conectar OAuth"><span className="google">G</span>Continuar con Google</button>
        <button disabled title="Disponible al conectar OAuth"><Code2/>Continuar con GitHub</button>
      </div>
      <div className="divider"><span>Sesión de demostración</span></div>
      <Btn variant="primary" className="demo-btn" onClick={onLogin}><LayoutDashboard/> Explorar demo <ArrowRight/></Btn>
      <p className="secure"><ShieldCheck/> Acceso de demostración seguro. OAuth se conectará posteriormente.</p>
    </section>
    <p className="login-foot">Plataforma de demostración · Los datos se guardan únicamente en este dispositivo</p>
  </main>
}
