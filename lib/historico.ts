// lib/historico.ts
//
// Histórico de trabalhos de impressão, salvo inteiramente no navegador
// (localStorage). Sem backend, sem banco — perde ao limpar o navegador,
// o que é aceitável pra esse caso de uso.

const STORAGE_KEY = "copiadora:historico";
const MAX_ITEMS = 60; // trava de segurança pro limite de ~5-10MB do localStorage

export interface TrabalhoHistorico {
  id: string;
  dataHora: string; // ISO string
  layoutLabel: string;
  papel: string;
  copias: number;
  paginas: number;
  status: "enviado" | "erro";
  thumbnail: string; // dataURL JPEG pequeno (preview da 1ª imagem do trabalho)
  // Configurações completas, para reabrir o editor e remontar o trabalho.
  config: {
    activeLayoutIdx: number;
    paperSize: string;
    orientation: string;
    margin: number;
    gap: number;
    fitCheck: boolean;
    fitMode: string;
    copies: number;
  };
}

/** Gera uma thumbnail JPEG pequena e comprimida a partir de uma imagem (dataURL ou object URL). */
export async function gerarThumbnail(
  src: string,
  maxW = 80,
  maxH = 120,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D não disponível"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem para thumbnail"));
    img.src = src;
  });
}

function lerTudo(): TrabalhoHistorico[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Dados corrompidos ou JSON inválido — não trava o app, só reseta o histórico.
    return [];
  }
}

function salvarTudo(items: TrabalhoHistorico[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    // Provavelmente quota excedida (QuotaExceededError). Tenta remover os
    // mais antigos e salvar de novo antes de desistir.
    try {
      const reduzido = items.slice(0, Math.max(5, Math.floor(items.length / 2)));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reduzido));
      return true;
    } catch {
      return false;
    }
  }
}

export function listarHistorico(): TrabalhoHistorico[] {
  return lerTudo().sort((a, b) => (a.dataHora < b.dataHora ? 1 : -1));
}

export function adicionarHistorico(item: Omit<TrabalhoHistorico, "id" | "dataHora">): TrabalhoHistorico {
  const novo: TrabalhoHistorico = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataHora: new Date().toISOString(),
  };
  const atual = lerTudo();
  const atualizado = [novo, ...atual].slice(0, MAX_ITEMS);
  salvarTudo(atualizado);
  return novo;
}

export function removerHistorico(id: string): void {
  const atual = lerTudo().filter((t) => t.id !== id);
  salvarTudo(atual);
}

export function limparHistorico(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Resumo do dia atual: total de páginas e total de trabalhos. */
export function resumoDeHoje(items: TrabalhoHistorico[]) {
  const hoje = new Date().toDateString();
  const doDia = items.filter((t) => new Date(t.dataHora).toDateString() === hoje);
  return {
    totalTrabalhos: doDia.length,
    totalPaginas: doDia.reduce((acc, t) => acc + t.paginas, 0),
  };
}
