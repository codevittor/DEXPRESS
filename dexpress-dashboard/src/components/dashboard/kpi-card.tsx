"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: string | number;
  delta?: number; // positive for up, negative for down
  icon?: LucideIcon;
  className?: string;
  hint?: string;
};

export function KpiCard({ title, value, delta, icon: Icon, className, hint }: KpiCardProps) {
  const isUp = (delta ?? 0) >= 0;
  const deltaAbs = Math.abs(delta ?? 0).toFixed(1);

  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {delta !== undefined ? (
          <p className={cn("text-xs mt-1 flex items-center gap-1", isUp ? "text-emerald-600" : "text-rose-600")}> 
            {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {deltaAbs}% {isUp ? "acima" : "abaixo"} do período
          </p>
        ) : hint ? (
          <p className="text-xs mt-1 text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
