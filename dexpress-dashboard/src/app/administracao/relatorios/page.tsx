"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueExpenseChart } from "@/components/dashboard/charts/revenue-expense-chart";
import { PaymentStatusChart } from "@/components/dashboard/charts/payment-status-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRecentTransactions } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import { useScope } from "@/context/scope";
import { useDateFilter } from "@/context/dateFilter";
import Link from "next/link";

function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export default function RelatoriosPage() {
  const { scope } = useScope();
  const { period, from: cFrom, to: cTo } = useDateFilter();
  const transactions = getRecentTransactions(scope);

  // Global date filter application
  const filteredTransactions = (() => {
    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined = new Date();

    if (period === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      const day = (now.getDay() + 6) % 7; // Monday=0
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

    if (!fromDate && !toDate) return transactions;
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
    });
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visão consolidada de resultados e performance operacional/financeira.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><RefreshCw size={16}/> Atualizar</Button>
          <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76] gap-2"><FileDown size={16}/> Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueExpenseChart />
        <PaymentStatusChart />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas e despesas recentes</CardTitle>
          <CardDescription>Transações financeiras dos últimos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{t.client}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className={`text-right ${t.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>{t.amount < 0 ? "-" : "+"}{currencyBRL(Math.abs(t.amount))}</TableCell>
                  <TableCell>{t.status}</TableCell>
                  <TableCell className="text-right">
                    {t.amount > 0 ? (
                      <Button asChild size="sm" variant="outline" className="h-8 px-3">
                        <Link href={`/financeiro/receitas/${t.id}/editar`}>Editar</Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Despesa</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
