"use client";

import Link from "next/link";
import { House, Printer, History, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Início", icon: House },
  { href: "/print", label: "Imprimir", icon: Printer },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname() || "/home";

  return (
    <aside className="relative hidden w-64 flex-col border-r border-[#E5E2DA] bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[#E5E2DA] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1C1C1A] text-sm font-bold text-[#FAFAF8] overflow-hidden">
          <img src="/logo.png" alt="Copiadora" className="w-full h-full object-contain" />
        </div>
        <span className="font-serif text-lg font-semibold tracking-tight">Copiadora</span>
      </div>

      <nav className="flex-1 px-3 py-6">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-[#8A867C]">Menu</p>
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/home" && pathname === "/");
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-[#C4501F] bg-[#FBF1EC] font-medium text-[#1C1C1A]"
                      : "border-transparent text-[#5C594F] hover:border-[#E5E2DA] hover:bg-[#FAFAF8]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#C4501F]" : "text-[#8A867C] group-hover:text-[#5C594F]"}`} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E5E2DA] px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-[#5C594F]">
          <span className="h-2 w-2 rounded-full bg-[#3D7A4F]" />
          Impressora conectada
        </div>
      </div>

      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,#E5E2DA_0px,#E5E2DA_1px,transparent_1px,transparent_12px)]"
      />
    </aside>
  );
}
