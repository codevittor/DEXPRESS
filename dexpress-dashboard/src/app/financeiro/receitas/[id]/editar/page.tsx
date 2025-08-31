"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReceitas } from "@/context/receitas";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { type CompanyKey } from "@/data/mock";

export default function EditarReceitaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { receitas, updateReceita } = useReceitas();
  const receita = receitas.find((r) => r.id === params.id);

  const [date, setDate] = React.useState<string>(receita ? new Date(receita.date).toISOString().slice(0, 10) : "");
  const [client, setClient] = React.useState(receita?.client ?? "");
  const [description, setDescription] = React.useState(receita?.description ?? "");
  const [amount, setAmount] = React.useState<number>(receita?.amount ?? 0);
  const [status, setStatus] = React.useState<string>(receita?.status ?? "Pendente");
  const [company, setCompany] = React.useState<CompanyKey>((receita?.company as CompanyKey) ?? "DEXPRESS");

  React.useEffect(() => {
    if (!receita) return;
    setDate(new Date(receita.date).toISOString().slice(0, 10));
    setClient(receita.client);
    setDescription(receita.description);
    setAmount(receita.amount);
    setStatus(receita.status);
    setCompany(receita.company as CompanyKey);
  }, [receita?.id]);

  if (!receita) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Receita não encontrada</h1>
        <Button onClick={() => router.push("/financeiro/receitas")}>Voltar</Button>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateReceita(receita.id, {
      date: new Date(date).toISOString(),
      client,
      description,
      amount,
      status: status as any,
      company,
    });
    toast.success("Receita atualizada");
    router.push("/financeiro/receitas");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Editar Receita</h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Data</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">CNPJ</label>
                <Select value={company} onValueChange={(v) => setCompany(v as CompanyKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEXPRESS">DEXPRESS</SelectItem>
                    <SelectItem value="FG">FG</SelectItem>
                    <SelectItem value="GXP">GXP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cliente</label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Descrição</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do serviço" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Valor</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em atraso">Em atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
