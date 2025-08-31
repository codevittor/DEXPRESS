"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useDespesas } from "@/context/despesas";
import type { CompanyKey } from "@/data/mock";

function toDateInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export default function EditarDespesaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { despesas, updateDespesa } = useDespesas();
  const item = despesas.find((d) => d.id === params.id);

  React.useEffect(() => {
    if (!item) router.replace("/financeiro/despesas");
  }, [item, router]);

  const [form, setForm] = React.useState(() => ({
    date: item ? toDateInput(item.date) : new Date().toISOString().slice(0, 10),
    client: item?.client ?? "",
    description: item?.description ?? "",
    amount: item?.amount ?? 0,
    status: (item?.status ?? "Pendente") as "Pago" | "Pendente" | "Em atraso",
    company: (item?.company ?? "DEXPRESS") as CompanyKey,
  }));

  if (!item) return null;

  const onSave = () => {
    updateDespesa(item.id, {
      date: new Date(form.date).toISOString(),
      client: form.client,
      description: form.description,
      amount: Number(form.amount),
      status: form.status,
      company: form.company,
    });
    router.push("/financeiro/despesas");
  };

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/financeiro/despesas">Despesas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Editar</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Editar Despesa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em atraso">Em atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Fornecedor</Label>
              <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Valor</Label>
              <Input type="number" min={0} step={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v as CompanyKey })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEXPRESS">DEXPRESS</SelectItem>
                  <SelectItem value="FG">FG</SelectItem>
                  <SelectItem value="GXP">GXP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push("/financeiro/despesas")}>Cancelar</Button>
            <Button onClick={onSave}>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
