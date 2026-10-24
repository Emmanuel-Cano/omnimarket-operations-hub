import type {Order, Status} from './types';
export const STATUSES: Status[] = ['Pendiente', 'En proceso', 'Enviado', 'Entregado']
export const STATUS_META: Record<Status, { cls: string; dot: string }> = {
  Pendiente: { cls: 'amber', dot: 'bg-amber-500' }, 'En proceso': { cls: 'blue', dot: 'bg-blue-500' },
  Enviado: { cls: 'violet', dot: 'bg-violet-500' }, Entregado: { cls: 'green', dot: 'bg-emerald-500' },
}
const people = ['Sofía Hernández','Carlos Mendoza','Valeria Torres','Diego Ramírez','Camila Navarro','Mateo Castillo','Regina Flores','Santiago Vega','Mariana Cruz','Emiliano Reyes','Ximena Rojas','Sebastián Luna','Renata Campos','Daniel Morales','Natalia Ortiz','Leonardo Silva','Paola Guzmán','Andrés Aguilar','Fernanda Ibarra','Rodrigo Salas','Lucía Paredes','Javier Serrano','Andrea Vázquez','Miguel Bautista']
const products = [
  ['Audífonos Nova Pro',2899,1540],['Teclado Mecánico MX',2199,1100],['Monitor UltraView 27"',7499,4820],['Webcam Studio 4K',3299,1910],
  ['Mouse Ergo S2',1299,620],['Hub USB-C 8 en 1',1799,880],['Lámpara Halo Desk',1499,710],['Base Laptop Air',999,420],
  ['Micrófono Pulse',2599,1370],['Mochila Transit Pro',1899,890],['SSD Portable 1TB',2399,1560],['Silla Flow Office',6899,4100],
]
export const seedOrders: Order[] = people.map((customer, i) => {
  const p = products[i % products.length]
  const d = new Date(2025, 4, 30 - i)
  return { id: `OM-${1048 - i}`, customer, email: `${customer.split(' ')[0].toLowerCase()}@correo.mx`, product: p[0] as string, quantity: i % 5 === 0 ? 2 : 1, price: p[1] as number, cost: p[2] as number, date: d.toISOString().slice(0,10), status: STATUSES[i % 4] }
})
export const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
export const shortDate = (s: string) => new Intl.DateTimeFormat('es-MX', { day:'2-digit', month:'short' }).format(new Date(`${s}T12:00:00`))
