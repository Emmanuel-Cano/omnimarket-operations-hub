import { z } from 'zod'
import { STATUSES } from './orders'
import type { Status } from './types'

/** Esquema único de entrada de pedidos: lo usan el formulario y la API. */
export const orderInputSchema = z.object({
  customer: z.string().trim().min(3, 'Ingresa el nombre completo'),
  email: z.email('Correo no válido'),
  product: z.string().trim().min(2, 'Ingresa un producto'),
  quantity: z.number().int('Debe ser un número entero').min(1, 'Mínimo 1'),
  price: z.number().positive('Debe ser mayor a 0'),
  cost: z.number().min(0, 'No puede ser negativo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida'),
  status: z.enum(STATUSES as [Status, ...Status[]]),
})
export type OrderInput = z.infer<typeof orderInputSchema>

export const batchSchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(['status', 'delete']),
  status: z.enum(STATUSES as [Status, ...Status[]]).optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
