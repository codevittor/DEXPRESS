"use client";

import * as React from "react";

export type CompanyKey = "DEXPRESS" | "FG" | "GXP";
export type Scope = "ALL" | CompanyKey;

type ScopeContextValue = {
  scope: Scope;
  setScope: (s: Scope) => void;
};

const ScopeContext = React.createContext<ScopeContextValue | undefined>(undefined);

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = React.useState<Scope>("ALL");
  const value = React.useMemo(() => ({ scope, setScope }), [scope]);
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope() {
  const ctx = React.useContext(ScopeContext);
  if (!ctx) throw new Error("useScope must be used within <ScopeProvider>");
  return ctx;
}
