"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}

 
/* Legacy content (disabled):

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Search } from "lucide-react";

type ClienteStatus = "Ativo" | "Inadimplente" | "Inativo";

type Cliente = {
  id: string;
  nome: string;
  cnpj: string;
  segmento: string;
  cidade: string;
  faturamentoMensal: number;
  status: ClienteStatus;
};

type StatusFilter = "Todos" | ClienteStatus;

function isStatusFilter(v: string): v is StatusFilter {
  return v === "Todos" || v === "Ativo" || v === "Inadimplente" || v === "Inativo";
}

*/

/*
const clientesMock: Cliente[] = [
  { id: "CLI-001", nome: "Supermercado Boa Compra", cnpj: "12.345.678/0001-90", segmento: "Varejo", cidade: "São Paulo", faturamentoMensal: 52000, status: "Ativo" },
  { id: "CLI-002", nome: "Construtora Alfa", cnpj: "98.765.432/0001-10", segmento: "Construção", cidade: "Campinas", faturamentoMensal: 87000, status: "Inadimplente" },
  { id: "CLI-003", nome: "Farmácias Vida", cnpj: "45.678.912/0001-33", segmento: "Saúde", cidade: "Santos", faturamentoMensal: 43000, status: "Ativo" },
  { id: "CLI-004", nome: "Auto Peças Rocha", cnpj: "31.222.333/0001-44", segmento: "Autopeças", cidade: "Guarulhos", faturamentoMensal: 21000, status: "Inativo" },
  { id: "CLI-005", nome: "Eletro Mais", cnpj: "54.111.222/0001-55", segmento: "Eletro", cidade: "Osasco", faturamentoMensal: 69000, status: "Ativo" },
  { id: "CLI-006", nome: "Bebidas Delta", cnpj: "77.888.999/0001-66", segmento: "Bebidas", cidade: "Barueri", faturamentoMensal: 38000, status: "Ativo" },
  { id: "CLI-007", nome: "Moda Bella", cnpj: "22.333.444/0001-77", segmento: "Moda", cidade: "São Paulo", faturamentoMensal: 27500, status: "Inadimplente" },
  { id: "CLI-008", nome: "TechNow", cnpj: "66.555.444/0001-88", segmento: "Tecnologia", cidade: "Santo André", faturamentoMensal: 91000, status: "Ativo" },
  { id: "CLI-009", nome: "Pet Feliz", cnpj: "12.111.222/0001-99", segmento: "Pet", cidade: "São Bernardo", faturamentoMensal: 16500, status: "Ativo" },
  { id: "CLI-010", nome: "Casa & Construção", cnpj: "10.101.202/0001-01", segmento: "Construção", cidade: "Diadema", faturamentoMensal: 45500, status: "Inativo" },
  { id: "CLI-011", nome: "Verde & Cia", cnpj: "20.303.404/0001-02", segmento: "Jardinagem", cidade: "Mogi das Cruzes", faturamentoMensal: 14200, status: "Ativo" },
  { id: "CLI-012", nome: "Office Prime", cnpj: "30.505.606/0001-03", segmento: "Papelaria", cidade: "São Paulo", faturamentoMensal: 32700, status: "Ativo" },
];

function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export default function ClientesPageLegacy() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<"Todos" | ClienteStatus>("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtrados = useMemo(() => {
    return clientesMock.filter((c) => {
      const mBusca = busca.trim().toLowerCase();
      const matchBusca = !mBusca ||
        c.nome.toLowerCase().includes(mBusca) ||
        c.cnpj.toLowerCase().includes(mBusca) ||
        c.segmento.toLowerCase().includes(mBusca) ||
        c.cidade.toLowerCase().includes(mBusca);
      const matchStatus = status === "Todos" || c.status === status;
      return matchBusca && matchStatus;
    });
  }, [busca, status]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const current = filtrados.slice((page - 1) * pageSize, page * pageSize);

  const totais = useMemo(() => {
    const ativos = clientesMock.filter((c) => c.status === "Ativo").length;
    const inad = clientesMock.filter((c) => c.status === "Inadimplente").length;
    const inativos = clientesMock.filter((c) => c.status === "Inativo").length;
    const faturamento = clientesMock.reduce((s, c) => s + c.faturamentoMensal, 0);
    return { ativos, inad, inativos, faturamento };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes, contratos e faturamento.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F6D103] text-white hover:bg-[#F6D103] gap-2">
              <Plus size={18} /> Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar cliente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome/Razão Social</Label>
                <Input placeholder="Ex: Supermercado Boa Compra" />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <Label>Segmento</Label>
                <Input placeholder="Ex: Varejo" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input placeholder="Ex: São Paulo" />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue="Ativo">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Faturamento mensal (R$)</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76]" onClick={() => setDialogOpen(false)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clientes ativos</CardTitle></CardHeader>
          <CardContent className="pt-0"><div className="text-2xl font-semibold">{totais.ativos}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inadimplentes</CardTitle></CardHeader>
          <CardContent className="pt-0"><div className="text-2xl font-semibold">{totais.inad}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inativos</CardTitle></CardHeader>
          <CardContent className="pt-0"><div className="text-2xl font-semibold">{totais.inativos}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Faturamento mensal (estimado)</CardTitle></CardHeader>
          <CardContent className="pt-0"><div className="text-2xl font-semibold">{currencyBRL(totais.faturamento)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de clientes</CardTitle>
              <CardDescription>Pesquisa, filtros e ações rápidas</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input className="pl-9" placeholder="Buscar por nome, CNPJ, segmento..." value={busca} onChange={(e) => { setPage(1); setBusca(e.target.value); }} />
              </div>
              <Select value={status} onValueChange={(v) => { setPage(1); if (isStatusFilter(v)) setStatus(v); }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.cnpj}</TableCell>
                  <TableCell>{c.segmento}</TableCell>
                  <TableCell>{c.cidade}</TableCell>
                  <TableCell>{currencyBRL(c.faturamentoMensal)}</TableCell>
                  <TableCell>
                    {c.status === "Ativo" && <Badge className="bg-green-600 text-white">Ativo</Badge>}
                    {c.status === "Inadimplente" && <Badge className="bg-amber-500 text-white">Inadimplente</Badge>}
                    {c.status === "Inativo" && <Badge variant="secondary">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {current.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(current.length && (page - 1) * pageSize + 1) || 0}–{(page - 1) * pageSize + current.length} de {filtrados.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
              <div className="text-sm">Página {page} de {totalPages}</div>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users size={18} /> Dicas para sucesso com clientes</CardTitle>
          <CardDescription>Boas práticas para retenção e satisfação</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4">
            <div className="font-medium">Onboarding claro</div>
            <p className="text-sm text-muted-foreground">Defina SLA, contatos e metas de serviço já no início do contrato.</p>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Feedback contínuo</div>
            <p className="text-sm text-muted-foreground">Coleta periódica de NPS e reuniões de alinhamento trimestrais.</p>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Visibilidade</div>
            <p className="text-sm text-muted-foreground">Compartilhe relatórios de entregas, ocorrências e indicadores-chave.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

*/
