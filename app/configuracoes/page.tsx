// app/configuracoes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Settings, Palette, Printer, History, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { lerConfig, salvarConfig, espacoUsadoKB, ConfigApp } from "@/lib/config";
import { limparHistorico, listarHistorico } from "@/lib/historico";
import { PAPER_SIZES, LAYOUTS } from "@/components/PrintInterface";

function Secao({
  icon: Icon,
  titulo,
  descricao,
  children,
}: {
  icon: React.ElementType;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-[#E5E2DA]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-serif text-lg font-semibold text-[#1C1C1A]">
          <Icon className="h-4 w-4 text-[#C4501F]" />
          {titulo}
        </CardTitle>
        {descricao && <p className="text-sm text-[#8A867C]">{descricao}</p>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigApp | null>(null);
  const [espacoKB, setEspacoKB] = useState(0);
  const [totalTrabalhos, setTotalTrabalhos] = useState(0);

  useEffect(() => {
    setConfig(lerConfig());
    setEspacoKB(espacoUsadoKB());
    setTotalTrabalhos(listarHistorico().length);
  }, []);

  if (!config) return null;

  const atualizar = (patch: Partial<ConfigApp>) => {
    const novo = { ...config, ...patch };
    setConfig(novo);
    salvarConfig(novo);
  };

  const handleLimparHistorico = () => {
    limparHistorico();
    setTotalTrabalhos(0);
    setEspacoKB(espacoUsadoKB());
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C4501F]">
            <Settings className="h-3.5 w-3.5" />
            Configurações
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1C1C1A]">
            Preferências
          </h1>
        </div>

        <div className="space-y-6">
          {/* Aparência */}
          <Secao icon={Palette} titulo="Aparência">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#1C1C1A]">Tema</Label>
                <p className="text-xs text-[#8A867C]">Claro, escuro, ou de acordo com o sistema.</p>
              </div>
              <ThemeToggle />
            </div>
          </Secao>

          {/* Padrões de impressão */}
          <Secao
            icon={Printer}
            titulo="Padrões de impressão"
            descricao="Pré-selecionados ao abrir a tela de Imprimir. Você ainda pode mudar por trabalho."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-[#5C594F]">Papel padrão</Label>
                <select
                  value={config.papelPadrao}
                  onChange={(e) => atualizar({ papelPadrao: e.target.value })}
                  className="mt-1 w-full rounded-md border border-[#E5E2DA] bg-white p-2 text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
                >
                  {(Object.entries(PAPER_SIZES) as Array<[string, { label: string }]>).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[#5C594F]">Layout padrão</Label>
                <select
                  value={config.layoutPadraoIdx}
                  onChange={(e) => atualizar({ layoutPadraoIdx: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-[#E5E2DA] bg-white p-2 text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
                >
                  {LAYOUTS.map((l, i) => (
                    <option key={i} value={i}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[#5C594F]">Margem padrão (mm)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.margemPadrao}
                  onChange={(e) => atualizar({ margemPadrao: Number(e.target.value) || 0 })}
                  className="mt-1 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                />
              </div>

              <div>
                <Label className="text-[#5C594F]">Espaço entre imagens (mm)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.gapPadrao}
                  onChange={(e) => atualizar({ gapPadrao: Number(e.target.value) || 0 })}
                  className="mt-1 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                />
              </div>

              <div>
                <Label className="text-[#5C594F]">Cópias padrão</Label>
                <Input
                  type="number"
                  min={1}
                  value={config.copiasPadrao}
                  onChange={(e) => atualizar({ copiasPadrao: Number(e.target.value) || 1 })}
                  className="mt-1 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                />
              </div>

              <div>
                <Label className="text-[#5C594F]">Modo de ajuste padrão</Label>
                <select
                  value={config.fitModePadrao}
                  onChange={(e) => atualizar({ fitModePadrao: e.target.value as "contain" | "cover" })}
                  className="mt-1 w-full rounded-md border border-[#E5E2DA] bg-white p-2 text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
                >
                  <option value="contain">Manter proporção</option>
                  <option value="cover">Preencher célula</option>
                </select>
              </div>
            </div>
          </Secao>

          {/* Histórico */}
          <Secao icon={History} titulo="Histórico">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1C1C1A]">
                  {totalTrabalhos} trabalho{totalTrabalhos !== 1 ? "s" : ""} salvo{totalTrabalhos !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[#8A867C]">~{espacoKB} KB usados no navegador</p>
              </div>
              <button
                onClick={handleLimparHistorico}
                disabled={totalTrabalhos === 0}
                className="rounded-md border border-[#E5E2DA] px-3 py-1.5 text-sm font-medium text-[#1C1C1A] hover:bg-[#FBEAE6] hover:text-[#B23A1E] disabled:opacity-40"
              >
                Limpar histórico
              </button>
            </div>
            <div className="h-px bg-[#E5E2DA] my-3" />
            <p className="text-xs text-[#8A867C]">
              O histórico é salvo apenas neste navegador e não é enviado para
              nenhum servidor. Limpar o navegador também apaga o histórico.
            </p>
          </Secao>

          {/* Sobre */}
          <Secao icon={Info} titulo="Sobre">
            <p className="text-sm text-[#5C594F]">Copiadora — ferramenta local de layout e impressão.</p>
            <p className="text-xs text-[#8A867C]">Versão 1.0.0</p>
          </Secao>
        </div>
      </div>
    </div>
  );
}
