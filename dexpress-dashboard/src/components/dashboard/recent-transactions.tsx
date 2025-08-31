"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRecentTransactions } from "@/data/mock";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { useScope } from "@/context/scope";
import { ScrollArea } from "@/components/ui/scroll-area";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function RecentTransactions() {
  const { scope } = useScope();
  const transactions = getRecentTransactions(scope);
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.amount >= 0) acc.in += t.amount;
      else acc.out += t.amount;
      acc.net += t.amount;
      return acc;
    },
    { in: 0, out: 0, net: 0 }
  );
  return (
    <Card className="border-0 shadow-none rounded-xl bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Transações Recentes</CardTitle>
            <p className="text-xs text-muted-foreground">Últimos lançamentos do escopo {scope || "geral"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5">Entradas {currency(totals.in)}</span>
            <span className="text-[11px] rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 px-2 py-0.5">Saídas {currency(Math.abs(totals.out))}</span>
            <span className="text-[11px] rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-2 py-0.5">Saldo {currency(totals.net)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0 min-h-0">
        <ScrollArea className="h-[420px] pr-5">
          <div className="pb-24">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground">Data</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground">Cliente</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhuma transação recente.</TableCell>
                  </TableRow>
                )}
                {transactions.map((t) => {
                  const s = statusClasses(t.status);
                  return (
                    <TableRow
                      key={t.id}
                      className={cn(
                        "relative group odd:bg-gray-50/60 even:bg-white transition-all",
                        "hover:bg-white hover:shadow-sm",
                        "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full",
                        s.accent
                      )}
                    >
                      <TableCell className="whitespace-nowrap text-sm text-slate-700">{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 ring-1 ring-black/5">
                            <AvatarImage alt={t.client} src={""} />
                            <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">{initials(t.client)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-slate-900">{t.client}</div>
                            <div className="truncate text-xs text-slate-500 md:hidden">{t.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-slate-600">{t.description}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1",
                            t.amount < 0
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          )}
                        >
                          {currency(t.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full", s.badge)} variant="secondary">
                          {s.icon}
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Spacer row to avoid clipping on rounded bottom */}
                <TableRow>
                  <TableCell colSpan={5} className="p-0 h-2"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
