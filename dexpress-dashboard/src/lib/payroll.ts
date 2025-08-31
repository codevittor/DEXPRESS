export type PayrollBreakdown = {
  salaryBruto: number
  // Descontos do funcionário
  inss: number
  irrf: number
  vt: number
  outrosDescontos: number
  descontosTotal: number
  salarioLiquido: number
  // Encargos da empresa
  inssPatronal20: number
  fgts8: number
  rat2: number
  terceiros58: number
  encargosTotal: number
  // Benefícios
  beneficiosTotal: number
  // Outros custos (empresa)
  outrosCustosEmpresaTotal: number
}

function clamp(n: number) {
  return Math.max(0, Math.round(n * 100) / 100)
}

// INSS progressivo (aproximação 2024) até o teto
export function calcINSSProgressivo(salario: number): number {
  const teto = 7786.02
  const faixas = [
    { limite: 1412.0, aliquota: 0.075 },
    { limite: 2666.68, aliquota: 0.09 },
    { limite: 4000.03, aliquota: 0.12 },
    { limite: 7786.02, aliquota: 0.14 },
  ]
  const base = Math.min(salario, teto)
  let prev = 0
  let total = 0
  for (const f of faixas) {
    const faixaValor = Math.max(0, Math.min(base, f.limite) - prev)
    if (faixaValor <= 0) break
    total += faixaValor * f.aliquota
    prev = f.limite
    if (base <= f.limite) break
  }
  return clamp(total)
}

// IRRF progressivo (aproximação) sobre base (salário - INSS). Sem deduções de dependentes.
export function calcIRRF(baseCalculo: number): number {
  const tabelas = [
    { max: 2112.0, aliquota: 0, deducao: 0 },
    { max: 2826.65, aliquota: 0.075, deducao: 158.4 },
    { max: 3751.05, aliquota: 0.15, deducao: 370.4 },
    { max: 4664.68, aliquota: 0.225, deducao: 651.73 },
    { max: Infinity, aliquota: 0.275, deducao: 884.96 },
  ]
  const faixa = tabelas.find((t) => baseCalculo <= t.max)!
  const imposto = baseCalculo * faixa.aliquota - faixa.deducao
  return clamp(Math.max(0, imposto))
}

export function calcVT(salario: number, temVT: boolean | undefined): number {
  if (!temVT) return 0
  return clamp(salario * 0.06)
}

export function calcEncargosEmpresa(salario: number) {
  const inssPatronal20 = clamp(salario * 0.2)
  const fgts8 = clamp(salario * 0.08)
  const rat2 = clamp(salario * 0.02) // Suposição: 2%
  const terceiros58 = clamp(salario * 0.058)
  const encargosTotal = clamp(inssPatronal20 + fgts8 + rat2 + terceiros58)
  return { inssPatronal20, fgts8, rat2, terceiros58, encargosTotal }
}

export function breakdownFolha({
  salario,
  valeTransporte,
  outrosDescontos,
  beneficios,
  outrosCustosEmpresa,
}: {
  salario: number
  valeTransporte?: boolean
  outrosDescontos?: number
  beneficios?: { name: string; amount: number }[]
  outrosCustosEmpresa?: { name: string; amount: number }[]
}): PayrollBreakdown {
  const salaryBruto = salario
  const inss = calcINSSProgressivo(salaryBruto)
  const baseIR = Math.max(0, salaryBruto - inss)
  const irrf = calcIRRF(baseIR)
  const vt = calcVT(salaryBruto, valeTransporte)
  const outros = clamp(outrosDescontos ?? 0)
  const descontosTotal = clamp(inss + irrf + vt + outros)
  const salarioLiquido = clamp(salaryBruto - descontosTotal)

  const { inssPatronal20, fgts8, rat2, terceiros58, encargosTotal } = calcEncargosEmpresa(salaryBruto)

  const beneficiosTotal = clamp((beneficios ?? []).reduce((s, b) => s + (b.amount || 0), 0))
  const outrosCustosEmpresaTotal = clamp((outrosCustosEmpresa ?? []).reduce((s, c) => s + (c.amount || 0), 0))

  return {
    salaryBruto,
    inss,
    irrf,
    vt,
    outrosDescontos: outros,
    descontosTotal,
    salarioLiquido,
    inssPatronal20,
    fgts8,
    rat2,
    terceiros58,
    encargosTotal,
    beneficiosTotal,
    outrosCustosEmpresaTotal,
  }
}

export function formatCurrencyBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}
