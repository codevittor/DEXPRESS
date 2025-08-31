"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useDespesas } from "@/context/despesas";
import type { CompanyKey } from "@/data/mock";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function NovaDespesaPage() {
  const router = useRouter();
  const { addDespesa } = useDespesas();
  const [form, setForm] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    client: "",
    description: "",
    amount: 0,
    status: "Pendente" as "Pago" | "Pendente" | "Em atraso",
    company: "DEXPRESS" as CompanyKey,
  });

  function toISO(d: string) {
    try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
  }

  const onSave = () => {
    const id = addDespesa({
      date: toISO(form.date),
      client: form.client,
      description: form.description,
      amount: Number(form.amount),
      status: form.status,
      company: form.company,
    });
    router.push(`/financeiro/despesas/${id}/editar`);
  };

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/financeiro/despesas">Despesas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Nova</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Nova Despesa</CardTitle>
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
