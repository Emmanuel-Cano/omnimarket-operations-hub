# OmniMarket Operations Hub

Dashboard analítico de e-commerce: **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4 · PostgreSQL + Prisma · Auth.js (OAuth 2.0)**.

## Qué incluye
- **Autenticación OAuth 2.0 exclusiva** con Google y GitHub (Auth.js). Rutas privadas protegidas por middleware.
- **Pedidos**: CRUD, búsqueda, filtros, paginación y **edición/eliminación en lote**.
- **Kanban** con drag & drop, mutación optimista, toast de confirmación y reversión si el servidor falla.
- **Dashboard**: KPIs reales con variación contra el periodo anterior, gráficas, actividad en vivo y asistente de operaciones (Claude si hay `ANTHROPIC_API_KEY`; si no, análisis local).
- **Auditoría**: cada alta, edición, cambio de estado y borrado queda registrado con el correo de quien lo hizo.
- **Skeletons** de carga en toda la interfaz (sin spinners genéricos).

## Endpoints de auditoría (`/api/test/*`, públicos)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/test/analytics?page=1&limit=50` | Métricas de ventas (ingresos, margen, ticket promedio, por estado y por día) + pedidos paginados. Incluye `meta.took_ms` y cabecera `Server-Timing`. |
| POST | `/api/test/reset-data` | Restablece la base a un conjunto conocido: 24 pedidos `OM-1025…OM-1048`. |
| GET | `/api/test/kanban-status?id=OM-1048` | Estado y columna actual de un pedido. Sin `id`: conteo por columna. |

API de la aplicación (requiere sesión): `/api/orders`, `/api/orders/:id`, `/api/orders/batch`, `/api/audit`, `/api/stats`, `/api/assistant`.

## Arranque local
```bash
npm install
cp .env.example .env     # completa DATABASE_URL, AUTH_SECRET y las credenciales OAuth
npm run db:setup         # crea tablas y carga datos de ejemplo
npm run dev              # http://localhost:3000
```

### Variables de entorno
| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `AUTH_SECRET` | Secreto de sesión (`npx auth secret`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth de Google |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | OAuth de GitHub |
| `AUTH_TRUST_HOST=true` | Detrás de proxy (Railway, Render) |
| `ANTHROPIC_API_KEY` | Opcional: asistente con Claude |

### Configurar OAuth
Sustituye `TU-DOMINIO` por la URL pública (y repite con `http://localhost:3000` para desarrollo).
- **Google** (console.cloud.google.com → APIs y servicios → Credenciales → ID de cliente OAuth, tipo *Aplicación web*): URI de redirección `https://TU-DOMINIO/api/auth/callback/google`.
- **GitHub** (Settings → Developer settings → OAuth Apps → New): *Authorization callback URL* `https://TU-DOMINIO/api/auth/callback/github`.

## Pruebas
```bash
npm test            # 19 pruebas unitarias (Vitest): métricas, formateadores, esquemas Zod, filtros
npm run test:e2e    # 3 flujos E2E (Playwright): autenticación, creación de pedido, drag & drop
```
Los E2E arrancan la app con `E2E_TEST_MODE=true`, que habilita **solo para pruebas** un proveedor de sesión simulada. **Nunca definas esa variable en producción.**
Antes de los E2E: `npm run build` y una base accesible en `DATABASE_URL`.

## CI/CD
`.github/workflows/ci.yml`: tipos + pruebas unitarias → E2E con PostgreSQL de servicio → despliegue **solo si todo pasa**.
- **Vercel**: agrega los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`, y desactiva el despliegue automático por Git (Project → Settings → Git → *Ignored Build Step*: "Don't build anything"), para que solo despliegue CI.
- **Railway**: activa *Wait for CI* en el servicio (Settings → Deploy): Railway no despliega hasta que GitHub Actions termina en verde.

`.github/workflows/keepalive.yml` (opcional): define la variable de repositorio `APP_URL` para despertar la app cada 5 min y mantener la latencia bajo 300 ms.

## Modelo de datos
`Customer` · `Product` · `Order` · `OrderItem` (precio y costo al momento de la compra) · `AuditLog`.
