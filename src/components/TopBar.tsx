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
  Laptop,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';
import type { DocumentMetadata, DeviceMode, ThemeMode } from '../types/pdf';

interface TopBarProps {
  activeTab: 'editor' | 'organizer' | 'watermark' | 'merge';
  onSelectTab: (tab: 'editor' | 'organizer' | 'watermark' | 'merge') => void;
  metadata: DocumentMetadata;
  onRenameDocument: (name: string) => void;
  onOpenFile: (file: File) => void;
  onOpenSampleModal: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  isGeminiOpen: boolean;
  onToggleGemini: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  currentPage: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
  onPrint: () => void;
  deviceMode: DeviceMode;
  onToggleDeviceMode: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
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
  isGeminiOpen,
  onToggleGemini,
  onExportPDF,
  isExporting,
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onJumpToPage,
  onPrint,
  deviceMode,
  onToggleDeviceMode,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
      e.target.value = '';
    }
  };

  const isDark = theme === 'dark';

  return (
    <header
      className={`flex items-center justify-between gap-4 px-5 py-2.5 border-b backdrop-blur-md shrink-0 z-30 transition-colors duration-150 ${
        isDark
          ? 'border-neutral-800 bg-neutral-900/90 text-neutral-100'
          : 'border-slate-200 bg-white/95 text-slate-800 shadow-xs'
      }`}
    >
      {/* Zone 1: Wordmark brand element */}
      <div className="flex items-center gap-3.5 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('editor');
          }}
          className={`text-base font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2.5 ${
            isDark
              ? 'text-neutral-100 hover:text-amber-400'
              : 'text-slate-900 hover:text-amber-600'
          }`}
        >
          <img
            src="/src/assets/images/golden_pdf_fire_icon_1793085393360.jpg"
            alt="AuraPDF 2026 Golden Fire Document Icon"
            className="w-7 h-7 rounded-md object-cover shadow-md border border-amber-500/40 ring-1 ring-amber-400/20"
            referrerPolicy="no-referrer"
          />
          <span>AuraPDF Studio</span>
        </a>

        {/* Inline editable document title */}
        <div
          className={`hidden lg:flex items-center gap-2 pl-3 border-l text-xs ${
            isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => onRenameDocument(e.target.value)}
            className={`bg-transparent px-2 py-1 rounded font-medium max-w-[200px] truncate border border-transparent outline-none transition-colors ${
              isDark
                ? 'hover:bg-neutral-800/80 focus:bg-neutral-800 text-neutral-200 focus:border-neutral-700'
                : 'hover:bg-slate-100 focus:bg-slate-100 text-slate-800 focus:border-slate-300'
            }`}
            title="Click to rename document"
          />
          <span className={`font-mono tabular-nums ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            {(metadata.sizeBytes / 1024).toFixed(0)} KB
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-line, concise) */}
      <nav className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => onSelectTab('editor')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'editor'
              ? isDark
                ? 'bg-neutral-800 text-amber-400 shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => onSelectTab('organizer')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'organizer'
              ? isDark
                ? 'bg-neutral-800 text-amber-400 shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Organize Pages
        </button>
        <button
          onClick={() => onSelectTab('watermark')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'watermark'
              ? isDark
                ? 'bg-neutral-800 text-amber-400 shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Watermark & Numbering
        </button>
        <button
          onClick={() => onSelectTab('merge')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'merge'
              ? isDark
                ? 'bg-neutral-800 text-amber-400 shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Merge & Convert
        </button>
      </nav>

      {/* Zone 3: Document Actions, Mode Toggles & Primary Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Theme Switcher Button (Dark Mode / Light Mode) */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isDark
              ? 'border-neutral-700 bg-neutral-800 text-amber-300 hover:bg-neutral-700 hover:text-amber-200'
              : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-900 shadow-2xs'
          }`}
          title={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline font-medium">Dark</span>
            </>
          )}
        </button>

        {/* Device Mode Switch Button (Laptop Mode vs Android Mode) */}
        <div
          className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => deviceMode !== 'laptop' && onToggleDeviceMode()}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              deviceMode === 'laptop'
                ? isDark
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-xs'
                  : 'bg-white text-slate-900 font-semibold shadow-xs'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to Laptop / Desktop Mode"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Laptop</span>
          </button>
          <button
            onClick={() => deviceMode !== 'android' && onToggleDeviceMode()}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              deviceMode === 'android'
                ? isDark
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-xs'
                  : 'bg-white text-slate-900 font-semibold shadow-xs'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to Android Mode (Touch optimized)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Android</span>
          </button>
        </div>

        {/* Gemini AI Copilot button */}
        <button
          onClick={onToggleGemini}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            isGeminiOpen
              ? 'bg-amber-500 text-neutral-950 shadow-md ring-1 ring-amber-400'
              : isDark
              ? 'text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
              : 'text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/70 border border-amber-300/80 shadow-2xs'
          }`}
          title="Open Gemini AI Document Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Gemini AI</span>
        </button>

        {/* Sample docs button */}
        <button
          onClick={onOpenSampleModal}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            isDark
              ? 'text-neutral-300 hover:text-white bg-neutral-800/70 hover:bg-neutral-800'
              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
          title="Browse professional sample documents"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            isDark
              ? 'text-neutral-300 hover:text-white bg-neutral-800/70 hover:bg-neutral-800'
              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
          title="Open PDF from device"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Open</span>
        </button>

        {/* Print button */}
        <button
          onClick={onPrint}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Print Document"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Primary Download / Export CTA */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-all shadow-xs whitespace-nowrap active:scale-98"
          title="Download edited PDF document"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>
    </header>
  );
};
