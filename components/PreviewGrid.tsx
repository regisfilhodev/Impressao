import React from "react";
import { PAPER_SIZES } from "./PrintInterface";

interface LayoutWithCell {
  c: number;
  r: number;
  cellW?: number;
  cellH?: number;
}

interface Props {
  imageSequence: string[];
  layout: LayoutWithCell;
  perPage: number;
  curPage: number;
  margin: number;
  gap: number;
  orientation: string;
  paperSize: string;
  fitCheck: boolean;
  fitMode: string;
}

export const PreviewGrid: React.FC<Props> = ({
  imageSequence,
  layout,
  perPage,
  curPage,
  margin,
  gap,
  orientation,
  paperSize,
  fitCheck,
  fitMode,
}) => {
  const startIdx = curPage * perPage;
  const pageImages = imageSequence.slice(startIdx, startIdx + perPage);

  const paper = PAPER_SIZES[paperSize];
  const sheetWmm = orientation === "portrait" ? paper.w : paper.h;
  const sheetHmm = orientation === "portrait" ? paper.h : paper.w;
  const sheetAspect = sheetHmm / sheetWmm;

  // Quando o layout define cellW/cellH (ex: "10 x 15 cm."), cada célula precisa
  // manter essa proporção física real em vez de esticar pra preencher 1fr do
  // grid — é isso que faz a foto saír 10x15 de verdade, igual ao Windows,
  // em vez de quadrada/distorcida. Tudo é calculado em "unidades de mm da
  // folha" (0–100% do lado útil), então não há conflito entre width/height
  // e aspect-ratio no CSS final.
  const hasFixedCell = Boolean(layout.cellW && layout.cellH);

  const usableWmm = sheetWmm - margin * 2 - gap * (layout.c - 1);
  const usableHmm = sheetHmm - margin * 2 - gap * (layout.r - 1);

  // Tamanho final de cada célula em mm: usa o tamanho físico pedido, mas
  // nunca maior do que o espaço disponível (evita vazar da folha).
  let cellWmm = usableWmm / layout.c;
  let cellHmm = usableHmm / layout.r;

  if (hasFixedCell) {
    const reqW = layout.cellW as number;
    const reqH = layout.cellH as number;
    const maxWByCol = usableWmm / layout.c;
    const maxHByRow = usableHmm / layout.r;
    const scale = Math.min(1, maxWByCol / reqW, maxHByRow / reqH);
    cellWmm = reqW * scale;
    cellHmm = reqH * scale;
  }

  const gridWmm = cellWmm * layout.c + gap * (layout.c - 1);
  const gridHmm = cellHmm * layout.r + gap * (layout.r - 1);

  return (
    <div
      className="relative bg-white shadow-lg mx-auto"
      style={{
        aspectRatio: `1 / ${sheetAspect}`,
        height: "100%",
        maxHeight: "60vh",
        padding: `${margin}px`,
      }}
    >
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${(gridWmm / sheetWmm) * 100}%`,
          height: `${(gridHmm / sheetHmm) * 100}%`,
          display: "grid",
          gridTemplateColumns: `repeat(${layout.c}, 1fr)`,
          gridTemplateRows: `repeat(${layout.r}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: perPage }).map((_, i) => (
          <div key={i} className="bg-slate-200 overflow-hidden relative">
            {pageImages[i] && (
              <img
                src={pageImages[i]}
                alt="preview"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: fitCheck ? "cover" : (fitMode as any) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewGrid;
