"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { vehicles } from "@/data/mock";
import { Truck, Download, Wrench } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { useScope } from "@/context/scope";

function statusBadge(status: string) {
  switch (status) {
    case "Operação":
      return "text-[#2F2D76] bg-[#2F2D76]/10 ring-1 ring-[#2F2D76]/15";
    case "Manutenção":
      return "text-amber-700 bg-amber-100 ring-1 ring-amber-200";
    case "Reserva":
      return "text-slate-700 bg-slate-100 ring-1 ring-slate-200";
    default:
      return "text-slate-700 bg-slate-100 ring-1 ring-slate-200";
  }
}

export default function VeiculosPage() {
  const { scope } = useScope();
  const filtered = scope === "ALL" ? vehicles : vehicles.filter((v) => v.company === scope);
  const total = filtered.length;
  const emOperacao = filtered.filter((v) => v.status === "Operação").length;
  const emManutencao = filtered.filter((v) => v.status === "Manutenção").length;
  const emReserva = filtered.filter((v) => v.status === "Reserva").length;

  const statusData = [
    { name: "Operação", value: emOperacao, color: "#2F2D76" },
    { name: "Manutenção", value: emManutencao, color: "#f59e0b" },
    { name: "Reserva", value: emReserva, color: "#cbd5e1" },
  ];

  const kmDiaData = filtered.map((v) => ({ name: v.plate, value: v.kmDia }));
  const proximasMan = [...filtered].sort((a, b) => new Date(a.nextService).getTime() - new Date(b.nextService).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header e ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Truck className="h-6 w-6" /> Veículos</h1>
          <p className="text-sm text-muted-foreground">Status da frota, utilização e manutenção.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Exportar</Button>
          <Button><Wrench className="h-4 w-4 mr-2" /> Agendar manutenção</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total" value={String(total)} />
        <KpiCard title="Em operação" value={String(emOperacao)} />
        <KpiCard title="Manutenção" value={String(emManutencao)} />
        <KpiCard title="Reserva" value={String(emReserva)} />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Km/dia por veículo */}
        <Card className="h-[360px] border-0 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilização hoje (km/dia)</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kmDiaData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <RechartsTooltip formatter={(v: number) => `${v} km`} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                <Bar dataKey="value" fill="#2F2D76" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Distribuição por status */}
        <Card className="h-[360px] border-0 shadow-none">
          <CardHeader>
            <CardTitle>Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <div className="relative h-full overflow-hidden rounded-lg bg-slate-50 p-2 border border-slate-200/70">
              <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-[#2F2D76]/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-6 -bottom-10 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl" />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} stroke="none">
                    {statusData.map((d) => (
                      <Cell key={d.name} fill={d.color as string} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number, n: string) => [`${v}`, n]} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas manutenções */}
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle>Próximas manutenções</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última</TableHead>
                <TableHead>Próxima</TableHead>
                <TableHead>Km total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proximasMan.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.plate}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusBadge(v.status)}`}>{v.status}</span>
                  </TableCell>
                  <TableCell>{format(new Date(v.lastService), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(v.nextService), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{v.kmTotal.toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
