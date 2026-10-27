import React, { useEffect, useRef, useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderPageToCanvas, splitPDF } from '../utils/pdfEngine';
import type { PageInfo } from '../types/pdf';
import {
  RotateCw,
  Copy,
  Trash2,
  Undo2,
  ArrowLeft,
  ArrowRight,
  Download,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';

interface PageOrganizerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  originalBytes: Uint8Array;
  pagesInfo: PageInfo[];
  onUpdatePagesInfo: (newPages: PageInfo[]) => void;
  onClose: () => void;
}

export const PageOrganizer: React.FC<PageOrganizerProps> = ({
  pdfDoc,
  originalBytes,
  pagesInfo,
  onUpdatePagesInfo,
  onClose,
}) => {
  const [localPages, setLocalPages] = useState<PageInfo[]>(pagesInfo);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Sync with prop updates
  useEffect(() => {
    setLocalPages(pagesInfo);
  }, [pagesInfo]);

  // Rotate a single page
  const handleRotatePage = (index: number) => {
    setLocalPages((prev) => {
      const updated = [...prev];
      const current = updated[index].currentRotation || 0;
      updated[index] = {
        ...updated[index],
        currentRotation: (current + 90) % 360,
      };
      return updated;
    });
  };

  // Rotate all active pages
  const handleRotateAll = () => {
    setLocalPages((prev) =>
      prev.map((p) => ({
        ...p,
        currentRotation: ((p.currentRotation || 0) + 90) % 360,
      }))
    );
  };

  // Toggle deletion
  const handleToggleDelete = (index: number) => {
    setLocalPages((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isDeleted: !updated[index].isDeleted,
      };
      return updated;
    });
  };

  // Move page left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setLocalPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  // Move page right
  const handleMoveRight = (index: number) => {
    if (index >= localPages.length - 1) return;
    setLocalPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  // Toggle page selection for extraction
  const handleToggleSelect = (pageNumber: number) => {
    setSelectedIndices((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
  };

  // Select all or deselect
  const handleSelectAll = () => {
    if (selectedIndices.length === localPages.filter((p) => !p.isDeleted).length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(localPages.filter((p) => !p.isDeleted).map((p) => p.pageNumber));
    }
  };

  // Extract selected pages to a fresh PDF
  const handleExtractPages = async () => {
    if (selectedIndices.length === 0) return;
    try {
      setIsExtracting(true);
      const extractedBytes = await splitPDF(originalBytes, selectedIndices);
      const blob = new Blob([extractedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_pages_${selectedIndices.join('_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to extract pages:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply changes to parent state
  const handleApply = () => {
    onUpdatePagesInfo(localPages);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 p-6 overflow-y-auto">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Page Organizer & Layout</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Reorder pages, rotate orientation, remove unneeded pages, or extract selections
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRotateAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate All 90°</span>
          </button>

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg transition-colors"
          >
            {selectedIndices.length === localPages.filter((p) => !p.isDeleted).length ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>Select All</span>
          </button>

          {selectedIndices.length > 0 && (
            <button
              onClick={handleExtractPages}
              disabled={isExtracting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg transition-colors border border-amber-500/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Extract Selected ({selectedIndices.length})</span>
            </button>
          )}

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition-colors shadow-xs"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-6">
        {localPages.map((page, index) => {
          const isSelected = selectedIndices.includes(page.pageNumber);
          return (
            <div
              key={`${page.pageNumber}_${index}`}
              className={`flex flex-col bg-neutral-900 border rounded-xl overflow-hidden transition-all ${
                page.isDeleted
                  ? 'opacity-40 border-rose-950/60 bg-rose-950/10'
                  : isSelected
                  ? 'border-amber-500 shadow-md ring-1 ring-amber-500'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Card top toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/80 border-b border-neutral-800/80 text-xs">
                <button
                  onClick={() => handleToggleSelect(page.pageNumber)}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-amber-400"
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  <span className="font-mono font-medium">Page {page.pageNumber}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRotatePage(index)}
                    title="Rotate 90°"
                    className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleDelete(index)}
                    title={page.isDeleted ? 'Restore Page' : 'Delete Page'}
                    className={`p-1 rounded transition-colors ${
                      page.isDeleted
                        ? 'text-emerald-400 hover:bg-emerald-950/40'
                        : 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                    }`}
                  >
                    {page.isDeleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Rendered Page Thumbnail */}
              <div className="p-3 flex items-center justify-center bg-neutral-950 min-h-[180px] relative overflow-hidden">
                <OrganizerThumbnail
                  pdfDoc={pdfDoc}
                  pageNumber={page.pageNumber}
                  rotation={page.currentRotation || 0}
                />
                {page.isDeleted && (
                  <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-2xs flex flex-col items-center justify-center text-rose-400">
                    <Trash2 className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Marked for Deletion</span>
                  </div>
                )}
              </div>

              {/* Card bottom navigation controls (Move Left / Right) */}
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-neutral-800 bg-neutral-900 text-neutral-400 text-xs">
                <button
                  disabled={index === 0}
                  onClick={() => handleMoveLeft(index)}
                  className="p-1 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                  title="Move Page Backward"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Pos {index + 1}
                  {page.currentRotation ? ` · ${page.currentRotation}°` : ''}
                </span>
                <button
                  disabled={index >= localPages.length - 1}
                  onClick={() => handleMoveRight(index)}
                  className="p-1 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                  title="Move Page Forward"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sub-component to render small thumbnail canvas
const OrganizerThumbnail: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  rotation: number;
}> = ({ pdfDoc, pageNumber, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const renderThumb = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, 0.28, rotation);
      } catch (e) {
        if (!cancelled) console.error('Thumbnail render error:', e);
      }
    };
    renderThumb();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, rotation]);

  return <canvas ref={canvasRef} className="max-w-full max-h-[170px] shadow-sm rounded-xs pointer-events-none" />;
};
