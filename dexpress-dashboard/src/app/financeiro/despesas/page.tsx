"use client";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Receipt, Download, PlusCircle, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useScope } from "@/context/scope";
import * as React from "react";
import { useDateFilter } from "@/context/dateFilter";
import { useDespesas } from "@/context/despesas";
import type { CompanyKey } from "@/data/mock";
import Link from "next/link";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function statusClasses(status: string) {
  switch (status) {
    case "Pago":
      return {
        badge: "text-[#2F2D76] bg-[#2F2D76]/10 ring-1 ring-[#2F2D76]/15",
        accent: "before:bg-[#2F2D76]",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      } as const;
    case "Pendente":
      return {
        badge: "text-amber-700 bg-amber-100 ring-1 ring-amber-200",
        accent: "before:bg-[#F6D103]",
        icon: <Clock3 className="h-3.5 w-3.5" />,
      } as const;
    case "Em atraso":
      return {
        badge: "text-rose-700 bg-rose-100 ring-1 ring-rose-200",
        accent: "before:bg-rose-500",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      } as const;
    default:
      return { badge: "text-slate-700 bg-slate-100 ring-1 ring-slate-200", accent: "before:bg-slate-300", icon: null } as const;
  }
}

export default function DespesasPage() {
  const { scope } = useScope();
  const { period, from: cFrom, to: cTo } = useDateFilter();
  const { despesas } = useDespesas();

  const rows = React.useMemo(() => despesas, [despesas]);
  const filteredRows = React.useMemo(() => {
    let arr = rows;
    if (scope !== "ALL") arr = arr.filter((r) => r.company === scope);

    // Date range
    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined = new Date();
    if (period === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      const day = (now.getDay() + 6) % 7;
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      fromDate = start;
    } else if (period === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      fromDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === "custom") {
      fromDate = cFrom ? new Date(cFrom) : undefined;
      toDate = cTo ? new Date(cTo) : undefined;
      if (toDate) toDate.setHours(23, 59, 59, 999);
    }
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    if (fromDate || toDate) {
      arr = arr.filter((r) => {
        const d = new Date(r.date);
        return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
      });
    }
    return arr;
  }, [rows, scope, period, cFrom, cTo]);

  const totalDespesas = React.useMemo(() => filteredRows.reduce((sum, t) => sum + t.amount, 0), [filteredRows]);
  const ticketMedio = React.useMemo(() => Math.round(totalDespesas / Math.max(1, filteredRows.length)), [totalDespesas, filteredRows.length]);

  return (
    <div className="space-y-6">
      {/* Header e ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Despesas</h1>
          <p className="text-sm text-muted-foreground">Monitore custos e fornecedores para manter a saúde financeira.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Exportar</Button>
          <Button asChild>
            <Link href="/financeiro/despesas/nova"><PlusCircle className="h-4 w-4 mr-2" /> Nova Despesa</Link>
          </Button>
        </div>
      </div>

      {/* KPIs (somente despesas) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total do período" value={currency(totalDespesas)} icon={Receipt} />
        <KpiCard title="Ticket médio" value={currency(ticketMedio)} />
        <KpiCard title="Qtde de despesas" value={String(filteredRows.length)} />
      </div>

      {/* Destaques */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="h-[360px] border-0 shadow-none">
            <CardHeader>
              <CardTitle>Maiores despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {filteredRows
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-1 ring-black/5">
                          <AvatarImage alt={t.client} src="" />
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">{initials(t.client)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{t.client}</p>
                          <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-rose-700">{currency(t.amount)}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de Despesas (visual) */}
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[420px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">Data</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">Fornecedor</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">Descrição</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground text-right">Valor</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">CNPJ</TableHead>
                <TableHead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(scope === "ALL" ? (["DEXPRESS","FG","GXP"] as CompanyKey[]) : ([scope] as CompanyKey[])).map((comp) => {
                const group = filteredRows.filter((r) => r.company === comp);
                if (group.length === 0) return null;
                return (
                  <React.Fragment key={comp}>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="bg-slate-50/80 text-slate-700 font-semibold border-y border-slate-100 sticky -top-px z-[1]">{comp}</TableCell>
                    </TableRow>
                    {group.map((t) => {
                      const s = statusClasses(t.status);
                      return (
                        <TableRow
                          key={t.id}
                          className={cn(
                            "relative group odd:bg-gray-50/60 even:bg-white transition-colors",
                            "hover:bg-white",
                            "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full",
                            s.accent
                          )}
                        >
                          <TableCell className="whitespace-nowrap text-sm text-slate-700">{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="max-w=[220px]">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-8 w-8 ring-1 ring-black/5">
                                <AvatarImage alt={t.client} src="" />
                                <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">{initials(t.client)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-900">{t.client}</div>
                                <div className="truncate text-xs text-slate-500 md:hidden">{t.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{t.description}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-rose-700">{currency(t.amount)}</TableCell>
                          <TableCell>
                            <Badge className={cn("px-2 py-1 text-xs font-medium ring-1", s.badge)}>{t.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">{t.company}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/financeiro/despesas/${t.id}/editar`}>Editar</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
