import type { Status } from './types';
export const STATUSES: Status[] = ['Pendiente', 'En proceso', 'Enviado', 'Entregado']
export const STATUS_META: Record<Status, { cls: string; dot: string }> = {
  Pendiente: { cls: 'amber', dot: 'bg-amber-500' }, 'En proceso': { cls: 'blue', dot: 'bg-blue-500' },
  Enviado: { cls: 'violet', dot: 'bg-violet-500' }, Entregado: { cls: 'green', dot: 'bg-emerald-500' },
}
export const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
export const shortDate = (s: string) => new Intl.DateTimeFormat('es-MX', { day:'2-digit', month:'short' }).format(new Date(`${s}T12:00:00`))
