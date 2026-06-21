// lib/config.ts
//
// Configurações do app, salvas no navegador. Inclui padrões de impressão
// (usados pra pré-selecionar a tela de Imprimir) e preferências gerais.

const STORAGE_KEY = "copiadora:config";

export interface ConfigApp {
  papelPadrao: string;
  layoutPadraoIdx: number;
  margemPadrao: number;
  gapPadrao: number;
  copiasPadrao: number;
  fitModePadrao: "contain" | "cover";
  diasManterHistorico: number; // 0 = manter sempre
}

export const CONFIG_PADRAO: ConfigApp = {
  papelPadrao: "a4",
  layoutPadraoIdx: 0,
  margemPadrao: 5,
  gapPadrao: 2,
  copiasPadrao: 1,
  fitModePadrao: "contain",
  diasManterHistorico: 0,
};

export function lerConfig(): ConfigApp {
  if (typeof window === "undefined") return CONFIG_PADRAO;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return CONFIG_PADRAO;
    return { ...CONFIG_PADRAO, ...JSON.parse(raw) };
  } catch {
    return CONFIG_PADRAO;
  }
}

export function salvarConfig(config: ConfigApp): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Estimativa do espaço usado por todas as chaves do app no localStorage, em KB. */
export function espacoUsadoKB(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("copiadora:")) {
      total += (window.localStorage.getItem(key)?.length ?? 0) * 2; // UTF-16 ~2 bytes/char
    }
  }
  return Math.round(total / 1024);
}
