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
export function Btn({ children, variant='secondary', className='', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger' }) {
  return <button className={`btn btn-${variant} ${className}`} {...p}>{children}</button>
}
export function Badge({ status }: { status: Status }) { return <span className={`badge ${STATUS_META[status].cls}`}><i className={STATUS_META[status].dot}/>{status}</span> }
export function Empty({ title, text }: {title:string;text:string}) { return <div className="empty"><Package/><strong>{title}</strong><span>{text}</span></div> }
