import React, { useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { mergePDFs, convertImagesToPDF, renderPageToCanvas } from '../utils/pdfEngine';
import {
  FilePlus,
  Layers,
  Image as ImageIcon,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
} from 'lucide-react';

interface MergeConvertProps {
  currentPdfDoc: pdfjsLib.PDFDocumentProxy;
  currentDocName: string;
  onLoadMergedPDF: (mergedBytes: Uint8Array, name: string) => void;
  onReturnToEditor: () => void;
}

interface QueuedPDF {
  id: string;
  name: string;
  size: number;
  bytes: Uint8Array;
}

interface QueuedImage {
  id: string;
  name: string;
  dataUrl: string;
}

export const MergeConvertModal: React.FC<MergeConvertProps> = ({
  currentPdfDoc,
  currentDocName,
  onLoadMergedPDF,
  onReturnToEditor,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'merge' | 'imgToPdf' | 'pdfToImg'>('merge');

  // Merge state
  const [pdfQueue, setPdfQueue] = useState<QueuedPDF[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  // Images to PDF state
  const [imageQueue, setImageQueue] = useState<QueuedImage[]>([]);
  const [isConvertingImages, setIsConvertingImages] = useState(false);

  // PDF to Image export state
  const [isExportingImages, setIsExportingImages] = useState(false);

  // Handle uploading PDFs for merge
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueuedPDF[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      newItems.push({
        id: `pdf_${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        bytes: new Uint8Array(buffer),
      });
    }

    setPdfQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleMovePdf = (index: number, direction: 'up' | 'down') => {
    setPdfQueue((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleRemovePdf = (id: string) => {
    setPdfQueue((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExecuteMerge = async () => {
    if (pdfQueue.length < 2) return;
    try {
      setIsMerging(true);
      const mergedBytes = await mergePDFs(pdfQueue.map((p) => p.bytes));
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_document_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Offer to load into editor
      onLoadMergedPDF(mergedBytes, `Merged_${pdfQueue.length}_Documents.pdf`);
    } catch (err) {
      console.error('Failed to merge PDFs:', err);
    } finally {
      setIsMerging(false);
    }
  };

  // Handle Images to PDF
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          setImageQueue((prev) => [
            ...prev,
            { id: `img_${Date.now()}_${i}`, name: file.name, dataUrl: result },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleConvertImagesToPdf = async () => {
    if (imageQueue.length === 0) return;
    try {
      setIsConvertingImages(true);
      const pdfBytes = await convertImagesToPDF(imageQueue);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_images_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      onLoadMergedPDF(pdfBytes, `Images_Converted_${imageQueue.length}_Pages.pdf`);
    } catch (err) {
      console.error('Failed to convert images to PDF:', err);
    } finally {
      setIsConvertingImages(false);
    }
  };

  // Handle PDF to Images (Current document)
  const handleExportAllPagesAsImages = async () => {
    if (!currentPdfDoc) return;
    try {
      setIsExportingImages(true);
      const tempCanvas = document.createElement('canvas');
      for (let i = 1; i <= currentPdfDoc.numPages; i++) {
        await renderPageToCanvas(currentPdfDoc, i, tempCanvas, 2.0, 0);
        const dataUrl = tempCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${currentDocName.replace('.pdf', '')}_page_${i}.png`;
        a.click();
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Failed to export PDF pages as images:', err);
    } finally {
      setIsExportingImages(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Document Conversion & Assembly</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Merge multiple PDF files into one, assemble scanned images to PDF, or extract pages to high-res PNGs
          </p>
        </div>
        <button
          onClick={onReturnToEditor}
          className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
        >
          Return to Editor
        </button>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveSubTab('merge')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeSubTab === 'merge'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Merge PDFs</span>
        </button>
        <button
          onClick={() => setActiveSubTab('imgToPdf')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeSubTab === 'imgToPdf'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Images to PDF</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pdfToImg')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeSubTab === 'pdfToImg'
              ? 'bg-neutral-800 text-amber-400 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>PDF to PNG Images</span>
        </button>
      </div>

      {/* SUBTAB 1: MERGE PDFs */}
      {activeSubTab === 'merge' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Merge PDF Files</h3>
              <p className="text-xs text-neutral-400">
                Arrange files in the desired order. They will be concatenated seamlessly.
              </p>
            </div>

            <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Add PDF Files</span>
              <input type="file" multiple accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
            </label>
          </div>

          {pdfQueue.length === 0 ? (
            <div className="border-2 border-dashed border-neutral-800 rounded-xl p-12 text-center bg-neutral-900/50">
              <Layers className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-300">No PDF files queued</p>
              <p className="text-xs text-neutral-500 mt-1">
                Upload 2 or more PDF documents to merge them into a single file
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pdfQueue.map((pdf, idx) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 font-mono text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-medium text-neutral-200 block truncate max-w-md">
                        {pdf.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {(pdf.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMovePdf(idx, 'up')}
                      className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === pdfQueue.length - 1}
                      onClick={() => handleMovePdf(idx, 'down')}
                      className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemovePdf(pdf.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecuteMerge}
                  disabled={pdfQueue.length < 2 || isMerging}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 rounded-lg transition-colors shadow-xs"
                >
                  {isMerging ? (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Merge {pdfQueue.length} PDFs & Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: IMAGES TO PDF */}
      {activeSubTab === 'imgToPdf' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Convert Images to PDF</h3>
              <p className="text-xs text-neutral-400">
                Upload scans, photos, or diagrams to convert into a unified PDF document
              </p>
            </div>

            <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Add Images (PNG/JPG)</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {imageQueue.length === 0 ? (
            <div className="border-2 border-dashed border-neutral-800 rounded-xl p-12 text-center bg-neutral-900/50">
              <ImageIcon className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-300">No images added</p>
              <p className="text-xs text-neutral-500 mt-1">Select one or more images from your computer to create a PDF</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageQueue.map((img, idx) => (
                  <div
                    key={img.id}
                    className="group relative bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col"
                  >
                    <div className="h-32 bg-neutral-950 flex items-center justify-center p-2">
                      <img src={img.dataUrl} alt={img.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="p-2 flex items-center justify-between text-xs bg-neutral-900">
                      <span className="truncate max-w-[120px] text-neutral-300">{img.name}</span>
                      <button
                        onClick={() => setImageQueue((prev) => prev.filter((i) => i.id !== img.id))}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleConvertImagesToPdf}
                  disabled={isConvertingImages}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 rounded-lg transition-colors shadow-xs"
                >
                  {isConvertingImages ? (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Generate PDF ({imageQueue.length} Images)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PDF TO IMAGES */}
      {activeSubTab === 'pdfToImg' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 text-amber-400 rounded-xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">Export Current Document Pages as PNG</h3>
              <p className="text-xs text-neutral-400">
                Renders each page of "{currentDocName}" at high resolution (200 DPI) and triggers instant image download
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Total Pages to Export: <span className="font-mono text-neutral-200">{currentPdfDoc?.numPages || 1}</span>
            </span>

            <button
              onClick={handleExportAllPagesAsImages}
              disabled={isExportingImages}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 rounded-lg transition-colors shadow-xs"
            >
              {isExportingImages ? (
                <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingImages ? 'Rendering Pages...' : 'Export Pages as PNG'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
