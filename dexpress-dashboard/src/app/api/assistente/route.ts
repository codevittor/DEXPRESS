import { NextResponse } from "next/server";
import {
  Scope,
  CompanyKey,
  getMonthlyData,
  getPaymentStatusCounts,
  getRecentTransactions,
  employees,
  type EmployeeWithCompany,
  vehicles,
  type VehicleWithCompany,
  routesToday,
  getRevenueMTD,
  getExpenseMTD,
  getProfitMTD,
  absenteismoMensal,
  getDeliveriesThisMonth,
} from "@/data/mock";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// Optional: external API base URL and token to pull real company data.
// Configure in .env.local:
// COMPANY_API_BASE_URL=https://minha.api
// COMPANY_API_TOKEN=seu_token (opcional)
const API_BASE = process.env.COMPANY_API_BASE_URL || "";
const API_TOKEN = process.env.COMPANY_API_TOKEN || "";

function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) {
    const obj: Record<string, string> = {};
    h.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h.map(([k, v]) => [k, String(v)]));
  }
  const rec = h as Record<string, string | number | boolean>;
  return Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, String(v)]));
}

async function tryFetch<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (!API_BASE) return fallback;
  const url = API_BASE.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 7000);
  try {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    const headers: Record<string, string> = { ...base, ...headersToRecord(init?.headers) };
    if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
    const res = await fetch(url, { ...init, signal: controller.signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as T;
    return json;
  } catch {
    return fallback;
  } finally {
    clearTimeout(id);
  }
}

// Estrutura de dados consolidada para enviar à OpenAI
async function buildDataContext(scope: Scope) {
  const kpis = await tryFetch(
    `/kpis/mtd?scope=${scope}`,
    { revenueMTD: getRevenueMTD(scope), expenseMTD: getExpenseMTD(scope), profitMTD: getProfitMTD(scope), deliveriesThisMonth: getDeliveriesThisMonth(scope) },
  );
  const payCounts = await tryFetch(`/payments/status?scope=${scope}`, getPaymentStatusCounts(scope));
  const txs = await tryFetch(`/transactions/recent?scope=${scope}`, getRecentTransactions(scope));
  const emps = await tryFetch<EmployeeWithCompany[]>("/employees?scope=" + scope, employees);
  const abs = await tryFetch("/kpis/absenteismo?scope=" + scope, absenteismoMensal);
  const vehs = await tryFetch<VehicleWithCompany[]>("/vehicles?scope=" + scope, vehicles);
  const routes = await tryFetch("/routes/today?scope=" + scope, routesToday);
  const monthly = await tryFetch(`/kpis/monthly?scope=${scope}`, getMonthlyData(scope));
  // When scope = ALL, include per-company breakdown to help CNPJ-aware questions
  const perCompany =
    scope === "ALL"
      ? COMPANY_KEYS.map((c) => ({
          company: c,
          kpis: {
            revenueMTD: getRevenueMTD(c),
            expenseMTD: getExpenseMTD(c),
            profitMTD: getProfitMTD(c),
            deliveriesThisMonth: getDeliveriesThisMonth(c),
          },
          payments: getPaymentStatusCounts(c),
        }))
      : undefined;
  return { kpis, payCounts, txs, emps, abs, vehs, routes, monthly, perCompany };
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

function daysUntil(dateISO: string) {
  const diff = new Date(dateISO).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// ===== Helpers for CNPJ/company summaries =====
const COMPANY_KEYS: CompanyKey[] = ["DEXPRESS", "FG", "GXP"];

function companySummary(company: CompanyKey) {
  const revenue = getRevenueMTD(company);
  const expense = getExpenseMTD(company);
  const profit = getProfitMTD(company);
  const deliveries = getDeliveriesThisMonth(company);
  const pays = getPaymentStatusCounts(company);
  const pagos = pays.find((x) => x.name === "Pago")?.value ?? 0;
  const pend = pays.find((x) => x.name === "Pendente")?.value ?? 0;
  const atraso = pays.find((x) => x.name === "Em atraso")?.value ?? 0;
  const margin = revenue ? profit / revenue : 0;
  return { company, revenue, expense, profit, margin, deliveries, pagamentos: { pagos, pend, atraso } };
}

async function companyComparison(scope: Scope) {
  const targets = scope === "ALL" ? COMPANY_KEYS : ([scope] as CompanyKey[]);
  const list = targets.map((c) => companySummary(c));

  const byProfit = list.slice().sort((a, b) => b.profit - a.profit);
  const byMargin = list.slice().sort((a, b) => b.margin - a.margin);

  const lines = list.map(
    (x) =>
      `- ${x.company}: Receitas ${brl(x.revenue)}, Despesas ${brl(x.expense)}, Lucro ${brl(x.profit)} (Margem ${pct(x.margin * 100)}), Entregas ${x.deliveries}, Pagamentos: Pago ${x.pagamentos.pagos}, Pendente ${x.pagamentos.pend}, Em atraso ${x.pagamentos.atraso}`
  );

  const highlights = [
    `- Top por lucro: ${byProfit[0]?.company ?? "-"} (${brl(byProfit[0]?.profit ?? 0)})`,
    `- Top por margem: ${byMargin[0]?.company ?? "-"} (${pct((byMargin[0]?.margin ?? 0) * 100)})`,
  ];

  return [
    `# Comparativo por CNPJ`,
    ...lines,
    `## Destaques`,
    ...highlights,
    scope !== "ALL" ? `Obs.: para comparar entre CNPJs, consulte com escopo "ALL".` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

// ====== respostas (API-first com fallback) ======
async function kpiSummary(scope: Scope) {
  const kpis = await tryFetch(
    `/kpis/mtd?scope=${scope}`,
    { revenueMTD: getRevenueMTD(scope), expenseMTD: getExpenseMTD(scope), profitMTD: getProfitMTD(scope), deliveriesThisMonth: getDeliveriesThisMonth(scope) },
  );
  const payCounts = await tryFetch(`/payments/status?scope=${scope}`, getPaymentStatusCounts(scope));
  const monthly = await tryFetch(`/kpis/monthly?scope=${scope}`, getMonthlyData(scope));
  const pagos = payCounts.find((x) => x.name === "Pago")?.value ?? 0;
  const pend = payCounts.find((x) => x.name === "Pendente")?.value ?? 0;
  const atraso = payCounts.find((x) => x.name === "Em atraso")?.value ?? 0;
  const totalTit = pagos + pend + atraso;
  const pct = (n: number) => (totalTit ? Math.round((n / totalTit) * 100) : 0);

  const last = monthly.slice(-1)[0];
  const prev = monthly.slice(-2)[0];
  const lucroPrev = prev ? prev.receitas - prev.despesas : undefined;
  const delta = (curr?: number, ant?: number) =>
    curr == null || ant == null ? "-" : `${ant === 0 ? (curr === 0 ? "0%" : "+∞%") : (((curr - ant) / Math.abs(ant)) * 100).toFixed(1)}%`;

  return [
    `# KPIs do mês`,
    `- Receitas MTD: ${brl(kpis.revenueMTD)}`,
    `- Despesas MTD: ${brl(kpis.expenseMTD)}`,
    `- Lucro MTD: ${brl(kpis.profitMTD)}`,
    `- Entregas no mês: ${kpis.deliveriesThisMonth}`,
    `- Pagamentos: Pago ${pagos} (${pct(pagos)}%), Pendente ${pend} (${pct(pend)}%), Em atraso ${atraso} (${pct(atraso)}%)`,
    prev
      ? `- Variação vs mês anterior: Receitas ${delta(last?.receitas, prev?.receitas)}, Despesas ${delta(last?.despesas, prev?.despesas)}, Lucro ${delta((last?.receitas ?? 0) - (last?.despesas ?? 0), lucroPrev)}`
      : undefined,
  ].filter(Boolean).join("\n");
}

async function paymentsStatus(scope: Scope) {
  const txs = await tryFetch(`/transactions/recent?scope=${scope}`, getRecentTransactions(scope));
  const atrasos = txs.filter((t) => t.status === "Em atraso").slice(0, 3);
  const pendentes = txs.filter((t) => t.status === "Pendente").slice(0, 3);

  const atrasosLines =
    atrasos.length > 0
      ? atrasos.map((t) => `- ${t.id} • ${t.client} • ${t.description} • ${brl(t.amount)}`).join("\n")
      : "- Sem itens em atraso recentes";

  const pendLines =
    pendentes.length > 0
      ? pendentes.map((t) => `- ${t.id} • ${t.client} • ${t.description} • ${brl(t.amount)}`).join("\n")
      : "- Sem itens pendentes recentes";

  return ["# Pagamentos", "## Em atraso", atrasosLines, "## Pendentes", pendLines].join("\n");
}

async function operationalStatus(scope: Scope) {
  const empsAll = await tryFetch<EmployeeWithCompany[]>("/employees?scope=" + scope, employees);
  const emps = scope === "ALL" ? empsAll : empsAll.filter((e) => e.company === scope);
  const ativos = emps.filter((e) => e.status === "Ativo").length;
  const ferias = emps.filter((e) => e.status === "Férias").length;
  const afast = emps.filter((e) => e.status === "Afastado").length;

  const vencCNH = emps
    .map((e) => ({ name: e.name, d: daysUntil(e.cnhVencimento) }))
    .filter((x) => x.d <= 30)
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  const vencASO = emps
    .map((e) => ({ name: e.name, d: daysUntil(e.asoVencimento) }))
    .filter((x) => x.d <= 30)
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  const absList = await tryFetch("/kpis/absenteismo?scope=" + scope, absenteismoMensal);
  const absMes = absList.slice(-1)[0];

  return [
    `# Operacional`,
    `- Colaboradores: ${emps.length} (Ativos ${ativos}, Férias ${ferias}, Afastados ${afast})`,
    `- Absenteísmo (último mês): ${pct(absMes?.value ?? 0)}`,
    `## Alertas próximos (≤ 30 dias)`,
    `- CNH: ${vencCNH.length > 0 ? vencCNH.map((x) => `${x.name} em ${x.d}d`).join("; ") : "sem alertas"}`,
    `- ASO: ${vencASO.length > 0 ? vencASO.map((x) => `${x.name} em ${x.d}d`).join("; ") : "sem alertas"}`,
  ].join("\n");
}

async function fleetStatus(scope: Scope) {
  const vehsAll = await tryFetch<VehicleWithCompany[]>("/vehicles?scope=" + scope, vehicles);
  const vehs = scope === "ALL" ? vehsAll : vehsAll.filter((v) => v.company === scope);
  const op = vehs.filter((v) => v.status === "Operação").length;
  const man = vehs.filter((v) => v.status === "Manutenção").length;
  const res = vehs.filter((v) => v.status === "Reserva").length;

  const proximas = vehs
    .map((v) => ({ plate: v.plate, d: daysUntil(v.nextService) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  return [
    `# Frotas`,
    `- Veículos: ${vehs.length} (Operação ${op}, Manutenção ${man}, Reserva ${res})`,
    `- Próximas manutenções: ${
      proximas.length > 0 ? proximas.map((x) => `${x.plate} em ${x.d}d`).join("; ") : "sem pendências próximas"
    }`,
  ].join("\n");
}

async function routesSummary(scope: Scope) {
  const routes = await tryFetch("/routes/today?scope=" + scope, routesToday);
  const concl = routes.filter((r) => r.status === "Concluída").length;
  const rota = routes.filter((r) => r.status === "Em rota").length;
  const atras = routes.filter((r) => r.status === "Atrasada").length;

  const top = routes
    .slice()
    .sort((a, b) => b.stopsDone - a.stopsDone)
    .slice(0, 3)
    .map((r) => `- ${r.code} • ${r.driver} • ${r.stopsDone}/${r.stopsPlanned} • ${r.status} • ETA ${r.eta}`)
    .join("\n");

  return [
    `# Rotas de hoje`,
    `- Concluídas ${concl}, Em rota ${rota}, Atrasadas ${atras}`,
    `## Destaques`,
    top || "- Sem rotas registradas hoje",
  ].join("\n");
}

async function simpleForecast(scope: Scope) {
  const monthly = await tryFetch(`/kpis/monthly?scope=${scope}`, getMonthlyData(scope));
  const last3 = monthly.slice(-3);
  const recMedia = last3.reduce((s, m) => s + m.receitas, 0) / Math.max(1, last3.length);
  const despMedia = last3.reduce((s, m) => s + m.despesas, 0) / Math.max(1, last3.length);
  const lucro = recMedia - despMedia;

  return [
    `# Previsão simples (próximo mês)`,
    `- Receitas: ${brl(recMedia)}`,
    `- Despesas: ${brl(despMedia)}`,
    `- Lucro estimado: ${brl(lucro)}`,
    `Obs.: projeção baseada na média móvel dos últimos 3 meses.`,
  ].join("\n");
}

async function generateMockReply(question: string, scope: Scope) {
  const q = (question || "").toLowerCase();

  const wantsKPIs = /(kpi|resumo|vis[aã]o|sum[aá]rio|m[eê]s)/i.test(q);
  const wantsPayments = /(pagamento|pendente|atras|bolet|fatura)/i.test(q);
  const wantsOps = /(operacional|colaborador|funcion[aá]rio|cnh|aso|absente[ií]smo)/i.test(q);
  const wantsFleet = /(frota|ve[ií]culo|manuten[cç][aã]o|placa)/i.test(q);
  const wantsRoutes = /(rota|entrega|parada|atrasad|em rota|conclu[ií]da)/i.test(q);
  const wantsForecast = /(previs[aã]o|proj[eê]t|pr[oó]ximo m[eê]s|tend[eê]ncia)/i.test(q);
  const wantsCNPJ = /(cnpj|empresa|divid(ido|ir|a) por cnpj|por cnpj|comparar cnpj|qual cnpj|qual empresa|melhor cnpj|melhor empresa)/i.test(q);

  const parts: string[] = [];
  if (wantsKPIs) parts.push(await kpiSummary(scope));
  if (wantsPayments) parts.push(await paymentsStatus(scope));
  if (wantsOps) parts.push(await operationalStatus(scope));
  if (wantsFleet) parts.push(await fleetStatus(scope));
  if (wantsRoutes) parts.push(await routesSummary(scope));
  if (wantsForecast) parts.push(await simpleForecast(scope));
  if (wantsCNPJ) parts.push(await companyComparison(scope));
  if (parts.length === 0) {
    parts.push(
      [
        `Posso ajudar com:`,
        `- KPIs do mês`,
        `- Pagamentos (pendentes/atrasos)`,
        `- Operacional (alertas CNH/ASO, absenteísmo)`,
        `- Frotas (status, manutenções)`,
        `- Rotas do dia`,
        `- Previsão simples do próximo mês`,
        `- Comparativo por CNPJ (empresa)`
      ].join("\n")
    );
  }

  return parts.join("\n\n");
}

async function callOpenAI(messages: ChatMessage[], apiKey: string) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "OpenAI error");
  }
  type OpenAIChatCompletion = { choices?: { message?: { content?: string } }[] };
  const data = (await resp.json()) as OpenAIChatCompletion;
  return data.choices?.[0]?.message?.content ?? "";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Suporta {messages} ou {question, history}
    let messages: ChatMessage[] = [];
    if (Array.isArray(body?.messages)) {
      messages = body.messages;
    } else {
      const history = Array.isArray(body?.history) ? (body.history as ChatMessage[]) : [];
      const question = typeof body?.question === "string" ? body.question : "";
      messages = [
        { role: "system", content: "Você é o Assistente IA do DEXpress. Responda em pt-BR, de forma objetiva e prática." } as ChatMessage,
        ...history.slice(-6),
        ...(question ? [{ role: "user", content: question } as ChatMessage] : []),
      ];
    }

    if (messages.length === 0) {
      return NextResponse.json({ reply: "Faça uma pergunta para começar." });
    }

    const rawScope = (body?.scope as string | undefined)?.toUpperCase?.() || "ALL";
    const SCOPE_VALUES = ["ALL", "DEXPRESS", "FG", "GXP"] as const;
    const scope: Scope = (SCOPE_VALUES as readonly string[]).includes(rawScope) ? (rawScope as Scope) : "ALL";

    const apiKey = process.env.OPENAI_API_KEY;

    // Short-circuit: if the last user question is about CNPJ/empresa, answer via deterministic comparison
    const lastUserRaw = messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";
    const cnpjRegex = /(cnpj|empresa|divid(ido|ir|a) por cnpj|por cnpj|comparar cnpj|qual cnpj|qual empresa|melhor cnpj|melhor empresa)/i;
    if (cnpjRegex.test(lastUserRaw)) {
      const reply = await companyComparison(scope);
      return NextResponse.json({ reply });
    }

    // Se houver chave, tenta OpenAI (com contexto de dados da empresa em JSON)
    if (apiKey) {
      try {
        const data = await buildDataContext(scope);
        const DATA_JSON = JSON.stringify(data);
        const withContext: ChatMessage[] = [
          {
            role: "system",
            content:
              "Você é o Assistente do DEXpress. Responda ESTRITAMENTE com base no DATA_JSON a seguir. Seja objetivo, cite números exatos e % quando pertinente. Interpretação: quando o usuário disser 'CNPJ' OU 'empresa', entenda como as empresas listadas (DEXPRESS, FG, GXP). Para perguntas como 'qual CNPJ está melhor', utilize os campos de 'perCompany' se presentes em DATA_JSON para comparar lucro, margem e demais métricas por empresa. Se 'perCompany' não estiver presente, explique que a comparação por CNPJ exige escopo ALL. Se algum dado específico não existir no DATA_JSON, diga que não há informação."
          } as ChatMessage,
          { role: "system", content: `DATA_JSON: ${DATA_JSON}` } as ChatMessage,
          ...messages,
        ];
        const reply = await callOpenAI(withContext, apiKey);
        if (reply && reply.trim().length > 0) {
          return NextResponse.json({ reply });
        }
      } catch {
        // Falhou OpenAI? Continua para mock
      }
    }

    // Fallback mock
    const lastUser = messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";
    const mock = await generateMockReply(lastUser, scope);
    return NextResponse.json({ reply: mock });
  } catch {
    return NextResponse.json(
      { reply: "Não consegui entender a solicitação agora. Tente reformular a pergunta." },
      { status: 200 }
    );
  }
}