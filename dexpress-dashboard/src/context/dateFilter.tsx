"use client";

import * as React from "react";

export type Period = "today" | "week" | "month" | "year" | "custom";

type DateFilterState = {
  period: Period;
  from?: string; // yyyy-MM-dd when custom
  to?: string;   // yyyy-MM-dd when custom
};

interface DateFilterCtx extends DateFilterState {
  setPeriod: (p: Period) => void;
  setFrom: (d: string) => void;
  setTo: (d: string) => void;
}

const DateFilterContext = React.createContext<DateFilterCtx | undefined>(undefined);

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  // default to current year
  const [state, setState] = React.useState<DateFilterState>({ period: "year" });

  const setPeriod = React.useCallback((p: Period) => {
    setState((s) => ({ ...s, period: p }));
  }, []);
  const setFrom = React.useCallback((d: string) => {
    setState((s) => ({ ...s, from: d }));
  }, []);
  const setTo = React.useCallback((d: string) => {
    setState((s) => ({ ...s, to: d }));
  }, []);

  const value: DateFilterCtx = React.useMemo(
    () => ({ period: state.period, from: state.from, to: state.to, setPeriod, setFrom, setTo }),
    [state.period, state.from, state.to, setPeriod, setFrom, setTo]
  );

  return <DateFilterContext.Provider value={value}>{children}</DateFilterContext.Provider>;
}

export function useDateFilter() {
  const ctx = React.useContext(DateFilterContext);
  if (!ctx) throw new Error("useDateFilter must be used within DateFilterProvider");
  return ctx;
}
