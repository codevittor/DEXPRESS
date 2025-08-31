export type PaymentStatus = "Pago" | "Pendente" | "Em atraso";
export type CompanyKey = "DEXPRESS" | "FG" | "GXP";
export type Scope = "ALL" | CompanyKey;

export type Transaction = {
  id: string;
  date: string; // ISO
  client: string;
  description: string;
  amount: number; // positive revenue, negative expense
  status: PaymentStatus;
};

// Multi-CNPJ para transações
export type TransactionWithCompany = Transaction & { company: CompanyKey };

export const monthlyData: { month: string; receitas: number; despesas: number }[] = [
  { month: "Jan", receitas: 120000, despesas: 68000 },
  { month: "Fev", receitas: 98000, despesas: 62000 },
  { month: "Mar", receitas: 131000, despesas: 79000 },
  { month: "Abr", receitas: 115000, despesas: 72000 },
  { month: "Mai", receitas: 141000, despesas: 88000 },
  { month: "Jun", receitas: 152000, despesas: 91000 },
  { month: "Jul", receitas: 147000, despesas: 94000 },
  { month: "Ago", receitas: 158000, despesas: 97000 },
  { month: "Set", receitas: 149000, despesas: 93000 },
  { month: "Out", receitas: 162000, despesas: 99000 },
  { month: "Nov", receitas: 170000, despesas: 102000 },
  { month: "Dez", receitas: 182000, despesas: 112000 },
];

// Distribuição simples para gerar séries mensais por CNPJ a partir da série total
const companyShare: Record<CompanyKey, number> = { DEXPRESS: 0.7, FG: 0.18, GXP: 0.12 };

export function getMonthlyData(scope: Scope): { month: string; receitas: number; despesas: number }[] {
  if (scope === "ALL") return monthlyData;
  const share = companyShare[scope];
  return monthlyData.map((m) => ({
    month: m.month,
    receitas: Math.round(m.receitas * share),
    despesas: Math.round(m.despesas * share),
  }));
}

// ===== Operacional Mock Data =====
export type EmployeeStatus = "Ativo" | "Férias" | "Afastado";
export type Employee = {
  id: string;
  name: string;
  role: "Motorista" | "Ajudante" | " Administrativo" | "Operacional";
  status: EmployeeStatus;
  cnhVencimento: string; // ISO
  asoVencimento: string; // ISO
  turno: "Diurno" | "Noturno";
  // Dados de folha (mock / estimativas)
  salary: number; // Salário bruto (R$)
  valeTransporte?: boolean; // Aplica desconto de até 6%
  outrosDescontos?: number; // Outros descontos no funcionário (R$)
  beneficios?: { name: string; amount: number }[]; // Custos para a empresa
  outrosCustosEmpresa?: { name: string; amount: number }[]; // Personalizados (empresa)
};

// Multi-CNPJ: cada registro inclui company
export type EmployeeWithCompany = Employee & { company: CompanyKey };
export const employees: EmployeeWithCompany[] = [
  // DEXPRESS (10 funcionários: aqui exemplificamos alguns)
  { id: "DEX-EMP-001", company: "DEXPRESS", name: "Carlos Souza", role: "Motorista", status: "Ativo", cnhVencimento: new Date(Date.now() + 90*86400000).toISOString(), asoVencimento: new Date(Date.now() + 45*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true, beneficios: [{ name: "Ifood corporativo", amount: 300 }, { name: "Cesta básica", amount: 180 }], outrosCustosEmpresa: [{ name: "Uniformes", amount: 60 }] },
  { id: "DEX-EMP-002", company: "DEXPRESS", name: "Mariana Lima", role: "Ajudante", status: "Ativo", cnhVencimento: new Date(Date.now() + 120*86400000).toISOString(), asoVencimento: new Date(Date.now() + 60*86400000).toISOString(), turno: "Noturno", salary: 2200, valeTransporte: true },
  { id: "DEX-EMP-003", company: "DEXPRESS", name: "João Pereira", role: "Motorista", status: "Férias", cnhVencimento: new Date(Date.now() + 15*86400000).toISOString(), asoVencimento: new Date(Date.now() + 120*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true },
  { id: "DEX-EMP-004", company: "DEXPRESS", name: "Ana Beatriz", role: " Administrativo", status: "Ativo", cnhVencimento: new Date(Date.now() + 365*86400000).toISOString(), asoVencimento: new Date(Date.now() + 200*86400000).toISOString(), turno: "Diurno", salary: 3500, valeTransporte: false, beneficios: [{ name: "Plano de saúde", amount: 450 }, { name: "Cesta básica", amount: 180 }], outrosCustosEmpresa: [{ name: "Ferramentas de trabalho", amount: 120 }] },
  { id: "DEX-EMP-005", company: "DEXPRESS", name: "Rafael Santos", role: "Operacional", status: "Afastado", cnhVencimento: new Date(Date.now() + 300*86400000).toISOString(), asoVencimento: new Date(Date.now() + 10*86400000).toISOString(), turno: "Noturno", salary: 2800, valeTransporte: true },
  { id: "DEX-EMP-006", company: "DEXPRESS", name: "Fernanda Alves", role: "Motorista", status: "Ativo", cnhVencimento: new Date(Date.now() + 5*86400000).toISOString(), asoVencimento: new Date(Date.now() + 90*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true },
  { id: "DEX-EMP-007", company: "DEXPRESS", name: "Thiago Gomes", role: "Operacional", status: "Ativo", cnhVencimento: new Date(Date.now() + 200*86400000).toISOString(), asoVencimento: new Date(Date.now() + 80*86400000).toISOString(), turno: "Diurno", salary: 2800, valeTransporte: true },
  { id: "DEX-EMP-008", company: "DEXPRESS", name: "Beatriz Nunes", role: " Administrativo", status: "Ativo", cnhVencimento: new Date(Date.now() + 320*86400000).toISOString(), asoVencimento: new Date(Date.now() + 180*86400000).toISOString(), turno: "Noturno", salary: 3500, valeTransporte: false },
  { id: "DEX-EMP-009", company: "DEXPRESS", name: "Pedro Henrique", role: "Motorista", status: "Ativo", cnhVencimento: new Date(Date.now() + 60*86400000).toISOString(), asoVencimento: new Date(Date.now() + 70*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true },
  { id: "DEX-EMP-010", company: "DEXPRESS", name: "Larissa Costa", role: "Operacional", status: "Ativo", cnhVencimento: new Date(Date.now() + 45*86400000).toISOString(), asoVencimento: new Date(Date.now() + 90*86400000).toISOString(), turno: "Noturno", salary: 2800, valeTransporte: true },
  // FG (3)
  { id: "FG-EMP-001", company: "FG", name: "Ricardo Alves", role: "Motorista", status: "Ativo", cnhVencimento: new Date(Date.now() + 210*86400000).toISOString(), asoVencimento: new Date(Date.now() + 120*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true },
  { id: "FG-EMP-002", company: "FG", name: "Aline Rocha", role: "Operacional", status: "Ativo", cnhVencimento: new Date(Date.now() + 400*86400000).toISOString(), asoVencimento: new Date(Date.now() + 250*86400000).toISOString(), turno: "Noturno", salary: 2800, valeTransporte: true },
  { id: "FG-EMP-003", company: "FG", name: "Marcos Paulo", role: "Motorista", status: "Férias", cnhVencimento: new Date(Date.now() + 30*86400000).toISOString(), asoVencimento: new Date(Date.now() + 180*86400000).toISOString(), turno: "Diurno", salary: 3000, valeTransporte: true },
  // GXP (2)
  { id: "GXP-EMP-001", company: "GXP", name: "Sofia Mendes", role: "Operacional", status: "Ativo", cnhVencimento: new Date(Date.now() + 90*86400000).toISOString(), asoVencimento: new Date(Date.now() + 60*86400000).toISOString(), turno: "Diurno", salary: 2800, valeTransporte: true },
  { id: "GXP-EMP-002", company: "GXP", name: "Diego Ferreira", role: "Motorista", status: "Ativo", cnhVencimento: new Date(Date.now() + 75*86400000).toISOString(), asoVencimento: new Date(Date.now() + 120*86400000).toISOString(), turno: "Noturno", salary: 3000, valeTransporte: true },
];

export type VehicleStatus = "Operação" | "Manutenção" | "Reserva";
export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: "Truck" | "Van" | "Carreta";
  status: VehicleStatus;
  lastService: string; // ISO
  nextService: string; // ISO
  kmTotal: number;
  kmDia: number;
};

export type VehicleWithCompany = Vehicle & { company: CompanyKey };
export const vehicles: VehicleWithCompany[] = [
  { id: "DEX-VHC-01", company: "DEXPRESS", plate: "ABC-1D23", model: "VW Delivery 11.180", type: "Truck", status: "Operação", lastService: new Date(Date.now() - 30*86400000).toISOString(), nextService: new Date(Date.now() + 60*86400000).toISOString(), kmTotal: 184200, kmDia: 260 },
  { id: "DEX-VHC-02", company: "DEXPRESS", plate: "DEF-4G56", model: "Mercedes Sprinter", type: "Van", status: "Operação", lastService: new Date(Date.now() - 20*86400000).toISOString(), nextService: new Date(Date.now() + 70*86400000).toISOString(), kmTotal: 121500, kmDia: 210 },
  { id: "DEX-VHC-03", company: "DEXPRESS", plate: "GHI-7J89", model: "Volvo FH 540", type: "Carreta", status: "Manutenção", lastService: new Date(Date.now() - 90*86400000).toISOString(), nextService: new Date(Date.now() + 10*86400000).toISOString(), kmTotal: 498000, kmDia: 0 },
  { id: "FG-VHC-01", company: "FG", plate: "JKL-0M12", model: "Iveco Daily", type: "Van", status: "Reserva", lastService: new Date(Date.now() - 10*86400000).toISOString(), nextService: new Date(Date.now() + 80*86400000).toISOString(), kmTotal: 86500, kmDia: 40 },
  { id: "GXP-VHC-01", company: "GXP", plate: "MNO-3P45", model: "Scania R 450", type: "Carreta", status: "Operação", lastService: new Date(Date.now() - 60*86400000).toISOString(), nextService: new Date(Date.now() + 30*86400000).toISOString(), kmTotal: 372300, kmDia: 320 },
];

export const deliveriesStatusCountsByCompany: Record<CompanyKey, { name: string; value: number; color?: string }[]> = {
  DEXPRESS: [
    { name: "Concluída", value: 220, color: "#16a34a" },
    { name: "Em rota", value: 84, color: "#2F2D76" },
    { name: "Pendente", value: 18, color: "#F6D103" },
    { name: "Falha", value: 6, color: "#ef4444" },
  ],
  FG: [
    { name: "Concluída", value: 44, color: "#16a34a" },
    { name: "Em rota", value: 12, color: "#2F2D76" },
    { name: "Pendente", value: 3, color: "#F6D103" },
    { name: "Falha", value: 1, color: "#ef4444" },
  ],
  GXP: [
    { name: "Concluída", value: 22, color: "#16a34a" },
    { name: "Em rota", value: 6, color: "#2F2D76" },
    { name: "Pendente", value: 1, color: "#F6D103" },
    { name: "Falha", value: 1, color: "#ef4444" },
  ],
};

export function getDeliveriesStatusCounts(scope: Scope): { name: string; value: number; color?: string }[] {
  if (scope === "ALL") {
    const keys: CompanyKey[] = ["DEXPRESS", "FG", "GXP"];
    const base: Record<string, { name: string; value: number; color?: string }> = {};
    for (const k of keys) {
      for (const item of deliveriesStatusCountsByCompany[k]) {
        if (!base[item.name]) base[item.name] = { name: item.name, value: 0, color: item.color };
        base[item.name].value += item.value;
      }
    }
    return Object.values(base);
  }
  return deliveriesStatusCountsByCompany[scope];
}

export type RouteStatus = "Planejada" | "Em rota" | "Concluída" | "Atrasada";
export type RouteItem = {
  id: string;
  code: string;
  driver: string;
  vehicle: string;
  stopsPlanned: number;
  stopsDone: number;
  status: RouteStatus;
  eta: string; // HH:mm
};

export const routesToday: RouteItem[] = [
  { id: "RT-001", code: "ZN-01", driver: "Carlos Souza", vehicle: "ABC-1D23", stopsPlanned: 18, stopsDone: 12, status: "Em rota", eta: "17:20" },
  { id: "RT-002", code: "ZO-03", driver: "Fernanda Alves", vehicle: "MNO-3P45", stopsPlanned: 22, stopsDone: 22, status: "Concluída", eta: "16:05" },
  { id: "RT-003", code: "ZS-02", driver: "João Pereira", vehicle: "GHI-7J89", stopsPlanned: 15, stopsDone: 9, status: "Atrasada", eta: "18:40" },
  { id: "RT-004", code: "LC-05", driver: "Mariana Lima", vehicle: "DEF-4G56", stopsPlanned: 12, stopsDone: 6, status: "Em rota", eta: "17:50" },
];

export const absenteismoMensal: { mes: string; value: number }[] = [
  { mes: "Jan", value: 2.1 },
  { mes: "Fev", value: 1.8 },
  { mes: "Mar", value: 2.4 },
  { mes: "Abr", value: 1.6 },
  { mes: "Mai", value: 2.7 },
  { mes: "Jun", value: 2.2 },
];

export const employeesCountByCompany: Record<CompanyKey, number> = {
  DEXPRESS: 10,
  FG: 3,
  GXP: 2,
};
export const vehiclesCountByCompany: Record<CompanyKey, number> = {
  DEXPRESS: 3,
  FG: 1,
  GXP: 1,
};
export const deliveriesThisMonthByCompany: Record<CompanyKey, number> = {
  DEXPRESS: 322,
  FG: 56,
  GXP: 40,
};

export const revenueMTDByCompany: Record<CompanyKey, number> = {
  DEXPRESS: 118000,
  FG: 24000,
  GXP: 16000,
};
export const expenseMTDByCompany: Record<CompanyKey, number> = {
  DEXPRESS: 72000,
  FG: 16000,
  GXP: 9000,
};
export const profitMTDByCompany: Record<CompanyKey, number> = {
  DEXPRESS: revenueMTDByCompany.DEXPRESS - expenseMTDByCompany.DEXPRESS,
  FG: revenueMTDByCompany.FG - expenseMTDByCompany.FG,
  GXP: revenueMTDByCompany.GXP - expenseMTDByCompany.GXP,
};

// ===== Aggregators by scope =====
function sumByScope<T extends Record<CompanyKey, number>>(rec: T, scope: Scope): number {
  if (scope === "ALL") return (Object.keys(rec) as CompanyKey[]).reduce((s, k) => s + rec[k], 0);
  return rec[scope];
}

export function getRevenueMTD(scope: Scope): number {
  return sumByScope(revenueMTDByCompany, scope);
}
export function getExpenseMTD(scope: Scope): number {
  return sumByScope(expenseMTDByCompany, scope);
}
export function getProfitMTD(scope: Scope): number {
  return sumByScope(profitMTDByCompany, scope);
}
export function getDeliveriesThisMonth(scope: Scope): number {
  return sumByScope(deliveriesThisMonthByCompany, scope);
}
export function getEmployeesCount(scope: Scope): number {
  return sumByScope(employeesCountByCompany, scope);
}
export function getVehiclesCount(scope: Scope): number {
  return sumByScope(vehiclesCountByCompany, scope);
}

export const paymentStatusCountsByCompany: Record<CompanyKey, { name: PaymentStatus; value: number }[]> = {
  DEXPRESS: [
    { name: "Pago", value: 40 },
    { name: "Pendente", value: 12 },
    { name: "Em atraso", value: 4 },
  ],
  FG: [
    { name: "Pago", value: 10 },
    { name: "Pendente", value: 3 },
    { name: "Em atraso", value: 1 },
  ],
  GXP: [
    { name: "Pago", value: 6 },
    { name: "Pendente", value: 2 },
    { name: "Em atraso", value: 1 },
  ],
};
export function getPaymentStatusCounts(scope: Scope): { name: PaymentStatus; value: number }[] {
  if (scope === "ALL") {
    const keys: CompanyKey[] = ["DEXPRESS", "FG", "GXP"];
    const base: Record<PaymentStatus, number> = { Pago: 0, Pendente: 0, "Em atraso": 0 };
    const agg = keys
      .flatMap((k) => paymentStatusCountsByCompany[k])
      .reduce((acc, cur) => {
        acc[cur.name] += cur.value;
        return acc;
      }, base);
    return [
      { name: "Pago", value: agg.Pago },
      { name: "Pendente", value: agg.Pendente },
      { name: "Em atraso", value: agg["Em atraso"] },
    ];
  }
  return paymentStatusCountsByCompany[scope];
}

// ===== Recent transactions (multi-company) =====
export const recentTransactionsByCompany: Record<CompanyKey, TransactionWithCompany[]> = {
  DEXPRESS: [
    { id: "DEX-TRX-2001", company: "DEXPRESS", date: new Date().toISOString(), client: "Supermercado Boa Compra", description: "Entrega Zona Norte", amount: 4200, status: "Pago" },
    { id: "DEX-TRX-2002", company: "DEXPRESS", date: new Date(Date.now() - 86400000).toISOString(), client: "Construtora Alfa", description: "Transporte de cimento", amount: 9800, status: "Pendente" },
    { id: "DEX-TRX-2003", company: "DEXPRESS", date: new Date(Date.now() - 2*86400000).toISOString(), client: "Farmácias Vida", description: "Distribuição regional", amount: 5600, status: "Pago" },
    { id: "DEX-TRX-2004", company: "DEXPRESS", date: new Date(Date.now() - 3*86400000).toISOString(), client: "Auto Peças Rocha", description: "Peças automotivas", amount: -2400, status: "Em atraso" },
  ],
  FG: [
    { id: "FG-TRX-3001", company: "FG", date: new Date().toISOString(), client: "Mercado Central", description: "Entrega matutina", amount: 1800, status: "Pago" },
    { id: "FG-TRX-3002", company: "FG", date: new Date(Date.now() - 86400000).toISOString(), client: "Depósito Silva", description: "Paletes", amount: 2400, status: "Pendente" },
    { id: "FG-TRX-3003", company: "FG", date: new Date(Date.now() - 2*86400000).toISOString(), client: "Armazém Azul", description: "Descarga", amount: -800, status: "Em atraso" },
  ],
  GXP: [
    { id: "GXP-TRX-4001", company: "GXP", date: new Date().toISOString(), client: "Lojas União", description: "Distribuição regional", amount: 2600, status: "Pago" },
    { id: "GXP-TRX-4002", company: "GXP", date: new Date(Date.now() - 86400000).toISOString(), client: "Constrular", description: "Cargas de piso", amount: 3100, status: "Pendente" },
  ],
};

export function getRecentTransactions(scope: Scope): Transaction[] {
  if (scope === "ALL") {
    return [
      ...recentTransactionsByCompany.DEXPRESS,
      ...recentTransactionsByCompany.FG,
      ...recentTransactionsByCompany.GXP,
    ].map(({ id, date, client, description, amount, status }) => ({ id, date, client, description, amount, status }));
  }
  return recentTransactionsByCompany[scope].map(({ id, date, client, description, amount, status }) => ({ id, date, client, description, amount, status }));
}

// New: version including company (CNPJ) retained, useful for filters and editing
export function getRecentTransactionsWithCompany(scope: Scope): TransactionWithCompany[] {
  if (scope === "ALL") {
    return [
      ...recentTransactionsByCompany.DEXPRESS,
      ...recentTransactionsByCompany.FG,
      ...recentTransactionsByCompany.GXP,
    ];
  }
  return recentTransactionsByCompany[scope];
}

export const recentTransactions: Transaction[] = [
  {
    id: "TRX-1001",
    date: new Date().toISOString(),
    client: "Supermercado Boa Compra",
    description: "Entrega Zona Norte",
    amount: 3200,
    status: "Pago",
  },
  {
    id: "TRX-1002",
    date: new Date(Date.now() - 86400000).toISOString(),
    client: "Construtora Alfa",
    description: "Transporte de cimento",
    amount: 8700,
    status: "Pendente",
  },
  {
    id: "TRX-1003",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    client: "Farmácias Vida",
    description: "Distribuição regional",
    amount: 5600,
    status: "Pago",
  },
  {
    id: "TRX-1004",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    client: "Auto Peças Rocha",
    description: "Peças automotivas",
    amount: -2400,
    status: "Em atraso",
  },
  {
    id: "TRX-1005",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    client: "Eletro Mais",
    description: "Eletrodomésticos",
    amount: 10200,
    status: "Pendente",
  },
];
