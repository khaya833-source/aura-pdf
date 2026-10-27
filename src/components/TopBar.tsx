import React, { useRef } from 'react';
import {
  Download,
  FolderOpen,
  Printer,
  Sparkles,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import type { DocumentMetadata } from '../types/pdf';

interface TopBarProps {
  activeTab: 'editor' | 'organizer' | 'watermark' | 'merge';
  onSelectTab: (tab: 'editor' | 'organizer' | 'watermark' | 'merge') => void;
  metadata: DocumentMetadata;
  onRenameDocument: (name: string) => void;
  onOpenFile: (file: File) => void;
  onOpenSampleModal: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onExportPDF: () => void;
  isExporting: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  currentPage: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
  onPrint: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  metadata,
  onRenameDocument,
  onOpenFile,
  onOpenSampleModal,
  onToggleSearch,
  isSearchOpen,
  onExportPDF,
  isExporting,
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onJumpToPage,
  onPrint,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md shrink-0 z-30">
      {/* Zone 1: Wordmark brand element */}
      <div className="flex items-center gap-4 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('editor');
          }}
          className="text-base font-bold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-xs">
            A
          </div>
          <span>AuraPDF Studio</span>
        </a>

        {/* Inline editable document title */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-neutral-800 text-xs text-neutral-400">
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => onRenameDocument(e.target.value)}
            className="bg-transparent hover:bg-neutral-800/80 focus:bg-neutral-800 px-2 py-1 rounded text-neutral-200 font-medium max-w-[220px] truncate border border-transparent focus:border-neutral-700 outline-none transition-colors"
            title="Click to rename document"
          />
          <span className="font-mono text-neutral-500 tabular-nums">
            {(metadata.sizeBytes / 1024).toFixed(0)} KB
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-line, concise) */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onSelectTab('editor')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'editor'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => onSelectTab('organizer')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'organizer'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          Organize Pages
        </button>
        <button
          onClick={() => onSelectTab('watermark')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'watermark'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          Watermark & Numbering
        </button>
        <button
          onClick={() => onSelectTab('merge')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'merge'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          Merge & Convert
        </button>
      </nav>

      {/* Zone 3: Document Actions & Primary Export */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sample docs button */}
        <button
          onClick={onOpenSampleModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/70 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
          title="Browse professional sample documents"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Samples</span>
        </button>

        {/* Open local PDF file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/70 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
          title="Open PDF from device"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Open</span>
        </button>

        {/* Print button */}
        <button
          onClick={onPrint}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          title="Print Document"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Primary Export CTA */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-all shadow-xs whitespace-nowrap active:scale-98"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
        </button>
      </div>
    </header>
  );
};
