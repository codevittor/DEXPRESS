"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// removed Textarea for benefícios; using structured inputs
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,  BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import { employees, type CompanyKey, type EmployeeStatus } from "@/data/mock";
import { Users, Pencil, Plus, Trash2 } from "lucide-react";

const companies: CompanyKey[] = ["DEXPRESS", "FG", "GXP"];  
const statuses: EmployeeStatus[] = ["Ativo", "Férias", "Afastado"];
const roles = ["Motorista", "Ajudante", " Administrativo", "Operacional"] as const;
const turnos = ["Diurno", "Noturno"] as const;

function toDateInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return "";
  }
}

export default function EditarFuncionarioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const emp = employees.find((e) => e.id === params.id);

  const [form, setForm] = React.useState(() => {
    if (!emp) {
      return {
        name: "",
        company: "DEXPRESS" as CompanyKey,
        role: roles[0],
        status: statuses[0] as EmployeeStatus,
        turno: turnos[0],
        salary: "",
        valeTransporte: true,
        outrosDescontos: "",
        cnhVencimento: "",
        asoVencimento: "",
        beneficios: [{ name: "", amount: "" }] as { name: string; amount: string }[],
        outrosCustosEmpresa: [] as { name: string; amount: string }[],
      };
    }
    return {
      name: emp.name,
      company: emp.company,
      role: emp.role as (typeof roles)[number],
      status: emp.status,
      turno: emp.turno as (typeof turnos)[number],
      salary: String(emp.salary ?? ""),
      valeTransporte: Boolean(emp.valeTransporte),
      outrosDescontos: String(emp.outrosDescontos ?? ""),
      cnhVencimento: toDateInput(emp.cnhVencimento),
      asoVencimento: toDateInput(emp.asoVencimento),
      beneficios: (emp.beneficios ?? []).length
        ? (emp.beneficios ?? []).map((b) => ({ name: b.name, amount: String(b.amount) }))
        : [{ name: "", amount: "" }],
      outrosCustosEmpresa: (emp.outrosCustosEmpresa ?? []).map((c) => ({ name: c.name, amount: String(c.amount) })),
    };
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Como é mock, apenas simulamos atualização e voltamos ao perfil
    router.push(`/operacional/funcionarios/${params.id}`);
  }

  function addBeneficio() {
    setForm((f: any) => ({ ...f, beneficios: [...f.beneficios, { name: "", amount: "" }] }));
  }
  function removeBeneficio(idx: number) {
    setForm((f: any) => ({ ...f, beneficios: f.beneficios.filter((_: any, i: number) => i !== idx) }));
  }
  function updateBeneficio(idx: number, key: "name" | "amount", val: string) {
    setForm((f: any) => ({
      ...f,
      beneficios: f.beneficios.map((b: any, i: number) => (i === idx ? { ...b, [key]: val } : b)),
    }));
  }
  function addOutroCusto() {
    setForm((f: any) => ({ ...f, outrosCustosEmpresa: [...f.outrosCustosEmpresa, { name: "", amount: "" }] }));
  }
  function removeOutroCusto(idx: number) {
    setForm((f: any) => ({ ...f, outrosCustosEmpresa: f.outrosCustosEmpresa.filter((_: any, i: number) => i !== idx) }));
  }
  function updateOutroCusto(idx: number, key: "name" | "amount", val: string) {
    setForm((f: any) => ({
      ...f,
      outrosCustosEmpresa: f.outrosCustosEmpresa.map((c: any, i: number) => (i === idx ? { ...c, [key]: val } : c)),
    }));
  }

  if (!emp) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/operacional/funcionarios">Funcionários</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Funcionário não encontrado</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="border-0 shadow-none">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Registro não encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/operacional/funcionarios">Funcionários</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/operacional/funcionarios/${emp.id}`}>{emp.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Editar</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Editar Funcionário</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/operacional/funcionarios/${emp.id}`}>Voltar</Link>
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Pencil className="h-4 w-4" /> Dados do Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 grid-cols-1 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v as CompanyKey })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as (typeof roles)[number] })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r.trim()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EmployeeStatus })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={form.turno} onValueChange={(v) => setForm({ ...form, turno: v as (typeof turnos)[number] })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {turnos.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salário bruto (R$)</Label>
              <Input id="salary" type="number" min="0" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outrosDescontos">Outros descontos (R$)</Label>
              <Input id="outrosDescontos" type="number" min="0" step="0.01" value={form.outrosDescontos} onChange={(e) => setForm({ ...form, outrosDescontos: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnh">CNH vencimento</Label>
              <Input id="cnh" type="date" value={form.cnhVencimento} onChange={(e) => setForm({ ...form, cnhVencimento: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aso">ASO vencimento</Label>
              <Input id="aso" type="date" value={form.asoVencimento} onChange={(e) => setForm({ ...form, asoVencimento: e.target.value })} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vt">Vale transporte</Label>
                <Switch id="vt" checked={form.valeTransporte} onCheckedChange={(v) => setForm({ ...form, valeTransporte: v })} />
              </div>
            </div>

            {/* Benefícios (estruturados) */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Benefícios</Label>
                <Button type="button" size="sm" variant="outline" onClick={addBeneficio}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {form.beneficios.map((b: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-7 space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input value={b.name} onChange={(e) => updateBeneficio(idx, "name", e.target.value)} placeholder="Ex.: Cesta básica" />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input type="number" min="0" step="0.01" value={b.amount} onChange={(e) => updateBeneficio(idx, "amount", e.target.value)} placeholder="0,00" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBeneficio(idx)} aria-label="Remover benefício">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outros custos (empresa) - opcional */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Outros custos (empresa)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addOutroCusto}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {(form.outrosCustosEmpresa as any[]).map((c: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-7 space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input value={c.name} onChange={(e) => updateOutroCusto(idx, "name", e.target.value)} placeholder="Ex.: Uniformes" />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input type="number" min="0" step="0.01" value={c.amount} onChange={(e) => updateOutroCusto(idx, "amount", e.target.value)} placeholder="0,00" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOutroCusto(idx)} aria-label="Remover custo">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href={`/operacional/funcionarios/${emp.id}`}>Cancelar</Link>
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
