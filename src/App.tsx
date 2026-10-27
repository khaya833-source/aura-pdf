import React, { useState, useEffect, useRef, useCallback } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { loadPDFForRendering, extractDocumentText, exportEditedPDF } from './utils/pdfEngine';
import { generateSamplePDF } from './utils/sampleDocuments';
import type {
  ToolMode,
  ShapeType,
  StampType,
  Annotation,
  PageInfo,
  WatermarkConfig,
  PageNumberConfig,
  DocumentMetadata,
} from './types/pdf';

import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { PageRenderer } from './components/PageRenderer';
import { PageOrganizer } from './components/PageOrganizer';
import { WatermarkDrawer } from './components/WatermarkDrawer';
import { MergeConvertModal } from './components/MergeConvertModal';
import { ThumbnailFilmstrip } from './components/ThumbnailFilmstrip';
import { SearchPanel } from './components/SearchPanel';
import { SignatureModal } from './components/SignatureModal';
import { SamplePickerModal } from './components/SamplePickerModal';

import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Document state
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    name: 'Master Consulting Agreement.pdf',
    sizeBytes: 0,
    totalPages: 1,
  });
  const [pagesInfo, setPagesInfo] = useState<PageInfo[]>([]);
  const [documentText, setDocumentText] = useState<{ pageNumber: number; text: string }[]>([]);
  const [currentSampleId, setCurrentSampleId] = useState<string>('consulting-agreement');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View state
  const [activeTab, setActiveTab] = useState<'editor' | 'organizer' | 'watermark' | 'merge'>('editor');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.25);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Tool & drawing settings
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [selectedStamp, setSelectedStamp] = useState<StampType>('APPROVED');
  const [drawColor, setDrawColor] = useState<string>('#0f172a');
  const [highlightColor, setHighlightColor] = useState<string>('#fef08a');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(14);
  const [activeSignatureUrl, setActiveSignatureUrl] = useState<string | null>(null);

  // Annotations & History (Undo / Redo)
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Watermark and Numbering configuration
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.15,
    fontSize: 42,
    rotation: 45,
    color: '#64748b',
  });

  const [pageNumbers, setPageNumbers] = useState<PageNumberConfig>({
    enabled: false,
    format: 'Page X of Y',
    position: 'bottom-center',
    fontSize: 9,
    color: '#64748b',
  });

  // Load sample document on initial mount
  useEffect(() => {
    loadSampleDocument('consulting-agreement');
  }, []);

  const loadSampleDocument = async (id: string) => {
    try {
      setIsLoading(true);
      setCurrentSampleId(id);
      const bytes = await generateSamplePDF(id);
      const doc = await loadPDFForRendering(bytes);
      setPdfBytes(bytes);
      setPdfDoc(doc);

      const titleMap: Record<string, string> = {
        'consulting-agreement': 'Master Consulting Agreement.pdf',
        'financial-report': 'Q3 Financial & Risk Brief.pdf',
        'project-invoice': 'Creative Proposal & Invoice.pdf',
      };
      const docName = titleMap[id] || 'Document.pdf';

      setMetadata({
        name: docName,
        sizeBytes: bytes.byteLength,
        totalPages: doc.numPages,
      });

      const initialPages: PageInfo[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const p = await doc.getPage(i);
        initialPages.push({
          pageNumber: i,
          width: p.view[2],
          height: p.view[3],
          originalRotation: p.rotate,
          currentRotation: 0,
          orderIndex: i - 1,
        });
      }
      setPagesInfo(initialPages);
      setCurrentPage(1);
      setAnnotations([]);
      setUndoStack([]);
      setRedoStack([]);

      // Extract text in background
      extractDocumentText(doc)
        .then((txt) => setDocumentText(txt))
        .catch((e) => console.error('Failed text extraction:', e));
    } catch (err) {
      console.error('Failed to load sample document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open user PDF from file input or drag-and-drop
  const handleOpenLocalPDF = async (file: File) => {
    try {
      setIsLoading(true);
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const doc = await loadPDFForRendering(bytes);

      setPdfBytes(bytes);
      setPdfDoc(doc);
      setMetadata({
        name: file.name,
        sizeBytes: file.size,
        totalPages: doc.numPages,
      });

      const pagesList: PageInfo[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const p = await doc.getPage(i);
        pagesList.push({
          pageNumber: i,
          width: p.view[2],
          height: p.view[3],
          originalRotation: p.rotate,
          currentRotation: 0,
          orderIndex: i - 1,
        });
      }
      setPagesInfo(pagesList);
      setCurrentPage(1);
      setAnnotations([]);
      setUndoStack([]);
      setRedoStack([]);
      setActiveTab('editor');

      extractDocumentText(doc)
        .then((txt) => setDocumentText(txt))
        .catch((e) => console.error(e));
    } catch (err) {
      console.error('Failed to open PDF file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & drop handlers on main workspace
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleOpenLocalPDF(file);
    }
  };

  // Annotation manipulations with Undo / Redo
  const handleAddAnnotation = (newAnn: Annotation) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations((prev) => [...prev, newAnn]);
  };

  const handleUpdateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((old) => old.slice(0, old.length - 1));
    setRedoStack((old) => [...old, annotations]);
    setAnnotations(prev);
    setSelectedAnnotationId(null);
  }, [undoStack, annotations]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((old) => old.slice(0, old.length - 1));
    setUndoStack((old) => [...old, annotations]);
    setAnnotations(next);
    setSelectedAnnotationId(null);
  }, [redoStack, annotations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is editing inside an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setActiveTool('select');
        setSelectedAnnotationId(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) {
          handleDeleteAnnotation(selectedAnnotationId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedAnnotationId]);

  // Export Flattened PDF binary
  const handleExportPDF = async () => {
    if (!pdfBytes) return;
    try {
      setIsExporting(true);
      const exportedBytes = await exportEditedPDF({
        originalBytes: pdfBytes,
        annotations,
        pagesInfo,
        watermark,
        pageNumbers,
      });

      const blob = new Blob([exportedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.name.endsWith('.pdf') ? metadata.name : `${metadata.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))));
  const handleZoomReset = () => setZoom(1.25);

  const activePages = pagesInfo.filter((p) => !p.isDeleted);
  const activePageInfo = pagesInfo.find((p) => p.pageNumber === currentPage);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100"
    >
      {/* Top Bar (Strict 3-zone contract) */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        metadata={metadata}
        onRenameDocument={(newName) => setMetadata((m) => ({ ...m, name: newName }))}
        onOpenFile={handleOpenLocalPDF}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onToggleSearch={() => setIsSearchOpen((s) => !s)}
        isSearchOpen={isSearchOpen}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        zoom={zoom}
        onZoomChange={setZoom}
        currentPage={currentPage}
        totalPages={activePages.length}
        onJumpToPage={setCurrentPage}
        onPrint={handlePrint}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* TAB 1: Main Document Editor */}
        {activeTab === 'editor' && (
          <>
            {/* Left Thumbnail Filmstrip */}
            {pdfDoc && (
              <ThumbnailFilmstrip
                pdfDoc={pdfDoc}
                pagesInfo={pagesInfo}
                currentPage={currentPage}
                onSelectPage={(p) => setCurrentPage(p)}
                isOpen={isFilmstripOpen}
              />
            )}

            {/* Canvas Viewer Container */}
            <main className="flex-1 flex flex-col min-w-0 bg-neutral-950 relative overflow-hidden">
              {/* Secondary Context Bar: Floating Toolbar & Pagination */}
              <div className="flex items-center justify-between px-6 py-2.5 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-xs z-20 gap-4 flex-wrap">
                {/* Left toggle for sidebar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFilmstripOpen((o) => !o)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                    title={isFilmstripOpen ? 'Collapse Filmstrip' : 'Expand Filmstrip'}
                  >
                    {isFilmstripOpen ? (
                      <PanelLeftClose className="w-4 h-4" />
                    ) : (
                      <PanelLeftOpen className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-xs text-neutral-400 pl-2 border-l border-neutral-800">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono tabular-nums px-1 text-neutral-300">
                      Page {currentPage} of {activePages.length}
                    </span>
                    <button
                      disabled={currentPage >= activePages.length}
                      onClick={() => setCurrentPage((p) => Math.min(activePages.length, p + 1))}
                      className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Center: Main Floating Interactive Toolbar */}
                <div className="flex justify-center flex-1 max-w-2xl">
                  <Toolbar
                    activeTool={activeTool}
                    onSelectTool={setActiveTool}
                    selectedShape={selectedShape}
                    onSelectShape={setSelectedShape}
                    selectedStamp={selectedStamp}
                    onSelectStamp={setSelectedStamp}
                    drawColor={drawColor}
                    onSelectDrawColor={setDrawColor}
                    highlightColor={highlightColor}
                    onSelectHighlightColor={setHighlightColor}
                    strokeWidth={strokeWidth}
                    onSelectStrokeWidth={setStrokeWidth}
                    fontSize={fontSize}
                    onSelectFontSize={setFontSize}
                    canUndo={undoStack.length > 0}
                    canRedo={redoStack.length > 0}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                    hasActiveSignature={!!activeSignatureUrl}
                  />
                </div>

                {/* Right: Zoom & Search Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSearchOpen((s) => !s)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isSearchOpen
                        ? 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                    title="Find in Document (Ctrl+F)"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
                    <button
                      onClick={handleZoomOut}
                      className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleZoomReset}
                      className="px-2 py-0.5 text-xs font-mono tabular-nums text-neutral-300 hover:bg-neutral-800 rounded transition-colors"
                      title="Reset Zoom"
                    >
                      {(zoom * 100).toFixed(0)}%
                    </button>
                    <button
                      onClick={handleZoomIn}
                      className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Pages Viewport */}
              <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8 relative bg-neutral-950">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center my-auto py-20 text-neutral-400">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs font-medium">Rendering PDF Document...</span>
                  </div>
                ) : pdfDoc && activePages.length > 0 ? (
                  <div className="transition-all duration-150 flex flex-col items-center gap-8 pb-12">
                    {/* Render active page with high fidelity */}
                    {activePageInfo && (
                      <div className="relative">
                        <PageRenderer
                          pdfDoc={pdfDoc}
                          pageNumber={activePageInfo.pageNumber}
                          scale={zoom}
                          rotation={activePageInfo.currentRotation || 0}
                          annotations={annotations.filter((a) => a.pageNumber === activePageInfo.pageNumber)}
                          activeTool={activeTool}
                          selectedShape={selectedShape}
                          selectedStamp={selectedStamp}
                          drawColor={drawColor}
                          highlightColor={highlightColor}
                          strokeWidth={strokeWidth}
                          fontSize={fontSize}
                          activeSignatureUrl={activeSignatureUrl}
                          onAddAnnotation={handleAddAnnotation}
                          onUpdateAnnotation={handleUpdateAnnotation}
                          onDeleteAnnotation={handleDeleteAnnotation}
                          selectedAnnotationId={selectedAnnotationId}
                          onSelectAnnotation={setSelectedAnnotationId}
                        />

                        {/* Visual page indicator pill */}
                        <div className="text-center mt-3 text-xs font-mono text-neutral-500 tabular-nums">
                          Page {activePageInfo.pageNumber} of {pdfDoc.numPages}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center my-auto py-20 text-neutral-400">
                    <p className="text-sm">No active pages to display.</p>
                  </div>
                )}
              </div>
            </main>
          </>
        )}

        {/* TAB 2: Page Organizer View */}
        {activeTab === 'organizer' && pdfDoc && pdfBytes && (
          <div className="flex-1 overflow-hidden">
            <PageOrganizer
              pdfDoc={pdfDoc}
              originalBytes={pdfBytes}
              pagesInfo={pagesInfo}
              onUpdatePagesInfo={setPagesInfo}
              onClose={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* TAB 3: Watermark & Numbering View */}
        {activeTab === 'watermark' && (
          <div className="flex-1 overflow-y-auto">
            <WatermarkDrawer
              watermark={watermark}
              onUpdateWatermark={(u) => setWatermark((w) => ({ ...w, ...u }))}
              pageNumbers={pageNumbers}
              onUpdatePageNumbers={(u) => setPageNumbers((p) => ({ ...p, ...u }))}
              onApplyAndReturn={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* TAB 4: Merge & Convert View */}
        {activeTab === 'merge' && pdfDoc && (
          <div className="flex-1 overflow-y-auto">
            <MergeConvertModal
              currentPdfDoc={pdfDoc}
              currentDocName={metadata.name}
              onLoadMergedPDF={(newBytes, newName) => {
                loadPDFForRendering(newBytes).then((doc) => {
                  setPdfBytes(newBytes);
                  setPdfDoc(doc);
                  setMetadata({
                    name: newName,
                    sizeBytes: newBytes.byteLength,
                    totalPages: doc.numPages,
                  });
                  const initialPages: PageInfo[] = [];
                  for (let i = 1; i <= doc.numPages; i++) {
                    initialPages.push({
                      pageNumber: i,
                      width: 595,
                      height: 842,
                      originalRotation: 0,
                      currentRotation: 0,
                      orderIndex: i - 1,
                    });
                  }
                  setPagesInfo(initialPages);
                  setCurrentPage(1);
                  setAnnotations([]);
                  setActiveTab('editor');
                });
              }}
              onReturnToEditor={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* Floating Search Panel */}
        <SearchPanel
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          documentText={documentText}
          onJumpToPage={(p) => {
            setCurrentPage(p);
            setActiveTab('editor');
          }}
        />

        {/* Digital Signature Creator Modal */}
        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSaveSignature={(dataUrl) => {
            setActiveSignatureUrl(dataUrl);
            setActiveTool('signature');
          }}
        />

        {/* Sample Document Picker Modal */}
        <SamplePickerModal
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          onSelectSample={loadSampleDocument}
          currentSampleId={currentSampleId}
        />
      </div>
    </div>
  );
}
