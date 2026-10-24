# OmniMarket Operations Hub

Panel de operaciones para e-commerce: **Next.js 15 · React 19 · TypeScript · Tailwind 4 · PostgreSQL + Prisma**.

## Qué incluye
- **Pedidos**: CRUD, búsqueda, filtros, acciones en lote — todo persistido en PostgreSQL.
- **Kanban**: drag & drop con actualización optimista, rollback si falla y botón *Deshacer*.
- **Dashboard**: KPIs reales con comparación contra el periodo anterior, gráficas y ventas por día.
- **Asistente de operaciones (IA)**: preguntas en lenguaje natural sobre pedidos, márgenes y clientes. Usa Claude si defines `ANTHROPIC_API_KEY`; sin clave responde con análisis local, así la demo nunca se rompe.
- **Auditoría**: cada alta, edición, cambio de estado y borrado queda registrado y se muestra en vivo.
- **Sincronización**: la app consulta la API cada 5 s, así que un cambio en un dispositivo aparece en otro.

## Arranque rápido
```bash
npm install
cp .env.example .env        # pega tu DATABASE_URL de Postgres
npm run db:setup            # crea las tablas y carga datos de ejemplo
npm run dev
```
Abre http://localhost:3000 y pulsa **Explorar demo**.

### Base de datos gratis
1. Crea un proyecto en [Neon](https://neon.tech) (o Supabase / Railway) y copia la cadena de conexión.
2. Pégala en `DATABASE_URL` dentro de `.env`.
3. `npm run db:setup`.

## Despliegue en Vercel
1. Importa el repo en Vercel.
2. Variables de entorno: `DATABASE_URL` (obligatoria) y, opcional, `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL`).
3. Deploy. `postinstall` ejecuta `prisma generate`; el esquema ya lo creaste con `npm run db:setup` apuntando a la misma base.

## API
| Método | Ruta | Descripción |
|---|---|---|
| GET / POST | `/api/orders` | Listar / crear pedidos |
| GET / PATCH / DELETE | `/api/orders/:id` | Leer / editar (parcial) / eliminar |
| POST | `/api/orders/batch` | `{ ids, action: "status" \| "delete", status? }` |
| GET | `/api/stats` | KPIs agregados y ventas por día |
| GET | `/api/audit?orderId=` | Historial de auditoría |
| POST | `/api/assistant` | `{ question }` → respuesta del asistente |

## Modelo de datos
`Customer` · `Product` · `Order` · `OrderItem` (precio y costo al momento de la compra) · `AuditLog`.

## Pendiente / siguientes pasos
OAuth real (Auth.js con Google/GitHub), roles, tests automatizados.
