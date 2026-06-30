import Link from "next/link";
import { House, Printer, History, Settings, ArrowRight } from "lucide-react";


const navItems = [
    { href: "/", label: "home", icon: House, active: true },
    { href: "/print", label: "Imprimir", icon: Printer, active: false },
    { href: "/historico", label: "Histórico", icon: History, active: false },
    { href: "/configuracoes", label: "Configurações", icon: Settings, active: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1A]">
      <header className="flex h-16 items-center justify-between border-b border-[#E5E2DA] px-6 md:hidden">
        <span className="font-serif text-lg font-semibold">Copiadora</span>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-16">
        <div className="w-full max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#C4501F]">
            Impressão local · sem fila, sem nuvem
          </p>

          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-[#1C1C1A] sm:text-5xl">
            Organize, ajuste e imprima
            <br />
            suas fotos na hora.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5C594F]">
            Escolha o layout da folha, ajuste margens e tamanho das imagens,
            e envie direto para a impressora — tudo rodando no seu
            computador, sem depender de internet.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/print"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1C1C1A] px-6 py-3 text-sm font-medium text-[#FAFAF8] shadow-sm transition-colors hover:bg-[#C4501F]"
            >
              Abrir interface de impressão
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/historico"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E2DA] bg-white px-6 py-3 text-sm font-medium text-[#1C1C1A] transition-colors hover:bg-[#FAFAF8]"
            >
              Ver histórico
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 sm:grid-cols-4">
            {["10×15", "13×18", "A4", "Polaroid"].map((size) => (
              <div
                key={size}
                className="flex aspect-[3/4] flex-col items-center justify-center rounded-md border border-[#E5E2DA] bg-white text-xs text-[#8A867C] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 h-8 w-8 rounded-sm border border-dashed border-[#D8D4C8]" />
                {size}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}