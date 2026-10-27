import React, { useEffect, useRef } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderPageToCanvas } from '../utils/pdfEngine';
import type { PageInfo, ThemeMode } from '../types/pdf';

interface ThumbnailFilmstripProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pagesInfo: PageInfo[];
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
  isOpen: boolean;
  theme?: ThemeMode;
}

export const ThumbnailFilmstrip: React.FC<ThumbnailFilmstripProps> = ({
  pdfDoc,
  pagesInfo,
  currentPage,
  onSelectPage,
  isOpen,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const activePages = pagesInfo.filter((p) => !p.isDeleted);

  return (
    <aside
      className={`w-48 border-r flex flex-col shrink-0 select-none overflow-y-auto transition-colors duration-150 ${
        isDark
          ? 'bg-neutral-900/95 border-neutral-800 text-neutral-300'
          : 'bg-white/95 border-slate-200 text-slate-700'
      }`}
    >
      <div
        className={`p-3 border-b text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
        }`}
      >
        <span>Pages ({activePages.length})</span>
      </div>

      <div className="p-3 space-y-3">
        {activePages.map((page) => {
          const isActive = currentPage === page.pageNumber;
          return (
            <button
              key={page.pageNumber}
              onClick={() => onSelectPage(page.pageNumber)}
              className={`w-full flex flex-col items-center p-2 rounded-lg transition-all text-left ${
                isActive
                  ? isDark
                    ? 'bg-neutral-800 ring-1 ring-amber-500 shadow-xs'
                    : 'bg-amber-50 ring-1 ring-amber-400 shadow-2xs'
                  : isDark
                  ? 'hover:bg-neutral-800/60'
                  : 'hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-full h-32 rounded flex items-center justify-center overflow-hidden border ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <MiniThumbnail
                  pdfDoc={pdfDoc}
                  pageNumber={page.pageNumber}
                  rotation={page.currentRotation || 0}
                />
              </div>
              <span
                className={`mt-1.5 text-xs font-mono tabular-nums ${
                  isActive
                    ? isDark
                      ? 'text-amber-400 font-semibold'
                      : 'text-amber-700 font-semibold'
                    : isDark
                    ? 'text-neutral-400'
                    : 'text-slate-500'
                }`}
              >
                Page {page.pageNumber}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

const MiniThumbnail: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  rotation: number;
}> = ({ pdfDoc, pageNumber, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, 0.22, rotation);
      } catch (e) {
        if (!cancelled) console.error(e);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, rotation]);

  return <canvas ref={canvasRef} className="max-w-full max-h-[120px] shadow-2xs pointer-events-none" />;
};
