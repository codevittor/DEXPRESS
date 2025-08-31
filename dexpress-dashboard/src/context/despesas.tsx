"use client";

import React from "react";
import { getRecentTransactionsWithCompany, type CompanyKey, type TransactionWithCompany } from "@/data/mock";
import { useScope } from "@/context/scope";

export type Despesa = Omit<TransactionWithCompany, "amount"> & { amount: number };

type State = {
  despesas: Despesa[];
  loadedFromStorage: boolean;
};

export type DespesaInput = Omit<Despesa, "id"> & { id?: string };

interface Ctx {
  despesas: Despesa[];
  addDespesa: (input: DespesaInput) => string;
  updateDespesa: (id: string, patch: Partial<Despesa>) => void;
  removeDespesa: (id: string) => void;
  resetWithMock: () => void;
}

const DespesasContext = React.createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "dex:despesas";

export function DespesasProvider({ children }: { children: React.ReactNode }) {
  const { scope } = useScope();
  const [state, setState] = React.useState<State>({ despesas: [], loadedFromStorage: false });

  // Load from localStorage; if empty, seed with mock for ALL scope (only negative amounts, converted to positive for the expense domain)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Despesa[];
        setState({ despesas: parsed, loadedFromStorage: true });
      } else {
        const seed = getRecentTransactionsWithCompany("ALL")
          .filter((t) => t.amount < 0)
          .map<Despesa>((t) => ({ ...t, amount: Math.abs(t.amount) }));
        setState({ despesas: seed, loadedFromStorage: true });
      }
    } catch {
      const seed = getRecentTransactionsWithCompany("ALL")
        .filter((t) => t.amount < 0)
        .map<Despesa>((t) => ({ ...t, amount: Math.abs(t.amount) }));
      setState({ despesas: seed, loadedFromStorage: true });
    }
  }, []);

  // Persist
  React.useEffect(() => {
    if (state.loadedFromStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.despesas));
    }
  }, [state.despesas, state.loadedFromStorage]);

  const addDespesa = React.useCallback((input: DespesaInput) => {
    const id = input.id ?? crypto.randomUUID();
    const nova: Despesa = {
      id,
      date: input.date ?? new Date().toISOString(),
      client: input.client ?? "",
      description: input.description ?? "",
      amount: Number(input.amount ?? 0),
      status: (input.status ?? "Pendente") as Despesa["status"],
      company: (input.company ?? (scope as CompanyKey)) as CompanyKey,
    };
    setState((s) => ({ ...s, despesas: [nova, ...s.despesas] }));
    return id;
  }, [scope]);

  const updateDespesa = React.useCallback((id: string, patch: Partial<Despesa>) => {
    setState((s) => ({
      ...s,
      despesas: s.despesas.map((r) => (r.id === id ? { ...r, ...patch, amount: patch.amount !== undefined ? Number(patch.amount) : r.amount } : r)),
    }));
  }, []);

  const removeDespesa = React.useCallback((id: string) => {
    setState((s) => ({ ...s, despesas: s.despesas.filter((r) => r.id !== id) }));
  }, []);

  const resetWithMock = React.useCallback(() => {
    const seed = getRecentTransactionsWithCompany("ALL")
      .filter((t) => t.amount < 0)
      .map<Despesa>((t) => ({ ...t, amount: Math.abs(t.amount) }));
    setState({ despesas: seed, loadedFromStorage: true });
  }, []);

  const ctx: Ctx = {
    despesas: state.despesas,
    addDespesa,
    updateDespesa,
    removeDespesa,
    resetWithMock,
  };

  return <DespesasContext.Provider value={ctx}>{children}</DespesasContext.Provider>;
}

export function useDespesas() {
  const ctx = React.useContext(DespesasContext);
  if (!ctx) throw new Error("useDespesas must be used within DespesasProvider");
  return ctx;
}
