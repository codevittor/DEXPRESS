"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Settings2, BellRing, Building2, KeyRound } from "lucide-react";

export default function ConfiguracoesPage() {
  // Empresa
  const [razao, setRazao] = useState("DEXpress Logística LTDA");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [email, setEmail] = useState("contato@dexpress.com.br");
  const [telefone, setTelefone] = useState("(11) 5555-5555");
  const [endereco, setEndereco] = useState("Av. Paulista, 1000 - São Paulo/SP");
  const [diaFaturamento, setDiaFaturamento] = useState("5");

  // Notificações
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [alertAtraso, setAlertAtraso] = useState(true);
  const [limiteAtraso, setLimiteAtraso] = useState(2);

  // Preferências
  const [idioma, setIdioma] = useState("pt-BR");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [darkAuto, setDarkAuto] = useState(true);

  // Segurança
  const [mfa, setMfa] = useState(false);
  const [ips, setIps] = useState("200.200.200.200/32\n201.201.201.0/24");
  const [apiKey, setApiKey] = useState<string | null>(null);

  const maskedKey = useMemo(() => (apiKey ? `${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}` : "Nenhuma chave gerada"), [apiKey]);

  function handleSave(section: string) {
    // Aqui você integraria com sua API.
    console.log("Salvar seção:", section);
  }

  function gerarNovaChave() {
    const rand = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setApiKey(("sk_" + rand).slice(0, 32));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalize informações da empresa, preferências e segurança da conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Empresa e Faturamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 size={18}/> Empresa & Faturamento</CardTitle>
            <CardDescription>Dados cadastrais e preferências de faturamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm mb-1">Razão Social</div>
                <Input value={razao} onChange={(e) => setRazao(e.target.value)} />
              </div>
              <div>
                <div className="text-sm mb-1">CNPJ</div>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              </div>
              <div>
                <div className="text-sm mb-1">E-mail</div>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="text-sm mb-1">Telefone</div>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm mb-1">Endereço</div>
                <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
              </div>
              <div>
                <div className="text-sm mb-1">Dia de faturamento</div>
                <Select value={diaFaturamento} onValueChange={setDiaFaturamento}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76]" onClick={() => handleSave("empresa")}>Salvar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificações & Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing size={18}/> Notificações & Alertas</CardTitle>
            <CardDescription>Controle como e quando você quer ser avisado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">E-mail</div>
                <div className="text-sm text-muted-foreground">Receber alertas por e-mail</div>
              </div>
              <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Push</div>
                <div className="text-sm text-muted-foreground">Notificações no navegador</div>
              </div>
              <Switch checked={notifPush} onCheckedChange={setNotifPush} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Alertas de atraso</div>
                <div className="text-sm text-muted-foreground">Avisar quando houver entregas atrasadas</div>
              </div>
              <Switch checked={alertAtraso} onCheckedChange={setAlertAtraso} />
            </div>
            <div>
              <div className="text-sm mb-1">Limite de atraso (horas)</div>
              <Input type="number" min={0} value={limiteAtraso} onChange={(e) => setLimiteAtraso(Number(e.target.value))} />
            </div>
            <div className="pt-2 flex justify-end">
              <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76]" onClick={() => handleSave("notificacoes")}>Salvar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 size={18}/> Preferências do Sistema</CardTitle>
            <CardDescription>Idioma, fuso horário e aparência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-sm mb-1">Idioma</div>
                <Select value={idioma} onValueChange={setIdioma}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm mb-1">Fuso horário</div>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                    <SelectItem value="America/Manaus">America/Manaus</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-3">
                <div className="py-3">
                  <div className="font-medium">Tema escuro automático</div>
                  <div className="text-sm text-muted-foreground">Alterna conforme preferências do sistema</div>
                </div>
                <Switch checked={darkAuto} onCheckedChange={setDarkAuto} />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76]" onClick={() => handleSave("preferencias")}>Salvar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança & Acesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield size={18}/> Segurança & Acesso</CardTitle>
            <CardDescription>Proteja sua conta e defina permissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border px-3">
              <div className="py-3">
                <div className="font-medium">Autenticação em duas etapas (MFA)</div>
                <div className="text-sm text-muted-foreground">Código via app autenticador</div>
              </div>
              <Switch checked={mfa} onCheckedChange={setMfa} />
            </div>
            <div>
              <div className="text-sm mb-1">IPs permitidos (whitelist)</div>
              <Textarea rows={4} value={ips} onChange={(e) => setIps(e.target.value)} />
              <div className="text-xs text-muted-foreground mt-1">Um por linha. Suporta IPv4 e notação CIDR.</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium"><KeyRound size={16}/> Chave de API</div>
                <Button variant="outline" size="sm" onClick={gerarNovaChave}>Gerar nova</Button>
              </div>
              <div className="mt-2 text-sm break-all select-all">{maskedKey}</div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button className="bg-[#2F2D76] text-white hover:bg-[#2F2D76]" onClick={() => handleSave("seguranca")}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
