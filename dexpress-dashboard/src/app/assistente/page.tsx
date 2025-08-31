"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function AssistentePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o Assistente Dexpress. Posso responder sobre seus KPIs, pagamentos, operacional e gerar previsões simples. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const quickPrompts = [
    "Resumo do mês (KPIs)",
    "Previsão de receitas e despesas para o próximo mês",
    "Pagamentos em atraso e próximos vencimentos",
    "Status do operacional: funcionários e veículos",
  ];

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: next.slice(-6) }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Erro ao consultar o assistente");
      }
      const data = (await res.json()) as { reply: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Desculpe, não consegui responder agora. Verifique a chave OPENAI_API_KEY no ambiente e tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // very small markdown renderer (headings, bold, lists). Avoids extra deps for MVP.
  function renderMarkdown(text: string) {
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const lines = escapeHtml(text).split(/\r?\n/);
    const html: string[] = [];
    let inUl = false;
    let inOl = false;

    const formatInline = (s: string) => {
      // bold
      let out = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1<\/strong>");
      // currency R$ 123.456,78
      out = out.replace(/R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d+)?/g, '<span class="font-semibold text-[#2F2D76]">$&<\/span>');
      // percentages 12.3%
      out = out.replace(/\b\d+(?:[.,]\d+)?%\b/g, '<span class="font-semibold text-[#2F2D76]">$&<\/span>');
      // status badges (financeiro)
      out = out.replace(/\b(Pago)\b/g, '<span class="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      out = out.replace(/\b(Pendente)\b/g, '<span class="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      out = out.replace(/\b(Em atraso)\b/g, '<span class="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      // status badges (rotas)
      out = out.replace(/\b(Concluída)\b/g, '<span class="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      out = out.replace(/\b(Em rota)\b/g, '<span class="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      out = out.replace(/\b(Atrasada)\b/g, '<span class="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px]">$1<\/span>');
      return out;
    };

    const flushLists = () => {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
    };

    for (const raw of lines) {
      const line = raw;
      // headings
      if (/^###\s+/.test(line)) {
        flushLists();
        html.push(`<h4 class="font-semibold text-slate-900 mt-2 mb-1">${formatInline(line.replace(/^###\s+/, ""))}</h4>`);
        continue;
      }
      if (/^##\s+/.test(line)) {
        flushLists();
        html.push(`<h3 class="font-semibold text-slate-900 mt-2 mb-1">${formatInline(line.replace(/^##\s+/, ""))}</h3>`);
        continue;
      }
      if (/^#\s+/.test(line)) {
        flushLists();
        html.push(`<h2 class="font-semibold text-slate-900 mt-2 mb-1 border-l-4 border-[#2F2D76]/40 pl-2">${formatInline(line.replace(/^#\s+/, ""))}</h2>`);
        continue;
      }

      // callout (Obs.: ...)
      if (/^Obs\.:/i.test(line)) {
        flushLists();
        const content = formatInline(line.replace(/^Obs\.:\s*/i, ""));
        html.push(`<div class="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-900 px-3 py-2 text-[13px]"><span class="font-medium">Obs.:</span> ${content}</div>`);
        continue;
      }

      // unordered list
      if (/^[-•]\s+/.test(line)) {
        if (!inUl) {
          flushLists();
          html.push('<ul class="list-disc pl-5 space-y-1">');
          inUl = true;
        }
        const item = line.replace(/^[-•]\s+/, "");
        if (/^[^:]{2,}:\s+/.test(item)) {
          const [label, ...rest] = item.split(":");
          const value = rest.join(":").trim();
          html.push(`<li class="flex gap-2 items-baseline"><span class="text-slate-500">${formatInline(label)}:</span><span class="text-slate-900">${formatInline(value)}</span></li>`);
        } else {
          html.push(`<li>${formatInline(item)}</li>`);
        }
        continue;
      }

      // ordered list
      if (/^\d+\.\s+/.test(line)) {
        if (!inOl) {
          flushLists();
          html.push('<ol class="list-decimal pl-5 space-y-1">');
          inOl = true;
        }
        const item = line.replace(/^\d+\.\s+/, "");
        html.push(`<li>${formatInline(item)}</li>`);
        continue;
      }

      // empty line: new paragraph
      if (line.trim() === "") {
        flushLists();
        html.push("<div class=\"h-1\"></div>");
        continue;
      }

      // paragraph
      flushLists();
      html.push(`<p class="text-[13px] leading-relaxed">${formatInline(line)}</p>`);
    }

    flushLists();
    return html.join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-[#F6D103]/20 text-[#2F2D76] ring-1 ring-slate-200">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
            <p className="text-sm text-muted-foreground">Pergunte sobre KPIs, pagamentos, operacional e previsões.</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>Converse com o Assistente Dexpress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[560px] flex flex-col rounded-xl border border-transparent bg-gradient-to-b from-white to-amber-50/50 overflow-hidden shadow-sm">
            {/* backdrop accents */}
            <div className="pointer-events-none absolute h-40 w-40 -top-8 -right-8 rounded-full bg-[#2F2D76]/10 blur-3xl" />
            <div className="pointer-events-none absolute h-40 w-40 -bottom-8 -left-8 rounded-full bg-amber-200/30 blur-3xl" />

            <div ref={listRef} className="chat-scroll flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {m.role === "assistant" && (
                      <Image
                        src="/images/foto-assistente.png"
                        alt="Assistente Dexpress"
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover border border-white ring-2 ring-[#2F2D76]/20"
                      />
                    )}
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-2xl bg-[#2F2D76] text-white px-4 py-2.5 shadow"
                          : "rounded-3xl bg-white/95 text-slate-900 px-4 py-3 border border-slate-200 shadow-sm"
                      }
                    >
                      {m.role === "assistant" ? (
                        <div
                          className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-slate-900"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 text-slate-900 px-3 py-2 border border-slate-200 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F2D76]" />
                    <span className="text-sm text-muted-foreground">Pensando…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div className="border-t border-slate-200 p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs rounded-full border border-slate-200 bg-amber-50 text-[#2F2D76] px-3 py-1 hover:bg-amber-100"
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={onSend} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre KPIs, pagamentos, previsões…"
                  className="flex-1 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F2D76]"
                />
                <Button type="submit" disabled={loading || !input.trim()} className="gap-2 rounded-full bg-[#2F2D76] hover:bg-[#25235c] text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Enviando" : "Enviar"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
