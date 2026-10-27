import React, { useEffect, useRef } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderPageToCanvas } from '../utils/pdfEngine';
import type { PageInfo } from '../types/pdf';

interface ThumbnailFilmstripProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pagesInfo: PageInfo[];
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
  isOpen: boolean;
}

export const ThumbnailFilmstrip: React.FC<ThumbnailFilmstripProps> = ({
  pdfDoc,
  pagesInfo,
  currentPage,
  onSelectPage,
  isOpen,
}) => {
  if (!isOpen) return null;

  const activePages = pagesInfo.filter((p) => !p.isDeleted);

  return (
    <aside className="w-48 bg-neutral-900/95 border-r border-neutral-800 flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-3 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
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
                  ? 'bg-neutral-800 ring-1 ring-amber-500 shadow-xs'
                  : 'hover:bg-neutral-800/60'
              }`}
            >
              <div className="w-full h-32 bg-neutral-950 rounded flex items-center justify-center overflow-hidden border border-neutral-800">
                <MiniThumbnail
                  pdfDoc={pdfDoc}
                  pageNumber={page.pageNumber}
                  rotation={page.currentRotation || 0}
                />
              </div>
              <span
                className={`mt-1.5 text-xs font-mono tabular-nums ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-neutral-400'
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
