"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { employees } from "@/data/mock";
import { Users, Download, UserPlus } from "lucide-react";
import { useScope } from "@/context/scope";
import Link from "next/link";
import { breakdownFolha, formatCurrencyBRL } from "@/lib/payroll";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function statusBadge(status: string) {
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

// removed CNH/ASO widgets in favor of payroll summaries

export default function FuncionariosPage() {
  const { scope } = useScope();
  const filtered = scope === "ALL" ? employees : employees.filter((e) => e.company === scope);
  const total = filtered.length;
  const ativos = filtered.filter((e) => e.status === "Ativo").length;
  const ferias = filtered.filter((e) => e.status === "Férias").length;
  const afastados = filtered.filter((e) => e.status === "Afastado").length;

  // Folha: calcular totais por funcionário e agregados (empresa)
  const folhaByEmployee = filtered.map((e) => ({
    id: e.id,
    name: e.name,
    company: e.company,
    breakdown: breakdownFolha({
      salario: e.salary,
      valeTransporte: e.valeTransporte,
      outrosDescontos: e.outrosDescontos,
      beneficios: e.beneficios,
      outrosCustosEmpresa: e.outrosCustosEmpresa,
    }),
  }));
  const subtotal = folhaByEmployee.reduce(
    (acc, cur) => {
      acc.salarios += cur.breakdown.salaryBruto;
      acc.beneficios += cur.breakdown.beneficiosTotal;
      acc.encargos += cur.breakdown.encargosTotal;
      acc.outrosCustosEmpresa += cur.breakdown.outrosCustosEmpresaTotal;
      return acc;
    },
    { salarios: 0, beneficios: 0, encargos: 0, outrosCustosEmpresa: 0 }
  );
  const custoTotalEmpresa = subtotal.salarios + subtotal.beneficios + subtotal.encargos + subtotal.outrosCustosEmpresa;


  return (
    <div className="space-y-6">
      {/* Header e ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Users className="h-6 w-6" /> Funcionários</h1>
          <p className="text-sm text-muted-foreground">Gestão do time: status, vencimentos e indicadores de pessoas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Exportar</Button>
          <Button asChild>
            <Link href="/operacional/funcionarios/novo"><UserPlus className="h-4 w-4 mr-2" /> Novo Colaborador</Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total" value={String(total)} />
        <KpiCard title="Ativos" value={String(ativos)} />
        <KpiCard title="Férias" value={String(ferias)} />
        <KpiCard title="Afastados" value={String(afastados)} />
      </div>

      

      {/* Custos com Funcionários - Distribuição completa (full width) */}
      <div className="grid gap-4 grid-cols-1">
        {/* Card único: Distribuição por tipo de custo com totais */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm min-h-[260px] bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Distribuição por tipo de custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Coluna esquerda: totais, distribuição e barras */}
              <div className="space-y-4 xl:col-span-2">
                {/* Cabeçalho com total e colaboradores */}
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="text-3xl font-semibold leading-tight tracking-tight">
                      {formatCurrencyBRL(custoTotalEmpresa)}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Soma de salários, benefícios, encargos e outros custos
                    </p>
                    <p className="mt-1 text-xs text-slate-700">
                      Média por colaborador:{" "}
                      <span className="font-medium">
                        {formatCurrencyBRL(total ? custoTotalEmpresa / total : 0)}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-slate-200 flex items-center gap-2">
                    <div className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                      {total}
                    </div>
                    <div className="text-xs leading-tight">
                      <div className="text-slate-500">Colaboradores</div>
                      <div className="text-[11px] text-slate-700">
                        {scope === "ALL" ? "Todas as empresas" : String(scope)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini distribuição agregada */}
                <div className="space-y-2">
                  <div className="flex h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-2 bg-indigo-600"
                      style={{
                        width: `${custoTotalEmpresa ? Math.round((subtotal.salarios / custoTotalEmpresa) * 100) : 0}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-amber-500"
                      style={{
                        width: `${custoTotalEmpresa ? Math.round((subtotal.beneficios / custoTotalEmpresa) * 100) : 0}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-slate-700"
                      style={{
                        width: `${custoTotalEmpresa ? Math.round((subtotal.encargos / custoTotalEmpresa) * 100) : 0}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-rose-500"
                      style={{
                        width: `${custoTotalEmpresa ? Math.round((subtotal.outrosCustosEmpresa / custoTotalEmpresa) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" /> Salários:{" "}
                      <span className="font-medium">{formatCurrencyBRL(subtotal.salarios)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Benefícios:{" "}
                      <span className="font-medium">{formatCurrencyBRL(subtotal.beneficios)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-700" /> Encargos:{" "}
                      <span className="font-medium">{formatCurrencyBRL(subtotal.encargos)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Outros:{" "}
                      <span className="font-medium">{formatCurrencyBRL(subtotal.outrosCustosEmpresa)}</span>
                    </span>
                  </div>
                </div>

                {/* Mini KPIs com % */}
                <div className="grid gap-3 grid-cols-2 xl:grid-cols-4 text-sm">
                  {[
                    { label: "Salários", val: subtotal.salarios, color: "bg-indigo-600" },
                    { label: "Benefícios", val: subtotal.beneficios, color: "bg-amber-500" },
                    { label: "Encargos", val: subtotal.encargos, color: "bg-slate-700" },
                    { label: "Outros", val: subtotal.outrosCustosEmpresa, color: "bg-rose-500" },
                  ].map((item) => {
                    const pct = custoTotalEmpresa ? Math.round((item.val / custoTotalEmpresa) * 100) : 0;
                    return (
                      <div key={item.label} className="rounded-lg ring-1 ring-slate-200 p-3 bg-white/80">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">{item.label}</span>
                          <span className={`inline-block h-2 w-2 rounded-full ${item.color}`} />
                        </div>
                        <div className="mt-1 text-base font-semibold">{formatCurrencyBRL(item.val)}</div>
                        <div className="text-[11px] text-muted-foreground">{pct}% do total</div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barras completas */}
                <div className="pt-2 border-t space-y-3 text-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Salários</span>
                      <span className="font-medium">{formatCurrencyBRL(subtotal.salarios)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{
                          width: `${custoTotalEmpresa ? Math.round((subtotal.salarios / custoTotalEmpresa) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Benefícios</span>
                      <span className="font-medium">{formatCurrencyBRL(subtotal.beneficios)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{
                          width: `${custoTotalEmpresa ? Math.round((subtotal.beneficios / custoTotalEmpresa) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Encargos</span>
                      <span className="font-medium">{formatCurrencyBRL(subtotal.encargos)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-slate-700"
                        style={{
                          width: `${custoTotalEmpresa ? Math.round((subtotal.encargos / custoTotalEmpresa) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Outros custos</span>
                      <span className="font-medium">{formatCurrencyBRL(subtotal.outrosCustosEmpresa)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-rose-500"
                        style={{
                          width: `${custoTotalEmpresa ? Math.round((subtotal.outrosCustosEmpresa / custoTotalEmpresa) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna direita: Top 5 colaboradores */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Top 5 colaboradores por custo total (empresa)</div>
                <div className="space-y-2">
                  {(() => {
                    const rows = folhaByEmployee
                      .map((f) => ({
                        id: f.id,
                        name: f.name,
                        total:
                          f.breakdown.salaryBruto +
                          f.breakdown.beneficiosTotal +
                          f.breakdown.encargosTotal +
                          f.breakdown.outrosCustosEmpresaTotal,
                      }))
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5);
                    const max = rows[0]?.total || 0;
                    return rows.map((row) => (
                      <div key={row.id} className="rounded-lg ring-1 ring-slate-200 p-2 bg-white/80">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 shrink-0 rounded-full bg-slate-200 text-[10px] font-semibold flex items-center justify-center">
                              {initials(row.name)}
                            </div>
                            <span className="text-sm truncate">{row.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrencyBRL(row.total)}</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-slate-700"
                            style={{ width: `${max ? Math.round((row.total / max) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel por CNPJ */}
      <div id="func-lista" className="space-y-4">
        {(["DEXPRESS", "FG", "GXP"] as const)
          .filter((c) => scope === "ALL" || scope === c)
          .map((companyKey) => {
            const list = employees.filter((e) => e.company === companyKey);
            if (!list.length) return null;
            return (
              <Card key={companyKey} className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle>
                    {companyKey} <span className="text-muted-foreground font-normal">({list.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map((e) => (
                      <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={""} />
                            <AvatarFallback className="text-[10px]">{initials(e.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{e.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{e.role.trim()} • {e.turno}</p>
                            <div className="mt-1">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(e.status)}`}>{e.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/operacional/funcionarios/${e.id}`}>Ver perfil</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
  );
}
