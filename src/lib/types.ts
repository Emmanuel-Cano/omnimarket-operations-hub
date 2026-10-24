import type React from 'react';
import { Package } from 'lucide-react';
export type Status = 'Pendiente' | 'En proceso' | 'Enviado' | 'Entregado';
export type View = 'dashboard' | 'orders' | 'kanban';
export type Order = { id: string; customer: string; email: string; product: string; quantity: number; price: number; cost: number; date: string; status: Status };
export type Toast = { id: number; kind: 'success' | 'error' | 'warning'; text: string; undo?: () => void };
