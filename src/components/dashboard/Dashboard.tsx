"use client";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";
import { z } from "zod";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  CircleDollarSign,
  Clock3,
  GripVertical,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Undo2,
  X,
  Code2,
  ShieldCheck,
  Pencil,
  AlertTriangle,
  CircleHelp,
} from "lucide-react";

import type { Order, Status, View, Toast } from "@/lib/types";
import {
  STATUSES,
  STATUS_META,
  seedOrders,
  money,
  shortDate,
} from "@/lib/orders";
import { Btn, Badge } from "@/components/ui/primitives";
function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  up = true,
  tip,
}: {
  icon: any;
  label: string;
  value: string;
  delta: string;
  up?: boolean;
  tip: string;
}) {
  return (
    <article className="kpi">
      <div className="kpi-top">
        <span className="kpi-icon">
          <Icon />
        </span>
        <span className="help" title={tip}>
          <CircleHelp />
        </span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className={up ? "delta up" : "delta down"}>
        {up ? <ArrowUpRight /> : <ArrowDownRight />}
        {delta} <small>vs. periodo anterior</small>
      </span>
    </article>
  );
}
export function Dashboard({
  orders,
  setView,
}: {
  orders: Order[];
  setView: (v: View) => void;
}) {
  const [period, setPeriod] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const latestDate = orders.reduce(
    (latest, o) => (o.date > latest ? o.date : latest),
    orders[0]?.date || new Date().toISOString().slice(0, 10),
  );
  const latest = new Date(`${latestDate}T12:00:00`),
    first = new Date(latest);
  first.setDate(latest.getDate() - period + 1);
  const periodOrders = orders.filter(
    (o) =>
      new Date(`${o.date}T12:00:00`) >= first &&
      new Date(`${o.date}T12:00:00`) <= latest,
  );
  const total = periodOrders.reduce((a, o) => a + o.price * o.quantity, 0),
    costs = periodOrders.reduce((a, o) => a + o.cost * o.quantity, 0),
    avg = total / Math.max(periodOrders.length, 1);
  const chart = Array.from({ length: period }, (_, i) => {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const day = periodOrders.filter((o) => o.date === key);
    return {
      date: key,
      ventas: day.reduce((a, o) => a + o.price * o.quantity, 0),
      margen: day.reduce((a, o) => a + (o.price - o.cost) * o.quantity, 0),
    };
  });
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  };
  return (
    <div className="page">
      <div className="page-actions">
        <div className="segmented">
          {[7, 30, 90].map((n) => (
            <button
              className={period === n ? "active" : ""}
              onClick={() => setPeriod(n)}
              key={n}
            >
              {n} días
            </button>
          ))}
        </div>
        <Btn onClick={refresh}>
          <RefreshCw className={refreshing ? "spin" : ""} />
          Actualizar
        </Btn>
      </div>
      <section className="kpi-grid">
        <Kpi
          icon={CircleDollarSign}
          label="Ingresos totales"
          value={money(total)}
          delta="12.8%"
          tip="Ingresos brutos de los pedidos del periodo"
        />
        <Kpi
          icon={ShoppingBag}
          label="Pedidos totales"
          value={String(periodOrders.length)}
          delta="8.2%"
          tip="Pedidos registrados en el periodo"
        />
        <Kpi
          icon={TrendingUp}
          label="Ticket promedio"
          value={money(avg)}
          delta="4.1%"
          tip="Ingreso promedio por pedido"
        />
        <Kpi
          icon={BarChart3}
          label="Margen bruto"
          value={`${total ? (((total - costs) / total) * 100).toFixed(1) : "0.0"}%`}
          delta="1.3%"
          up={false}
          tip="Ingresos menos costos, como porcentaje"
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Ventas y margen</h3>
              <p>
                Importes diarios derivados de los pedidos de los últimos{" "}
                {period} días
              </p>
            </div>

            <div className="legend">
              <span>
                <i className="indigo" />
                Ventas
              </span>
              <span>
                <i className="green-dot" />
                Margen bruto
              </span>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart}
                margin={{ top: 12, right: 8, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  tickFormatter={shortDate}
                />

                <YAxis
                  width={54}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  tickFormatter={(v) =>
                    `$${
                      v >= 1000
                        ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
                        : v
                    }`
                  }
                />

                <ChartTooltip
                  labelFormatter={(label) => shortDate(String(label ?? ""))}
                  formatter={(value, name) => [
                    money(Number(value)),
                    name === "ventas" ? "Ventas" : "Margen bruto",
                  ]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fill="url(#sales)"
                />

                <Area
                  type="monotone"
                  dataKey="margen"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel status-panel">
          <div className="panel-head">
            <div>
              <h3>Pedidos por estado</h3>
              <p>Distribución actual</p>
            </div>
          </div>
          <div className="status-list">
            {STATUSES.map((s) => {
              const n = orders.filter((o) => o.status === s).length;
              return (
                <div key={s}>
                  <div>
                    <span>
                      <i className={STATUS_META[s].dot} />
                      {s}
                    </span>
                    <strong>{n}</strong>
                  </div>
                  <progress
                    className={`progress-${STATUS_META[s].cls}`}
                    max={orders.length}
                    value={n}
                  />
                </div>
              );
            })}
          </div>
          <Btn variant="ghost" onClick={() => setView("kanban")}>
            Ver tablero Kanban <ArrowRight />
          </Btn>
        </article>
        <article className="panel recent">
          <div className="panel-head">
            <div>
              <h3>Pedidos recientes</h3>
              <p>Últimos movimientos registrados</p>
            </div>
            <Btn variant="ghost" onClick={() => setView("orders")}>
              Ver todos <ArrowRight />
            </Btn>
          </div>
          {orders.slice(0, 5).map((o) => (
            <div className="recent-row" key={o.id}>
              <span className="product-icon">
                <Package />
              </span>
              <div>
                <strong>
                  {o.id} · {o.customer}
                </strong>
                <span>{o.product}</span>
              </div>
              <Badge status={o.status} />
              <strong>{money(o.price * o.quantity)}</strong>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
