"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMonthlyData } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScope } from "@/context/scope";
import { useDateFilter } from "@/context/dateFilter";
import * as React from "react";

function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,   
  }).format(value);
}

export function RevenueExpenseChart() {
  const { scope } = useScope();
  const { period, from: cFrom, to: cTo } = useDateFilter();
  const base = getMonthlyData(scope);

  const monthOrder = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"] as const;
  const monthIndex = (m: string) => monthOrder.indexOf(m as (typeof monthOrder)[number]);

  const data = React.useMemo(() => {
    if (period === "year") return base;
    const now = new Date();
    if (period === "today" || period === "week" || period === "month") {
      const cur = monthOrder[now.getMonth()];
      return base.filter((d) => d.month === cur);
    }
    if (period === "custom") {
      const fromDate = cFrom ? new Date(cFrom) : undefined;
      const toDate = cTo ? new Date(cTo) : undefined;
      if (!fromDate && !toDate) return base;
      const fromM = fromDate ? fromDate.getMonth() : 0;
      const toM = toDate ? toDate.getMonth() : 11;
      const fromY = fromDate ? fromDate.getFullYear() : now.getFullYear();
      const toY = toDate ? toDate.getFullYear() : now.getFullYear();
      // If different years, include months from fromM..11 and 0..toM. Given base is one-year mock, show intersection with current year only
      if (fromY !== toY) {
        // Show current year months that overlap the range
        const curYearMonths = new Set<number>();
        const minM = fromY === now.getFullYear() ? fromM : 0;
        const maxM = toY === now.getFullYear() ? toM : 11;
        for (let i = minM; i <= maxM; i++) curYearMonths.add(i);
        return base.filter((d) => curYearMonths.has(monthIndex(d.month)));
      }
      const keep = new Set<number>();
      for (let i = fromM; i <= toM; i++) keep.add(i);
      return base.filter((d) => keep.has(monthIndex(d.month)));
    }
    return base;
  }, [base, period, cFrom, cTo]);
  return (
    <Card className="h-[360px] border-0 shadow-none">
      <CardHeader>
        <CardTitle>Receitas x Despesas (mensal)</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v: number) => currencyBRL(Number(v))} tickLine={false} axisLine={false} width={80} />
            <Tooltip
              formatter={(value: number, name: string) => [currencyBRL(value), name]}
              labelFormatter={(label) => `Mês: ${label}`}
              contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
            />
            <Area type="monotone" dataKey="receitas" name="Receitas" stroke="var(--chart-2)" fill="url(#colorRec)" strokeWidth={2} />
            <Area type="monotone" dataKey="despesas" name="Despesas" stroke="var(--chart-5)" fill="url(#colorDes)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
