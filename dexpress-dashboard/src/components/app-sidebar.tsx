"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  TrendingUp,
  Receipt,
  Truck,
  FileText,
  Settings,
  Building2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useScope } from "@/context/scope";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");
  const { scope } = useScope();
  const scopeLabel = scope === "ALL" ? "Geral" : scope;
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/images/foto-perfil.png" alt="Fernanda" />
            <AvatarFallback>F</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight">Fernanda</p>
            <div className="mt-1">
              <Badge variant="secondary">Escopo: {scopeLabel}</Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/">
                    <span className="relative flex items-center gap-2 py-2">
                      <Home />
                      <span>Dashboard</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/cnpjs") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/cnpjs">
                    <span className="relative flex items-center gap-2 py-2">
                      <Building2 />
                      <span>CNPJs</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/operacional/funcionarios") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/operacional/funcionarios">
                    <span className="relative flex items-center gap-2 py-2">
                      <Users />
                      <span>Funcionários</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/operacional/veiculos") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/operacional/veiculos">
                    <span className="relative flex items-center gap-2 py-2">
                      <Truck />
                      <span>Veículos</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/financeiro/receitas") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/financeiro/receitas">
                    <span className="relative flex items-center gap-2 py-2">
                      <TrendingUp />
                      <span>Receitas</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/financeiro/despesas") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/financeiro/despesas">
                    <span className="relative flex items-center gap-2 py-2">
                      <Receipt />
                      <span>Despesas</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/administracao/relatorios") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/administracao/relatorios">
                    <span className="relative flex items-center gap-2 py-2">
                      <FileText />
                      <span>Relatórios</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`font-medium rounded-lg transition-colors ${
                    isActive("/administracao/configuracoes") ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <Link href="/administracao/configuracoes">
                    <span className="relative flex items-center gap-2 py-2">
                      <Settings />
                      <span>Configurações</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Assistente IA no rodapé fixo */}
      <div className="sticky bottom-0 z-10 p-3 bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className={`group relative rounded-xl transition-colors font-medium btn-ia-shine ${
                isActive("/assistente")
                  ? "bg-[#F6D103] text-white hover:bg-[#F6D103]"
                  : "bg-[#F6D103] text-white hover:bg-[#F6D103]"
              }`}
            >
              <Link href="/assistente">
                <span className="relative flex items-center gap-2.5 px-3 py-3">
                  {isActive("/assistente") && (
                    <span className="sidebar-indicator absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-white rounded-full" />
                  )}
                  <Image
                    src="/images/foto-assistente.png"
                    alt="Assistente IA"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover border border-white"
                  />
                  <span className="font-semibold tracking-tight">Assistente IA</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}

export function WithSidebar({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
