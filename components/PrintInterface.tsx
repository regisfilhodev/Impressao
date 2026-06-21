"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
// dialog modal removed; using inline collapsible panel instead
import PreviewGrid from "./PreviewGrid";
import LayoutsSidebar from "./LayoutsSidebar";

export type PaperMeta = { label: string; w: number; h: number };

export const PAPER_SIZES: Record<string, PaperMeta> = {
  a4: { label: "A4", w: 210, h: 297 },
  "10x15": { label: "10 x 15 cm", w: 100, h: 150 },
  "13x18": { label: "13 x 18 cm", w: 130, h: 180 },
  "20x25": { label: "20 x 25 cm", w: 200, h: 250 },
};

// Layouts: cada item define quantas células (c x r) e o tamanho FÍSICO real
// de cada célula em mm (cellW x cellH). É isso que faz a foto sair no tamanho
// correto (ex: 10x15 retrato) em vez de esticada/quadrada pra caber no grid.
// cellW/cellH ausentes = a célula divide igualmente o espaço da folha (como antes).
const LAYOUTS = [
  { label: "Foto de página inteira", c: 1, r: 1 },
  { label: "10 x 15 cm. (2 por folha)", c: 2, r: 1, cellW: 100, cellH: 150 },
  { label: "13 x 18 cm. (2)", c: 2, r: 1, cellW: 130, cellH: 180 },
  { label: "10 x 15 cm. (4)", c: 2, r: 2, cellW: 100, cellH: 150 },
  { label: "Polaroid (4)", c: 2, r: 2, cellW: 89, cellH: 108 },
  { label: "Polaroid (6)", c: 2, r: 3, cellW: 89, cellH: 108 },
  { label: "6 por página", c: 3, r: 2 },
  { label: "8 por página", c: 4, r: 2 },
  { label: "9 por página", c: 3, r: 3 },
  { label: "12 por página", c: 4, r: 3 },
  { label: "15 por página", c: 5, r: 3 },
  { label: "16 por página", c: 4, r: 4 },
  { label: "20 por página", c: 5, r: 4 },
  { label: "24 por página", c: 6, r: 4 },
];

interface ImageData { url: string; file: File }

export default function PrintInterface() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeLayoutIdx, setActiveLayoutIdx] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Pronto");
  const [paperSize, setPaperSize] = useState("a4");
  const [copies, setCopies] = useState(1);
  const [paperType, setPaperType] = useState(() => {
    const keys = Object.keys(PAPER_SIZES || {});
    return keys.length ? keys[0] : "a4";
  });
  const [fitCheck, setFitCheck] = useState(true);

  const [orientation, setOrientation] = useState("portrait");
  const [margin, setMargin] = useState(5);
  const [gap, setGap] = useState(2);
  const [fitMode, setFitMode] = useState("contain");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Removido: integração com servidor Python. Enviaremos para a janela de impressão do navegador.

  // A célula (cellW/cellH) é quem define a proporção da foto agora —
  // o usuário escolhe livremente o tamanho da folha no seletor (A4, 10x15
  // física, etc), sem precisarmos forçar nada por layout.

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map((f) => ({ url: URL.createObjectURL(f), file: f }));
    setImages((prev) => [...prev, ...newImages]);
    setCurPage(0);
  };

  const imageSequence = useMemo(() => {
    if (!images.length) return [];
    const seq: string[] = [];
    images.forEach((img) => { for (let i = 0; i < copies; i++) seq.push(img.url); });
    return seq;
  }, [images, copies]);

  const layout = LAYOUTS[activeLayoutIdx];
  const perPage = layout.c * layout.r;
  const totalPages = Math.max(1, Math.ceil(imageSequence.length / perPage));

  const handlePrint = async () => {
    if (!images.length) { alert("Adicione ao menos uma imagem."); return; }
    setIsPrinting(true);
    setStatusMsg("Processando imagens...");

    try {
      const b64list: string[] = [];
      for (const img of images) {
        const b64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(img.file);
        });
        for (let i = 0; i < copies; i++) b64list.push(b64);
      }

      // Monta HTML para impressão no navegador — o usuário escolherá a impressora
      const paperW = PAPER_SIZES[paperSize].w;
      const paperH = PAPER_SIZES[paperSize].h;
      const w = orientation === "portrait" ? paperW : paperH;
      const h = orientation === "portrait" ? paperH : paperW;

      // ensure cols/rows are defined (use layout values or fall back to 1)
      const cols = typeof layout?.c !== 'undefined' ? layout.c : 1;
      const rows = typeof layout?.r !== 'undefined' ? layout.r : 1;

      // definir colunas/linhas do grid para uso no CSS de impressão
      const gridCols = `repeat(${cols}, 1fr)`;
      const gridRows = `repeat(${rows}, 1fr)`;

      const pages: string[] = [];
      for (let p = 0; p < totalPages; p++) {
        const start = p * perPage;
        const imgs = b64list.slice(start, start + perPage);

        const cellsHtml = Array.from({ length: perPage }).map((_, i) => {
          const src = imgs[i] || '';
          return `<div class="cell">${src ? `<img src="${src}" style="width:100%;height:100%;object-fit:${fitCheck ? 'cover' : fitMode};"/>` : ''}</div>`;
        }).join('\n');

        pages.push(`
          <div class="page">
            <div class="grid">${cellsHtml}</div>
          </div>
        `);
      }

      const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Impressão</title>
        <style>
          @page { size: ${w}mm ${h}mm; margin: 0mm; }
          html,body{margin:0;padding:0}
          .page{width:${w}mm;height:${h}mm;box-sizing:border-box;padding:${margin}mm;display:flex;align-items:stretch;justify-content:stretch}
          .grid{display:grid;gap:${gap}mm;grid-template-columns:${gridCols};grid-template-rows:${gridRows};width:100%;height:100%}
          .cell{background:#fff;overflow:hidden}
          img{display:block}
        </style>
      </head><body>${pages.join('\n')}<script>window.onload=()=>{setTimeout(()=>{window.print();},200);}</script></body></html>`;

      const wref = window.open('', '_blank');
      if (!wref) { alert('Bloqueador de popups impediu a abertura da janela de impressão.'); setIsPrinting(false); return; }
      wref.document.open();
      wref.document.write(doc);
      wref.document.close();
      setStatusMsg('Janela de impressão aberta — escolha a impressora e confirme.');
    } catch (err) { console.error(err); alert('Erro ao preparar impressão. Veja o console.'); setStatusMsg('Erro na preparação'); }
    finally { setIsPrinting(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-6xl border-[#E5E2DA] shadow-xl">
        <CardHeader className="border-b border-[#E5E2DA] bg-white rounded-t-xl px-6 py-4">
          <div className="flex items-center gap-2">
            <CardTitle className="font-serif text-xl font-semibold text-[#1C1C1A]">
              Imprimir imagens
            </CardTitle>
          </div>
        </CardHeader>

        <div className="bg-white px-6 py-4 border-b border-[#E5E2DA] flex flex-wrap gap-4 items-end">
          <div className="grid gap-1.5 flex-1 min-w-[50px]">
            <Label className="text-[#5C594F]">Tamanho do papel</Label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="w-full bg-white border border-[#E5E2DA] p-2 rounded-md text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
            >
              {(Object.entries(PAPER_SIZES) as Array<[string, { label: string }]>).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5 flex-1 min-w-[50px]">
            <Label className="text-[#5C594F]">Tipo de papel</Label>
            <select
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
              className="w-full bg-white border border-[#E5E2DA] p-2 rounded-md text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
            >
              {(Object.entries(PAPER_TYPES) as Array<[string, { label: string }]>).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <CardContent className="p-0 flex flex-col md:flex-row h-[600px]">
          <div
            className="flex-1 bg-[#1C1C1A] p-6 flex flex-col relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            {images.length === 0 ? (
              <div
                className="flex-1 border-2 border-dashed border-[#5C594F] rounded-xl flex flex-col items-center justify-center text-[#A8A496] cursor-pointer hover:bg-white/5 hover:border-[#C4501F]/60 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <p>Clique ou arraste imagens aqui</p>
                <p className="text-sm">JPG, PNG, BMP</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <PreviewGrid
                  imageSequence={imageSequence}
                  layout={layout}
                  perPage={perPage}
                  curPage={curPage}
                  margin={margin}
                  gap={gap}
                  orientation={orientation}
                  paperSize={paperSize}
                  fitCheck={fitCheck}
                  fitMode={fitMode}
                />
              </div>
            )}

            {images.length > 0 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white border-[#E5E2DA] hover:bg-[#FBF1EC] hover:text-[#C4501F]"
                  onClick={() => setCurPage(p => Math.max(0, p - 1))}
                  disabled={curPage === 0}
                >
                  ◀
                </Button>
                <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  Página {curPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white border-[#E5E2DA] hover:bg-[#FBF1EC] hover:text-[#C4501F]"
                  onClick={() => setCurPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={curPage === totalPages - 1}
                >
                  ▶
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="w-full md:w-64 border-l border-[#E5E2DA] bg-white h-full">
            <LayoutsSidebar
              layouts={LAYOUTS}
              activeLayoutIdx={activeLayoutIdx}
              setActiveLayoutIdx={setActiveLayoutIdx}
              setCurPage={setCurPage}
            />
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border-t border-[#E5E2DA] rounded-b-xl gap-4">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label className="text-[#5C594F]">Cópias:</Label>
                <Input
                  type="number"
                  min="1"
                  className="w-20 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                  value={copies}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCopies(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fit"
                  checked={fitCheck}
                  onCheckedChange={(c: boolean) => setFitCheck(Boolean(c))}
                  className="data-[state=checked]:bg-[#C4501F] data-[state=checked]:border-[#C4501F]"
                />
                <Label htmlFor="fit" className="cursor-pointer text-[#1C1C1A]">Ajustar imagem ao quadro</Label>
              </div>

              <div>
                <Label className="text-[#5C594F]">Orientação</Label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="ml-2 w-36 bg-white border border-[#E5E2DA] p-2 rounded-md mt-1 text-sm text-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
                >
                  <option value="portrait">Retrato</option>
                  <option value="landscape">Paisagem</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="link"
                className="text-[#C4501F] px-0 hover:text-[#A03D14]"
                onClick={() => setShowAdvanced((s) => !s)}
              >
                Opções avançadas...
              </Button>
            </div>

            {showAdvanced && (
              <div className="mt-3 sm:max-w-[425px] bg-[#FAFAF8] border border-[#E5E2DA] p-4 rounded-md">
                <h3 className="font-serif text-base font-semibold text-[#1C1C1A] mb-2">Opções de impressão</h3>
                <div className="grid gap-4">
                  <div>
                    <Label className="text-[#5C594F]">Modo de ajuste</Label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value)}
                      disabled={fitCheck}
                      className="w-full bg-white border border-[#E5E2DA] p-2 rounded-md mt-1 text-sm text-[#1C1C1A] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C4501F]/40"
                    >
                      <option value="contain">Manter proporção</option>
                      <option value="cover">Preencher célula</option>
                    </select>
                    <p className="text-xs text-[#8A867C] mt-1">
                      {fitCheck ? 'Modo "Preencher célula" será aplicado automaticamente.' : 'Modo aplicado às imagens dentro de cada célula.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
                    <div>
                      <Label className="text-[#5C594F]">Margem (mm)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={margin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMargin(Number(e.target.value) || 0)}
                        className="w-full mt-1 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                      />
                      <p className="text-xs text-[#8A867C] mt-1">Margem aplicada ao redor da página.</p>
                    </div>

                    <div>
                      <Label className="text-[#5C594F]">Espaço entre imagens (mm)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={gap}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGap(Number(e.target.value) || 0)}
                        className="w-full mt-1 bg-white border-[#E5E2DA] focus-visible:ring-[#C4501F]/40"
                      />
                      <p className="text-xs text-[#8A867C] mt-1">Distância entre células do layout.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImages([])}
              className="border-[#E5E2DA] text-[#1C1C1A] hover:bg-[#FAFAF8]"
            >
              Limpar
            </Button>
            <Button
              onClick={handlePrint}
              disabled={isPrinting || images.length === 0}
              className="bg-[#1C1C1A] hover:bg-[#C4501F] min-w-[120px] text-[#FAFAF8]"
            >
              {isPrinting ? "Enviando..." : "Imprimir"}
            </Button>
          </div>
        </CardFooter>

        <div className="bg-[#FBF1EC] text-xs text-[#5C594F] px-4 py-1.5 flex justify-start rounded-b-xl border-t border-[#E5E2DA]">
          <span>{statusMsg}</span>
        </div>
      </Card>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

export { LAYOUTS };
export const PAPER_TYPES: Record<string, { label: string }> = {
  normal: { label: "Normal" },
  glossy: { label: "Paper Glossy" },
  matte: { label: "Presentation Matte" },
};
