"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";
import { getPaymentStatusCounts } from "@/data/mock";
import { useScope } from "@/context/scope";

const COLORS = {
  Pago: "var(--chart-2)",
  Pendente: "var(--chart-4)",
  "Em atraso": "var(--chart-5)",
} as const;

export function PaymentStatusChart() {
  const { scope } = useScope();
  const data = React.useMemo(() => getPaymentStatusCounts(scope), [scope]);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="h-[360px] border-0 shadow-none">
      <CardHeader>
        <CardTitle>Status de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 0, bottom: 36, left: 0 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={100}
              paddingAngle={4}
              cornerRadius={6}
              startAngle={90}
              endAngle={450}
              cy="44%"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centro do donut */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Títulos</div>
            <div className="text-2xl font-semibold">{total}</div>
          </div>
        </div>
        {/* Legenda customizada */}
        {total === 0 ? (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>
        ) : (
          <div className="absolute bottom-2 left-0 right-0 flex flex-wrap items-center justify-center gap-2 text-xs">
            {data.map((entry) => {
              const pct = total ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[entry.name] }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-medium">{pct}%</span>
                  <span className="text-muted-foreground">({entry.value})</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
