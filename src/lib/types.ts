import type React from 'react';
import { Package } from 'lucide-react';
export type Status = 'Pendiente' | 'En proceso' | 'Enviado' | 'Entregado';
export type View = 'dashboard' | 'orders' | 'kanban';
export type Order = { id: string; customer: string; email: string; product: string; quantity: number; price: number; cost: number; date: string; status: Status };
export type Toast = { id: number; kind: 'success' | 'error' | 'warning'; text: string; undo?: () => void };
export type Activity = { id: string; orderId: string; action: 'CREATE' | 'UPDATE' | 'STATUS' | 'DELETE'; detail: string; actor: string; createdAt: string };
export type Ops = {
  save: (o: Order) => Promise<boolean>;
  remove: (ids: string[]) => Promise<void>;
  setStatus: (id: string, s: Status, opts?: { text?: string; undo?: boolean }) => Promise<void>;
  batchStatus: (ids: string[], s: Status) => Promise<void>;
};
