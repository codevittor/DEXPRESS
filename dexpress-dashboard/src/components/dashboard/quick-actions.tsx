"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Receipt, TrendingUp, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const actions = [
    {
      label: "Novo Funcionário",
      icon: Users,
      onClick: () => toast.success("Abrindo cadastro de funcionário..."),
    },
    {
      label: "Nova Despesa",
      icon: Receipt,
      onClick: () => toast.info("Abrindo lançamento de despesa..."),
    },
    {
      label: "Nova Receita",
      icon: TrendingUp,
      onClick: () => toast.info("Abrindo lançamento de receita..."),
    },
    {
      label: "Agendar Entrega",
      icon: CalendarPlus,
      onClick: () => toast("Abrindo agenda de entregas..."),
    },
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((a) => (
            <Button key={a.label} variant="outline" className="justify-start gap-2" onClick={a.onClick}>
              <a.icon className="h-4 w-4" /> {a.label}
            </Button>
          ))}
        </div>
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground">
          Dica: use a busca acima para encontrar funcionários, veículos, clientes e pedidos rapidamente.
        </p>
      </CardContent>
    </Card>
  );
}
