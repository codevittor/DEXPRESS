"use client";

import React from "react";
import { getRecentTransactionsWithCompany, type CompanyKey, type TransactionWithCompany } from "@/data/mock";
import { useScope } from "@/context/scope";

export type Receita = TransactionWithCompany;

type State = {
  receitas: Receita[];
  loadedFromStorage: boolean;
};

export type ReceitaInput = Omit<Receita, "id"> & { id?: string };

interface Ctx {
  receitas: Receita[];
  addReceita: (input: ReceitaInput) => string;
  updateReceita: (id: string, patch: Partial<Receita>) => void;
  removeReceita: (id: string) => void;
  resetWithMock: () => void;
}

const ReceitasContext = React.createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "dex:receitas";

export function ReceitasProvider({ children }: { children: React.ReactNode }) {
  const { scope } = useScope();
  const [state, setState] = React.useState<State>({ receitas: [], loadedFromStorage: false });

  // Load from localStorage; if empty, seed with mock for ALL scope
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Receita[];
        setState({ receitas: parsed, loadedFromStorage: true });
      } else {
        const seed = getRecentTransactionsWithCompany("ALL").filter((t) => t.amount > 0);
        setState({ receitas: seed, loadedFromStorage: true });
      }
    } catch {
      const seed = getRecentTransactionsWithCompany("ALL").filter((t) => t.amount > 0);
      setState({ receitas: seed, loadedFromStorage: true });
    }
  }, []);

  // Persist
  React.useEffect(() => {
    if (state.loadedFromStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.receitas));
    }
  }, [state.receitas, state.loadedFromStorage]);

  const addReceita = React.useCallback((input: ReceitaInput) => {
    const id = input.id ?? crypto.randomUUID();
    const novo: Receita = {
      id,
      date: input.date ?? new Date().toISOString(),
      client: input.client ?? "",
      description: input.description ?? "",
      amount: Number(input.amount ?? 0),
      status: (input.status ?? "Pendente") as Receita["status"],
      company: (input.company ?? (scope as CompanyKey)) as CompanyKey,
    };
    setState((s) => ({ ...s, receitas: [novo, ...s.receitas] }));
    return id;
  }, [scope]);

  const updateReceita = React.useCallback((id: string, patch: Partial<Receita>) => {
    setState((s) => ({
      ...s,
      receitas: s.receitas.map((r) => (r.id === id ? { ...r, ...patch, amount: patch.amount !== undefined ? Number(patch.amount) : r.amount } : r)),
    }));
  }, []);

  const removeReceita = React.useCallback((id: string) => {
    setState((s) => ({ ...s, receitas: s.receitas.filter((r) => r.id !== id) }));
  }, []);

  const resetWithMock = React.useCallback(() => {
    const seed = getRecentTransactionsWithCompany("ALL").filter((t) => t.amount > 0);
    setState({ receitas: seed, loadedFromStorage: true });
  }, []);

  const ctx: Ctx = {
    receitas: state.receitas,
    addReceita,
    updateReceita,
    removeReceita,
    resetWithMock,
  };

  return <ReceitasContext.Provider value={ctx}>{children}</ReceitasContext.Provider>;
}

export function useReceitas() {
  const ctx = React.useContext(ReceitasContext);
  if (!ctx) throw new Error("useReceitas must be used within ReceitasProvider");
  return ctx;
}
