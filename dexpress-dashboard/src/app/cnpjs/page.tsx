"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CompanyKey,
  deliveriesThisMonthByCompany,
  employeesCountByCompany,
  expenseMTDByCompany,
  paymentStatusCountsByCompany,
  profitMTDByCompany,
  recentTransactionsByCompany,
  revenueMTDByCompany,
  vehiclesCountByCompany,
  employees,
  vehicles,
} from "@/data/mock";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Building2, TrendingUp, Receipt, Wallet, Truck, Users, PackageCheck } from "lucide-react";
// removed page-level action buttons per design request
import { useScope } from "@/context/scope";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

const companies: CompanyKey[] = ["DEXPRESS", "FG", "GXP"];

export default function CnpjsPage() {
  const { setScope } = useScope();
  const router = useRouter();
  function statusBadgeClasses(status: string) {
    if (status === "Pago") return "text-emerald-700 border-emerald-200 bg-emerald-50";
    if (status === "Pendente") return "text-amber-700 border-amber-200 bg-amber-50";
    return "text-rose-700 border-rose-200 bg-rose-50"; // Em atraso
  }

  // Badge helpers específicos
  function employeeBadgeClasses(status: string) {
    switch (status) {
      case "Ativo":
        return "text-emerald-700 bg-emerald-100 ring-1 ring-emerald-200";
      case "Férias":
        return "text-amber-700 bg-amber-100 ring-1 ring-amber-200";
      case "Afastado":
        return "text-rose-700 bg-rose-100 ring-1 ring-rose-200";
      default:
        return "text-slate-700 bg-slate-100 ring-1 ring-slate-200";
    }
  }

  function vehicleBadgeClasses(status: string) {
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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Building2 className="h-6 w-6" /> CNPJs</h1>
          <p className="text-sm text-muted-foreground">Visão detalhada por CNPJ: KPIs, status de pagamentos e transações recentes.</p>
        </div>
      </div>

      {/* Companies sections */}
      <div className="space-y-10">
        {companies.map((c) => {
          const kpis = {
            receita: revenueMTDByCompany[c],
            despesa: expenseMTDByCompany[c],
            lucro: profitMTDByCompany[c],
            entregas: deliveriesThisMonthByCompany[c],
            funcionarios: employeesCountByCompany[c],
            veiculos: vehiclesCountByCompany[c],
          };
          const status = paymentStatusCountsByCompany[c];
          const txs = recentTransactionsByCompany[c];
          const totalStatus = status.reduce((s, i) => s + i.value, 0);
          const margem = kpis.receita > 0 ? Math.round((kpis.lucro / kpis.receita) * 100) : 0;
          const pago = status.find((s) => s.name === "Pago")?.value ?? 0;
          const pagoPct = totalStatus ? Math.round((pago / totalStatus) * 100) : 0;

          return (
            <div key={c} className="space-y-4 rounded-xl border-0 ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 md:p-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                    {c.slice(0, 2)}
                  </div>
                  <h2 className="text-xl font-semibold">{c}</h2>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="outline" className="text-slate-700 border-slate-200">Receita: {currencyBRL(kpis.receita)}</Badge>
                  <Badge variant="outline" className="text-slate-700 border-slate-200">Despesas: {currencyBRL(kpis.despesa)}</Badge>
                  <Badge variant="outline" className="text-slate-700 border-slate-200">Lucro: {currencyBRL(kpis.lucro)}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Margem</span>
                  <span>{margem}%</span>
                </div>
                <Progress value={margem} className="h-2" />
              </div>

              {/* Receita x Despesa/Lucro (stacked) */}
              <div className="space-y-1">
                <div className="flex h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  {(() => {
                    const receita = Math.max(0, kpis.receita);
                    const desp = Math.max(0, Math.min(kpis.despesa, receita));
                    const lucro = Math.max(0, receita - desp);
                    const dPct = receita ? Math.round((desp / receita) * 100) : 0;
                    const lPct = receita ? Math.round((lucro / receita) * 100) : 0;
                    return (
                      <>
                        <div className="h-2 bg-amber-500" style={{ width: `${dPct}%` }} />
                        <div className="h-2 bg-emerald-600" style={{ width: `${lPct}%` }} />
                      </>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Despesas
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" /> Lucro
                  </span>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <KpiCard title="Receita (MTD)" value={currencyBRL(kpis.receita)} icon={TrendingUp} className="bg-white/80 ring-1 ring-slate-200" />
                <KpiCard title="Despesas (MTD)" value={currencyBRL(kpis.despesa)} icon={Receipt} className="bg-white/80 ring-1 ring-slate-200" />
                <KpiCard title="Lucro (MTD)" value={currencyBRL(kpis.lucro)} icon={Wallet} className="bg-white/80 ring-1 ring-slate-200" />
                <KpiCard title="Entregas (mês)" value={String(kpis.entregas)} icon={PackageCheck} className="bg-white/80 ring-1 ring-slate-200" />
                <KpiCard title="Funcionários" value={String(kpis.funcionarios)} icon={Users} className="bg-white/80 ring-1 ring-slate-200" />
                <KpiCard title="Veículos" value={String(kpis.veiculos)} icon={Truck} className="bg-white/80 ring-1 ring-slate-200" />
              </div>

              <Separator />

              {/* Status + Transações */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {/* Pagamentos por status */}
                <Card className="h-[360px] border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Status de pagamentos</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <div className="relative h-full overflow-hidden rounded-lg bg-muted p-2 border border-border">
                      <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-[#2F2D76]/10 blur-2xl" />
                      <div className="pointer-events-none absolute -left-6 -bottom-10 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl" />
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={status}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={64}
                            outerRadius={96}
                            paddingAngle={2}
                            cornerRadius={8}
                            stroke="var(--background)"
                            strokeWidth={2}
                          >
                            {status.map((d) => (
                              <Cell
                                key={d.name}
                                fill={{
                                  Pago: "#16a34a",
                                  Pendente: "#f59e0b",
                                  "Em atraso": "#ef4444",
                                }[d.name as "Pago" | "Pendente" | "Em atraso"]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(v: number, n: string) => [`${v}`, n]} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Pago</p>
                          <p className="text-2xl font-semibold leading-tight">{pagoPct}%</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">Total: {totalStatus}</p>
                        </div>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                      {status.map((s) => {
                        const color = { Pago: "bg-emerald-600", Pendente: "bg-amber-500", "Em atraso": "bg-rose-600" }[
                          s.name as "Pago" | "Pendente" | "Em atraso"
                        ];
                        const pct = totalStatus ? Math.round((s.value / totalStatus) * 100) : 0;
                        return (
                          <div key={s.name} className="flex items-center gap-2 rounded-lg ring-1 ring-slate-200 px-2 py-1 bg-white/60">
                            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
                            <span className="truncate">{s.name}</span>
                            <span className="ml-auto tabular-nums">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Transações recentes */}
                <Card className="lg:col-span-2 border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle>Transações recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-72 overflow-auto lg:max-h-none">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {txs.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium">{t.id}</TableCell>
                              <TableCell>{t.client}</TableCell>
                              <TableCell className="truncate max-w-[280px]">{t.description}</TableCell>
                              <TableCell className={`text-right ${t.amount < 0 ? "text-rose-600" : "text-emerald-700"}`}>{currencyBRL(t.amount)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusBadgeClasses(t.status)}>{t.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Consolidado por CNPJ: Funcionários, Veículos e Financeiro */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {/* Funcionários da empresa */}
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Funcionários</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setScope(c);
                          router.push("/operacional/funcionarios");
                        }}
                      >
                        Ver todos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {employees.filter((e) => e.company === c).slice(0, 5).map((e) => (
                        <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg ring-1 ring-slate-200 p-2 bg-white/70">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{e.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{e.role.trim()} • {e.turno}</div>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${employeeBadgeClasses(e.status as any)}`}>{e.status}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Veículos da empresa */}
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Veículos</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setScope(c);
                          router.push("/operacional/veiculos");
                        }}
                      >
                        Ver todos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Placa</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.filter((v) => v.company === c).slice(0, 5).map((v) => (
                          <TableRow key={v.id}>
                            <TableCell>{v.plate}</TableCell>
                            <TableCell className="truncate max-w-[160px]">{v.model}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={vehicleBadgeClasses(v.status as any)}>{v.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Financeiro: Receitas e Despesas recentes */}
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle>Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Receitas */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Receitas recentes</div>
                        <div className="space-y-1">
                          {txs.filter((t) => t.amount > 0).slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                              <div className="min-w-0 truncate">{t.client} — {t.description}</div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-emerald-700 font-medium">{currencyBRL(t.amount)}</span>
                                <Button asChild size="sm" variant="outline" className="h-7 px-2">
                                  <Link href={`/financeiro/receitas/${t.id}/editar`}>Editar</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Despesas */}
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Despesas recentes</div>
                        <div className="space-y-1">
                          {txs.filter((t) => t.amount < 0).slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                              <div className="min-w-0 truncate">{t.client} — {t.description}</div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-rose-600 font-medium">{currencyBRL(Math.abs(t.amount))}</span>
                                <span className="text-[11px] text-muted-foreground">Editar em breve</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
