# OmniMarket Operations Hub — Next.js App Router

Migración del código original de Figma Make a Next.js 15, React 19, TypeScript y Tailwind CSS 4.

## Ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para comprobar tipos y compilación: `npm run typecheck` y `npm run build`.

## Organización

- `/`: login de demostración
- `/dashboard`: métricas y gráficas
- `/pedidos`: búsqueda, CRUD y operaciones en lote
- `/kanban`: Drag & Drop
- `src/components/`: componentes extraídos del archivo original
- `src/lib/`: tipos y datos simulados

Conserva el CSS original y el comportamiento de demostración en localStorage. **No incluye OAuth real, base de datos, API de auditoría, ni tests oficiales**; son fases posteriores.
