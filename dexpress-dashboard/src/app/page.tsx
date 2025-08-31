"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueExpenseChart } from "@/components/dashboard/charts/revenue-expense-chart";
import { PaymentStatusChart } from "@/components/dashboard/charts/payment-status-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import Image from "next/image";
import {
  getRevenueMTD,
  getExpenseMTD,
  getProfitMTD,
  getDeliveriesThisMonth,
  getEmployeesCount,
  getVehiclesCount,
} from "@/data/mock";
import { TrendingUp, Receipt, Wallet, Truck, Users, PackageCheck } from "lucide-react";
import { useScope } from "@/context/scope";

export default function Home() {
  const { scope } = useScope();
  const revenue = getRevenueMTD(scope);
  const expense = getExpenseMTD(scope);
  const profit = getProfitMTD(scope);
  const deliveries = getDeliveriesThisMonth(scope);
  const employees = getEmployeesCount(scope);
  const vehicles = getVehiclesCount(scope);
  return (
    <div className="space-y-6">
      {/* Banner topo */}
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/images/banner-home.png"
          alt="Bem-vindo ao painel DEXpress"
          width={1600}
          height={400}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Receita (mês)" value={`R$ ${revenue.toLocaleString("pt-BR")}`} delta={4.2} icon={TrendingUp} />
        <KpiCard title="Despesas (mês)" value={`R$ ${expense.toLocaleString("pt-BR")}`} delta={-2.1} icon={Receipt} />
        <KpiCard title="Lucro (mês)" value={`R$ ${profit.toLocaleString("pt-BR")}`} delta={3.1} icon={Wallet} />
        <KpiCard
          title="Entregas (mês)"
          value={deliveries}
          hint="Total de entregas concluídas"
          icon={PackageCheck}
          className="bg-[#F6D103] [&_*]:!text-white"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueExpenseChart />
        </div>
        <div className="lg:col-span-1">
          <PaymentStatusChart />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Funcionários" value={employees} icon={Users} />
        <KpiCard title="Veículos" value={vehicles} icon={Truck} />
      </div>
    </div>
  );
}
