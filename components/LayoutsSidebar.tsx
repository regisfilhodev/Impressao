import React from "react";

interface Layout { label: string; c: number; r: number; cellW?: number; cellH?: number }

interface Props {
  layouts: Layout[];
  activeLayoutIdx: number;
  setActiveLayoutIdx: (i: number) => void;
  setCurPage: (v: number | ((p: number) => number)) => void;
}

export const LayoutsSidebar: React.FC<Props> = ({ layouts, activeLayoutIdx, setActiveLayoutIdx, setCurPage }) => {
  return (
    <div className="p-2 space-y-1">
      <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-[#8A867C]">
        Layouts
      </p>
      {layouts.map((lay, i) => {
        const active = activeLayoutIdx === i;
        return (
          <div
            key={i}
            onClick={() => { setActiveLayoutIdx(i); setCurPage(0); }}
            className={`p-3 rounded-lg cursor-pointer flex flex-col items-center gap-2 border-l-2 transition-colors
              ${active
                ? "border-[#C4501F] bg-[#FBF1EC]"
                : "border-transparent hover:border-[#E5E2DA] hover:bg-[#FAFAF8]"}`}
          >
            <div
              className="w-20 bg-[#E5E2DA] grid gap-[1px] p-[1px] rounded-sm"
              style={{
                aspectRatio: "1 / 1.41",
                gridTemplateColumns: `repeat(${lay.c}, 1fr)`,
                gridTemplateRows: `repeat(${lay.r}, 1fr)`,
                outline: active ? "2px solid #C4501F" : "none",
                outlineOffset: "1px",
              }}
            >
              {Array.from({ length: lay.c * lay.r }).map((_, j) => (
                <div key={j} className="bg-white w-full h-full"></div>
              ))}
            </div>
            <span className={`text-xs text-center ${active ? "font-semibold text-[#1C1C1A]" : "text-[#5C594F]"}`}>
              {lay.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LayoutsSidebar;
