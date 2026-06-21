// app/historico/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { History, Printer, Trash2, RotateCcw } from "lucide-react";
import { useHistorico } from "@/hooks/useHistorico";
import { TrabalhoHistorico } from "@/lib/historico";

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: TrabalhoHistorico["status"] }) {
  const ok = status === "enviado";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? "bg-[#EAF3EC] text-[#3D7A4F]" : "bg-[#FBEAE6] text-[#B23A1E]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-[#3D7A4F]" : "bg-[#B23A1E]"}`} />
      {ok ? "Enviado" : "Erro"}
    </span>
  );
}

export default function HistoricoPage() {
  const router = useRouter();
  const { trabalhos, carregado, remover, limpar, resumo } = useHistorico();

  const reimprimir = (trabalho: TrabalhoHistorico) => {
    // Salva a configuração escolhida numa chave temporária que a tela de
    // impressão lê ao montar, e navega de volta pro editor de layout.
    sessionStorage.setItem("copiadora:reimprimir", JSON.stringify(trabalho.config));
    router.push("/imprimir");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C4501F]">
              <History className="h-3.5 w-3.5" />
              Histórico
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1C1C1A]">
              Trabalhos recentes
            </h1>
          </div>

          {trabalhos.length > 0 && (
            <button
              onClick={limpar}
              className="text-sm text-[#8A867C] underline-offset-2 hover:text-[#B23A1E] hover:underline"
            >
              Limpar histórico
            </button>
          )}
        </div>

        {/* Resumo do dia */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:max-w-sm">
          <div className="rounded-lg border border-[#E5E2DA] bg-white p-4">
            <p className="text-2xl font-semibold text-[#1C1C1A]">{resumo.totalTrabalhos}</p>
            <p className="text-xs text-[#8A867C]">trabalhos hoje</p>
          </div>
          <div className="rounded-lg border border-[#E5E2DA] bg-white p-4">
            <p className="text-2xl font-semibold text-[#1C1C1A]">{resumo.totalPaginas}</p>
            <p className="text-xs text-[#8A867C]">páginas hoje</p>
          </div>
        </div>

        {/* Lista ou estado vazio */}
        {!carregado ? null : trabalhos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D8D4C8] bg-white px-6 py-16 text-center">
            <Printer className="mb-3 h-8 w-8 text-[#C4C0B2]" />
            <p className="font-medium text-[#1C1C1A]">Nenhuma impressão ainda</p>
            <p className="mt-1 max-w-sm text-sm text-[#8A867C]">
              Os trabalhos que você enviar para a impressora vão aparecer aqui,
              com a opção de reimprimir com um clique.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {trabalhos.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-4 rounded-lg border border-[#E5E2DA] bg-white p-3 transition-shadow hover:shadow-sm"
              >
                <img
                  src={t.thumbnail}
                  alt=""
                  className="h-14 w-10 flex-shrink-0 rounded-sm border border-[#E5E2DA] object-cover bg-[#F0EDE5]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#1C1C1A]">{t.layoutLabel}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A867C]">
                    {formatarDataHora(t.dataHora)} · {t.papel.toUpperCase()} · {t.paginas} página{t.paginas !== 1 ? "s" : ""} · {t.copias} cópia{t.copias !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => reimprimir(t)}
                    title="Reimprimir"
                    className="flex items-center gap-1.5 rounded-md border border-[#E5E2DA] px-3 py-1.5 text-xs font-medium text-[#1C1C1A] hover:bg-[#FBF1EC] hover:text-[#C4501F]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reimprimir
                  </button>
                  <button
                    onClick={() => remover(t.id)}
                    title="Remover do histórico"
                    className="rounded-md p-1.5 text-[#8A867C] hover:bg-[#FBEAE6] hover:text-[#B23A1E]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
