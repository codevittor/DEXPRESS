import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { employees } from "@/data/mock";
import { breakdownFolha, formatCurrencyBRL } from "@/lib/payroll";
import { Calendar, IdCard } from "lucide-react";
import { format } from "date-fns";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function statusBadgeClasses(status: string) {
  if (status === "Ativo") return "text-emerald-700 border-emerald-200 bg-emerald-50";
  if (status === "Férias") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-rose-700 border-rose-200 bg-rose-50";
}

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const emp = employees.find((e) => e.id === params.id);
  if (!emp) return notFound();

  const folha = breakdownFolha({
    salario: emp.salary,
    valeTransporte: emp.valeTransporte,
    outrosDescontos: emp.outrosDescontos,
    beneficios: emp.beneficios,
    outrosCustosEmpresa: emp.outrosCustosEmpresa,
  });

  const totalEmpresa = folha.salaryBruto + folha.encargosTotal + folha.beneficiosTotal + folha.outrosCustosEmpresaTotal;
  const pct = (n: number) => (totalEmpresa > 0 ? Math.round((n / totalEmpresa) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/operacional/funcionarios">Funcionários</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{emp.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12 ring-1 ring-black/5">
            <AvatarImage alt={emp.name} src="" />
            <AvatarFallback className="bg-slate-100 text-slate-700">{initials(emp.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">{emp.name}</h1>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
              <span>{emp.role.trim()} • {emp.turno} • {emp.company}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs"><IdCard className="h-3.5 w-3.5" />{emp.id}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusBadgeClasses(emp.status)}>{emp.status}</Badge>
              <Badge variant="outline" className="text-slate-700 border-slate-200"><Calendar className="h-3.5 w-3.5" /> CNH: {format(new Date(emp.cnhVencimento), "dd/MM/yyyy")}</Badge>
              <Badge variant="outline" className="text-slate-700 border-slate-200"><Calendar className="h-3.5 w-3.5" /> ASO: {format(new Date(emp.asoVencimento), "dd/MM/yyyy")}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/operacional/funcionarios/${emp.id}/editar`}>Editar</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/operacional/funcionarios">Voltar</Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Resumo de valores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Salário Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyBRL(folha.salaryBruto)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Salário Líquido (aprox.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyBRL(folha.salarioLiquido)}</div>
            <p className="text-xs text-muted-foreground mt-1">Bruto - descontos do funcionário</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Encargos Totais (empresa)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyBRL(folha.encargosTotal)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Benefícios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyBRL(folha.beneficiosTotal)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outros custos (empresa)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyBRL(folha.outrosCustosEmpresaTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Custo Total empresa */}
      <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Custo Total (empresa)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold leading-tight tracking-tight">{formatCurrencyBRL(totalEmpresa)}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Bruto + encargos + benefícios + outros custos</p>
          {/* Mini distribuição */}
          <div className="mt-4 space-y-2">
            <div className="flex h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-2 bg-indigo-600" style={{ width: `${totalEmpresa ? Math.round((folha.salaryBruto / totalEmpresa) * 100) : 0}%` }} />
              <div className="h-2 bg-slate-700" style={{ width: `${totalEmpresa ? Math.round((folha.encargosTotal / totalEmpresa) * 100) : 0}%` }} />
              <div className="h-2 bg-amber-500" style={{ width: `${totalEmpresa ? Math.round((folha.beneficiosTotal / totalEmpresa) * 100) : 0}%` }} />
              <div className="h-2 bg-rose-500" style={{ width: `${totalEmpresa ? Math.round((folha.outrosCustosEmpresaTotal / totalEmpresa) * 100) : 0}%` }} />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" /> Bruto: <span className="font-medium">{formatCurrencyBRL(folha.salaryBruto)}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-700" /> Encargos: <span className="font-medium">{formatCurrencyBRL(folha.encargosTotal)}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Benefícios: <span className="font-medium">{formatCurrencyBRL(folha.beneficiosTotal)}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 ring-1 ring-slate-200 px-2 py-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Outros: <span className="font-medium">{formatCurrencyBRL(folha.outrosCustosEmpresaTotal)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Descontos no Funcionário */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Descontos no Funcionário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>INSS</span><span className="font-medium">{formatCurrencyBRL(folha.inss)}</span></div>
            <div className="flex items-center justify-between"><span>IRRF</span><span className="font-medium">{formatCurrencyBRL(folha.irrf)}</span></div>
            <div className="flex items-center justify-between"><span>Vale transporte</span><span className="font-medium">{formatCurrencyBRL(folha.vt)}</span></div>
            <div className="flex items-center justify-between"><span>Outros descontos</span><span className="font-medium">{formatCurrencyBRL(folha.outrosDescontos)}</span></div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Total descontos</span><span className="font-semibold">{formatCurrencyBRL(folha.descontosTotal)}</span></div>
          </CardContent>
        </Card>

        {/* Encargos da Empresa */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Encargos da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>INSS patronal (20%)</span><span className="font-medium">{formatCurrencyBRL(folha.inssPatronal20)}</span></div>
            <div className="flex items-center justify-between"><span>FGTS (8%)</span><span className="font-medium">{formatCurrencyBRL(folha.fgts8)}</span></div>
            <div className="flex items-center justify-between"><span>RAT (2%)</span><span className="font-medium">{formatCurrencyBRL(folha.rat2)}</span></div>
            <div className="flex items-center justify-between"><span>Terceiros (~5,8%)</span><span className="font-medium">{formatCurrencyBRL(folha.terceiros58)}</span></div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Encargos totais</span><span className="font-semibold">{formatCurrencyBRL(folha.encargosTotal)}</span></div>
          </CardContent>
        </Card>

        {/* Benefícios / Bonificações */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Benefícios / Bonificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(emp.beneficios && emp.beneficios.length > 0) ? (
              <div className="space-y-2">
                {emp.beneficios!.map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span>{b.name}</span>
                    <span className="font-medium">{formatCurrencyBRL(b.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem benefícios cadastrados</p>
            )}
            <div className="mt-3 h-px bg-slate-200" />
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Total benefícios</span><span className="font-semibold">{formatCurrencyBRL(folha.beneficiosTotal)}</span></div>
          </CardContent>
        </Card>

        {/* Outros custos (empresa) */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Outros custos (empresa)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(emp.outrosCustosEmpresa && emp.outrosCustosEmpresa.length > 0) ? (
              <div className="space-y-2">
                {emp.outrosCustosEmpresa!.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="font-medium">{formatCurrencyBRL(c.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem outros custos</p>
            )}
            <div className="mt-3 h-px bg-slate-200" />
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Total outros custos</span><span className="font-semibold">{formatCurrencyBRL(folha.outrosCustosEmpresaTotal)}</span></div>
          </CardContent>
        </Card>

        {/* Distribuição do Custo */}
        <Card className="rounded-xl border-0 ring-1 ring-slate-200 shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição do Custo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              {label: "Bruto", val: folha.salaryBruto, color: "bg-indigo-600"},
              {label: "Encargos", val: folha.encargosTotal, color: "bg-slate-700"},
              {label: "Benefícios", val: folha.beneficiosTotal, color: "bg-amber-500"},
              {label: "Outros custos", val: folha.outrosCustosEmpresaTotal, color: "bg-rose-500"},
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span className="font-medium">{formatCurrencyBRL(row.val)} • {pct(row.val)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct(row.val)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
