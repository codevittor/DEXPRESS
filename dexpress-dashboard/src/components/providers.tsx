"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";
import { ScopeProvider } from "@/context/scope";
import { ReceitasProvider } from "@/context/receitas";
import { DateFilterProvider } from "@/context/dateFilter";
import { DespesasProvider } from "@/context/despesas";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ScopeProvider>
        <DateFilterProvider>
          <ReceitasProvider>
            <DespesasProvider>
              {children}
              <Toaster richColors position="top-right" />
            </DespesasProvider>
          </ReceitasProvider>
        </DateFilterProvider>
      </ScopeProvider>
    </ThemeProvider>
  );
}
