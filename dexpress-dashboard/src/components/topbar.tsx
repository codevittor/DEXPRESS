"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useScope, type Scope } from "@/context/scope";
import { useDateFilter } from "@/context/dateFilter";

export function Topbar({ className }: { className?: string }) {
  const { scope, setScope } = useScope();
  const { period, setPeriod, from, to, setFrom, setTo } = useDateFilter();
  const isScope = (v: string): v is Scope => v === "ALL" || v === "DEXPRESS" || v === "FG" || v === "GXP";
  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 px-4 h-16 border-b border-border md:rounded-t-2xl",
        "bg-card supports-[backdrop-filter]:bg-card/80 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Image
          src="/images/logo-1.png"
          alt="DEXpress"
          width={196}
          height={56}
          quality={100}
          priority
          className="shrink-0"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Select value={scope} onValueChange={(v) => setScope(isScope(v) ? v : "ALL")}>
          <SelectTrigger size="sm" aria-label="Selecionar CNPJ">
            <SelectValue placeholder="Escopo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Geral (todos)</SelectItem>
            <SelectItem value="DEXPRESS">DEXPRESS</SelectItem>
            <SelectItem value="FG">FG</SelectItem>
            <SelectItem value="GXP">GXP</SelectItem>
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger size="sm" aria-label="Selecionar período">
            <SelectValue placeholder="Esse mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Apenas hoje</SelectItem>
            <SelectItem value="week">Essa semana</SelectItem>
            <SelectItem value="month">Esse mês</SelectItem>
            <SelectItem value="year">Esse ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        {period === "custom" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">De</label>
            <input
              type="date"
              value={from ?? ""}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
              aria-label="Data inicial"
            />
            <label className="text-xs text-muted-foreground">Até</label>
            <input
              type="date"
              value={to ?? ""}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
              aria-label="Data final"
            />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden sm:flex gap-1">
              <Plus className="h-4 w-4" />
              Nova ação
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/financeiro/receitas/nova">Nova receita</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/operacional/funcionarios/novo">Novo funcionário</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
