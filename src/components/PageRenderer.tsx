import React, { useEffect, useRef, useState, useCallback } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderPageToCanvas } from '../utils/pdfEngine';
import type { Annotation, Point, ToolMode, ShapeType, StampType, CropRegion, WordFormatting, ThemeMode } from '../types/pdf';
import {
  Trash2,
  Check,
  X,
  RotateCcw,
  Crop as CropIcon,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface PageRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  crop?: CropRegion;
  backgroundColor?: string;
  annotations: Annotation[];
  activeTool: ToolMode;
  selectedShape: ShapeType;
  selectedStamp: StampType;
  drawColor: string;
  highlightColor: string;
  strokeWidth: number;
  fontSize: number;
  wordFormatting?: WordFormatting;
  activeSignatureUrl: string | null;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onApplyCrop: (crop: CropRegion) => void;
  onResetCrop: () => void;
  onCancelCrop: () => void;
  theme?: ThemeMode;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  crop,
  backgroundColor = '#ffffff',
  annotations,
  activeTool,
  selectedShape,
  selectedStamp,
  drawColor,
  highlightColor,
  strokeWidth,
  fontSize,
  wordFormatting,
  activeSignatureUrl,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  selectedAnnotationId,
  onSelectAnnotation,
  onApplyCrop,
  onResetCrop,
  onCancelCrop,
  theme = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [fullPageSize, setFullPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [livePoints, setLivePoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [tempTextValue, setTempTextValue] = useState<string>('');

  // Crop tool local state
  const [draftCrop, setDraftCrop] = useState<CropRegion | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  // Initialize draft crop when entering crop mode
  useEffect(() => {
    if (activeTool === 'crop') {
      if (crop) {
        setDraftCrop(crop);
      } else {
        setDraftCrop({ x: 10, y: 10, width: 80, height: 80 });
      }
    } else {
      setDraftCrop(null);
    }
  }, [activeTool, crop]);

  // Render PDF page to canvas
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        const dims = await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, scale, rotation);
        if (!isCancelled) {
          setFullPageSize(dims);
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  // Convert mouse/touch event coordinates into percentage (0..100%) of page dimensions
  const getRelativeCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const pxX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pxY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    return {
      x: (pxX / rect.width) * 100,
      y: (pxY / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'hand') return;

    const coords = getRelativeCoords(e);

    if (activeTool === 'crop') {
      setIsDraggingCrop(true);
      setDragStart(coords);
      setDragCurrent(coords);
      return;
    }

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsInteracting(true);
      setLivePoints([coords]);
    } else if (activeTool === 'shape' || activeTool === 'redact') {
      setIsInteracting(true);
      setDragStart(coords);
      setDragCurrent(coords);
    } else if (activeTool === 'text') {
      const newId = `text_${Date.now()}`;
      const newAnnotation: Annotation = {
        id: newId,
        pageNumber,
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: 'Click to edit text',
        fontSize: wordFormatting?.fontSize || fontSize,
        fontFamily: wordFormatting?.fontFamily || 'Calibri, sans-serif',
        fontColor: wordFormatting?.fontColor || drawColor,
        isBold: wordFormatting?.isBold || false,
        isItalic: wordFormatting?.isItalic || false,
        isUnderline: wordFormatting?.isUnderline || false,
        isStrikethrough: wordFormatting?.isStrikethrough || false,
        textAlign: wordFormatting?.textAlign || 'left',
        highlightBgColor: wordFormatting?.highlightBgColor,
        bulletType: wordFormatting?.bulletType || 'none',
        timestamp: Date.now(),
      };
      onAddAnnotation(newAnnotation);
      setEditingTextId(newId);
      setTempTextValue('Click to edit text');
      onSelectAnnotation(newId);
    } else if (activeTool === 'stamp') {
      const newAnnotation: Annotation = {
        id: `stamp_${Date.now()}`,
        pageNumber,
        type: 'stamp',
        x: Math.max(2, Math.min(80, coords.x - 10)),
        y: Math.max(2, Math.min(90, coords.y - 4)),
        width: 20,
        height: 6,
        stampType: selectedStamp,
        timestamp: Date.now(),
      };
      onAddAnnotation(newAnnotation);
    } else if (activeTool === 'signature') {
      if (activeSignatureUrl) {
        const newAnnotation: Annotation = {
          id: `sig_${Date.now()}`,
          pageNumber,
          type: 'signature',
          x: Math.max(2, Math.min(70, coords.x - 15)),
          y: Math.max(2, Math.min(85, coords.y - 7)),
          width: 30,
          height: 12,
          signatureDataUrl: activeSignatureUrl,
          timestamp: Date.now(),
        };
        onAddAnnotation(newAnnotation);
      }
    } else if (activeTool === 'select') {
      // Clicked on background, deselect
      onSelectAnnotation(null);
      setEditingTextId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getRelativeCoords(e);

    if (activeTool === 'crop' && isDraggingCrop && dragStart) {
      const minX = Math.min(dragStart.x, coords.x);
      const minY = Math.min(dragStart.y, coords.y);
      const width = Math.abs(coords.x - dragStart.x);
      const height = Math.abs(coords.y - dragStart.y);
      if (width > 2 && height > 2) {
        setDraftCrop({ x: minX, y: minY, width, height });
      }
      return;
    }

    if (!isInteracting) return;

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setLivePoints((prev) => [...prev, coords]);
    } else if (activeTool === 'shape' || activeTool === 'redact') {
      setDragCurrent(coords);
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'crop') {
      setIsDraggingCrop(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    if (!isInteracting) return;
    setIsInteracting(false);

    if ((activeTool === 'draw' || activeTool === 'highlight') && livePoints.length > 1) {
      const isHighlighter = activeTool === 'highlight';
      const newAnnotation: Annotation = {
        id: `${activeTool}_${Date.now()}`,
        pageNumber,
        type: activeTool,
        x: livePoints[0].x,
        y: livePoints[0].y,
        points: livePoints,
        strokeColor: isHighlighter ? highlightColor : drawColor,
        strokeWidth: isHighlighter ? 14 : strokeWidth,
        opacity: isHighlighter ? 0.45 : 1,
        timestamp: Date.now(),
      };
      onAddAnnotation(newAnnotation);
      setLivePoints([]);
    } else if (dragStart && dragCurrent && (activeTool === 'shape' || activeTool === 'redact')) {
      const minX = Math.min(dragStart.x, dragCurrent.x);
      const minY = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      if (width > 0.5 && height > 0.5) {
        if (activeTool === 'redact') {
          const newAnnotation: Annotation = {
            id: `redact_${Date.now()}`,
            pageNumber,
            type: 'redact',
            x: minX,
            y: minY,
            width,
            height,
            timestamp: Date.now(),
          };
          onAddAnnotation(newAnnotation);
        } else {
          const newAnnotation: Annotation = {
            id: `shape_${Date.now()}`,
            pageNumber,
            type: 'shape',
            x: minX,
            y: minY,
            width,
            height,
            shapeType: selectedShape,
            strokeColor: drawColor,
            strokeWidth,
            timestamp: Date.now(),
          };
          onAddAnnotation(newAnnotation);
        }
      }
      setDragStart(null);
      setDragCurrent(null);
    }
  };

  const handleAnnotationClick = (e: React.MouseEvent, ann: Annotation) => {
    e.stopPropagation();
    if (activeTool === 'eraser') {
      onDeleteAnnotation(ann.id);
    } else if (activeTool === 'select') {
      onSelectAnnotation(ann.id);
      if (ann.type === 'text') {
        setEditingTextId(ann.id);
        setTempTextValue(ann.text || '');
      }
    }
  };

  const saveTextEdit = (id: string) => {
    if (tempTextValue.trim()) {
      onUpdateAnnotation(id, { text: tempTextValue });
    } else {
      onDeleteAnnotation(id);
    }
    setEditingTextId(null);
  };

  const duplicateSelectedAnnotation = (ann: Annotation) => {
    const clone: Annotation = {
      ...ann,
      id: `${ann.type}_${Date.now()}`,
      x: Math.min(85, ann.x + 3),
      y: Math.min(85, ann.y + 3),
      timestamp: Date.now(),
    };
    onAddAnnotation(clone);
    onSelectAnnotation(clone.id);
  };

  // Dimensions computation:
  // If in crop mode, show the full page with the interactive crop selection marquee.
  // If cropped and NOT in crop mode, viewport clips to the cropped region, updating dimensions accordingly!
  const hasActiveCrop = !!crop && (crop.width < 100 || crop.height < 100 || crop.x > 0 || crop.y > 0);
  const isCurrentlyCropping = activeTool === 'crop';

  const displayedWidth = (!isCurrentlyCropping && hasActiveCrop)
    ? fullPageSize.width * (crop.width / 100)
    : fullPageSize.width;

  const displayedHeight = (!isCurrentlyCropping && hasActiveCrop)
    ? fullPageSize.height * (crop.height / 100)
    : fullPageSize.height;

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId);
  const isDark = theme === 'dark';

  return (
    <div className="relative flex flex-col items-center">
      {/* Page Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative select-none bg-white rounded-xs transition-all duration-150 overflow-hidden ${
          isDark
            ? 'shadow-2xl shadow-black/80 ring-1 ring-neutral-800'
            : 'shadow-xl shadow-slate-400/25 ring-1 ring-slate-300'
        } ${
          activeTool === 'draw' || activeTool === 'highlight'
            ? 'cursor-crosshair'
            : activeTool === 'crop'
            ? 'cursor-crosshair'
            : activeTool === 'text'
            ? 'cursor-text'
            : activeTool === 'stamp' || activeTool === 'signature'
            ? 'cursor-copy'
            : activeTool === 'eraser'
            ? 'cursor-pointer'
            : activeTool === 'hand'
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{
          width: displayedWidth,
          height: displayedHeight,
        }}
      >
        {/* Inner Canvas Offset Box (if cropped and viewing) */}
        <div
          className="relative"
          style={{
            width: fullPageSize.width,
            height: fullPageSize.height,
            transform: (!isCurrentlyCropping && hasActiveCrop)
              ? `translate(-${(crop.x / 100) * fullPageSize.width}px, -${(crop.y / 100) * fullPageSize.height}px)`
              : 'none',
            transformOrigin: 'top left',
          }}
        >
          {/* Underlying PDF Canvas */}
          <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

          {/* Page Background Color Tint Layer */}
          {backgroundColor && backgroundColor.toLowerCase() !== '#ffffff' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{ backgroundColor, opacity: 0.85 }}
            />
          )}

          {/* SVG Layer for Freehand Lines, Highlights & Shapes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Render committed draw/highlight/shape annotations */}
            {annotations.map((ann) => {
              if (ann.type === 'draw' || ann.type === 'highlight') {
                if (!ann.points || ann.points.length < 2) return null;
                const pathData = ann.points.reduce(
                  (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  ''
                );
                return (
                  <path
                    key={ann.id}
                    d={pathData}
                    stroke={ann.strokeColor || '#000'}
                    strokeWidth={((ann.strokeWidth || 2) / fullPageSize.width) * 100}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={ann.opacity ?? 1}
                    style={{
                      mixBlendMode: ann.type === 'highlight' ? 'multiply' : 'normal',
                    }}
                  />
                );
              }

              if (ann.type === 'shape') {
                const strokeW = ((ann.strokeWidth || 2) / fullPageSize.width) * 100;
                if (ann.shapeType === 'rectangle') {
                  return (
                    <rect
                      key={ann.id}
                      x={ann.x}
                      y={ann.y}
                      width={ann.width || 0}
                      height={ann.height || 0}
                      stroke={ann.strokeColor || '#2563eb'}
                      strokeWidth={strokeW}
                      fill={ann.fillColor || 'none'}
                    />
                  );
                }
                if (ann.shapeType === 'circle') {
                  const rx = (ann.width || 0) / 2;
                  const ry = (ann.height || 0) / 2;
                  return (
                    <ellipse
                      key={ann.id}
                      cx={ann.x + rx}
                      cy={ann.y + ry}
                      rx={rx}
                      ry={ry}
                      stroke={ann.strokeColor || '#2563eb'}
                      strokeWidth={strokeW}
                      fill={ann.fillColor || 'none'}
                    />
                  );
                }
                if (ann.shapeType === 'line' || ann.shapeType === 'arrow') {
                  return (
                    <g key={ann.id}>
                      <line
                        x1={ann.x}
                        y1={ann.y}
                        x2={ann.x + (ann.width || 0)}
                        y2={ann.y + (ann.height || 0)}
                        stroke={ann.strokeColor || '#2563eb'}
                        strokeWidth={strokeW}
                      />
                      {ann.shapeType === 'arrow' && (
                        <circle
                          cx={ann.x + (ann.width || 0)}
                          cy={ann.y + (ann.height || 0)}
                          r={strokeW * 1.5}
                          fill={ann.strokeColor || '#2563eb'}
                        />
                      )}
                    </g>
                  );
                }
              }
              return null;
            })}

            {/* Live drawing preview */}
            {isInteracting && livePoints.length > 1 && (
              <path
                d={livePoints.reduce(
                  (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  ''
                )}
                stroke={activeTool === 'highlight' ? highlightColor : drawColor}
                strokeWidth={
                  (((activeTool === 'highlight' ? 14 : strokeWidth)) / fullPageSize.width) * 100
                }
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={activeTool === 'highlight' ? 0.45 : 1}
                style={{
                  mixBlendMode: activeTool === 'highlight' ? 'multiply' : 'normal',
                }}
              />
            )}

            {/* Live shape or redaction preview */}
            {isInteracting && dragStart && dragCurrent && (
              <rect
                x={Math.min(dragStart.x, dragCurrent.x)}
                y={Math.min(dragStart.y, dragCurrent.y)}
                width={Math.abs(dragCurrent.x - dragStart.x)}
                height={Math.abs(dragCurrent.y - dragStart.y)}
                stroke={activeTool === 'redact' ? '#e11d48' : drawColor}
                strokeWidth={((strokeWidth || 2) / fullPageSize.width) * 100}
                strokeDasharray={activeTool === 'redact' ? '2,2' : undefined}
                fill={activeTool === 'redact' ? 'rgba(0,0,0,0.7)' : 'rgba(37,99,235,0.08)'}
              />
            )}
          </svg>

          {/* HTML Interactive Layer for Text, Stamps, Signatures, Redactions */}
          <div className="absolute inset-0 overflow-hidden pointer-events-auto">
            {annotations.map((ann) => {
              const isSelected = selectedAnnotationId === ann.id;

              if (ann.type === 'text') {
                const bulletPrefix = ann.bulletType === 'bullet' ? '• ' : ann.bulletType === 'number' ? '1. ' : '';
                const fontStack = ann.fontFamily
                  ? ann.fontFamily === 'Times New Roman'
                    ? '"Times New Roman", Times, serif'
                    : ann.fontFamily === 'Georgia'
                    ? 'Georgia, serif'
                    : ann.fontFamily === 'Courier New'
                    ? '"Courier New", Courier, monospace'
                    : ann.fontFamily
                  : 'inherit';

                const textDec = [
                  ann.isUnderline ? 'underline' : '',
                  ann.isStrikethrough ? 'line-through' : '',
                ].filter(Boolean).join(' ') || 'none';

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => handleAnnotationClick(e, ann)}
                    className={`absolute group cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-amber-500 rounded px-1' : ''
                    } ${
                      ann.boxStyle === 'callout'
                        ? 'p-2 bg-blue-50/90 border-l-4 border-blue-600 rounded-r-md shadow-xs'
                        : ann.boxStyle === 'quote'
                        ? 'p-2 italic border-l-2 border-amber-500 bg-amber-50/60 pl-3 rounded-r-md'
                        : ''
                    }`}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      fontFamily: fontStack,
                      fontSize: `${(ann.fontSize || 14) * (scale / 1.5)}px`,
                      color: ann.fontColor || '#0f172a',
                      fontWeight: ann.isBold ? 700 : 400,
                      fontStyle: ann.isItalic ? 'italic' : 'normal',
                      textDecoration: textDec,
                      textAlign: ann.textAlign || 'left',
                      backgroundColor: ann.highlightBgColor && ann.highlightBgColor !== 'transparent'
                        ? ann.highlightBgColor
                        : undefined,
                    }}
                  >
                    {editingTextId === ann.id ? (
                      <div className="flex items-center gap-1 bg-white/95 shadow-md border border-amber-500 p-1 rounded z-20">
                        <input
                          type="text"
                          autoFocus
                          value={tempTextValue}
                          onChange={(e) => setTempTextValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTextEdit(ann.id);
                            if (e.key === 'Escape') setEditingTextId(null);
                          }}
                          onBlur={() => saveTextEdit(ann.id)}
                          className="bg-transparent text-neutral-900 outline-none text-sm px-1 min-w-[140px]"
                        />
                        <button
                          onClick={() => saveTextEdit(ann.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAnnotation(ann.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="px-1 py-0.5 rounded hover:bg-amber-100/30 whitespace-pre-wrap">
                        {bulletPrefix}{ann.text}
                      </div>
                    )}
                  </div>
                );
              }

              if (ann.type === 'redact') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => handleAnnotationClick(e, ann)}
                    className={`absolute bg-black flex items-center justify-center cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-rose-500 shadow-md' : ''
                    }`}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      width: `${ann.width}%`,
                      height: `${ann.height}%`,
                    }}
                  >
                    {(ann.width || 0) > 10 && (
                      <span className="text-[9px] font-mono font-bold text-neutral-400 select-none tracking-widest opacity-80">
                        REDACTED
                      </span>
                    )}
                    {isSelected && (
                      <button
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="absolute -top-3 -right-3 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                        title="Remove Redaction"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              if (ann.type === 'stamp') {
                const stampStyle: Record<string, string> = {
                  APPROVED: 'border-emerald-600 text-emerald-700 bg-emerald-50/90',
                  CONFIDENTIAL: 'border-rose-600 text-rose-700 bg-rose-50/90',
                  DRAFT: 'border-slate-500 text-slate-700 bg-slate-50/90',
                  FINAL: 'border-blue-600 text-blue-700 bg-blue-50/90',
                  PAID: 'border-emerald-700 text-emerald-800 bg-emerald-100/90',
                  URGENT: 'border-amber-600 text-amber-700 bg-amber-50/90',
                  REVIEWED: 'border-indigo-600 text-indigo-700 bg-indigo-50/90',
                  VOID: 'border-red-700 text-red-800 bg-red-100/90',
                };
                const currentStyle = stampStyle[ann.stampType || 'APPROVED'] || stampStyle.APPROVED;

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => handleAnnotationClick(e, ann)}
                    className={`absolute border-2 font-bold uppercase tracking-wider text-xs px-3 py-1.5 rounded cursor-pointer select-none transition-all shadow-xs ${currentStyle} ${
                      isSelected ? 'ring-2 ring-amber-500 scale-105' : ''
                    }`}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                    }}
                  >
                    <span>{ann.stampType}</span>
                    {isSelected && (
                      <button
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="absolute -top-3 -right-3 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              if (ann.type === 'signature') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => handleAnnotationClick(e, ann)}
                    className={`absolute cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-amber-500 bg-amber-50/20 rounded p-1' : ''
                    }`}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      width: `${ann.width || 25}%`,
                    }}
                  >
                    {ann.signatureDataUrl && (
                      <img
                        src={ann.signatureDataUrl}
                        alt="Digital Signature"
                        className="w-full h-auto object-contain pointer-events-none drop-shadow-xs"
                      />
                    )}
                    {isSelected && (
                      <button
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="absolute -top-3 -right-3 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              if (ann.type === 'image') {
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => handleAnnotationClick(e, ann)}
                    className={`absolute cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-amber-500 shadow-lg' : ''
                    }`}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      width: `${ann.width || 30}%`,
                    }}
                  >
                    {ann.imageDataUrl && (
                      <img
                        src={ann.imageDataUrl}
                        alt="Inserted PDF Graphic"
                        className="w-full h-auto object-contain rounded-xs shadow-xs"
                      />
                    )}
                    {isSelected && (
                      <button
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="absolute -top-3 -right-3 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* CROP INTERACTIVE OVERLAY (Visible when Crop Tool is active) */}
          {isCurrentlyCropping && draftCrop && (
            <div className="absolute inset-0 pointer-events-auto">
              {/* Outer dimmed scrims (top, bottom, left, right) */}
              <div
                className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-2xs pointer-events-none"
                style={{ height: `${draftCrop.y}%` }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/60 backdrop-blur-2xs pointer-events-none"
                style={{ height: `${100 - (draftCrop.y + draftCrop.height)}%` }}
              />
              <div
                className="absolute left-0 bg-black/60 backdrop-blur-2xs pointer-events-none"
                style={{
                  top: `${draftCrop.y}%`,
                  height: `${draftCrop.height}%`,
                  width: `${draftCrop.x}%`,
                }}
              />
              <div
                className="absolute right-0 bg-black/60 backdrop-blur-2xs pointer-events-none"
                style={{
                  top: `${draftCrop.y}%`,
                  height: `${draftCrop.height}%`,
                  width: `${100 - (draftCrop.x + draftCrop.width)}%`,
                }}
              />

              {/* Crop Box Window */}
              <div
                className="absolute border-2 border-amber-400 shadow-2xl cursor-move"
                style={{
                  left: `${draftCrop.x}%`,
                  top: `${draftCrop.y}%`,
                  width: `${draftCrop.width}%`,
                  height: `${draftCrop.height}%`,
                }}
              >
                {/* Rule of Thirds Grid Guidelines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-amber-300/40" />
                  <div className="border-r border-b border-amber-300/40" />
                  <div className="border-b border-amber-300/40" />
                  <div className="border-r border-b border-amber-300/40" />
                  <div className="border-r border-b border-amber-300/40" />
                  <div className="border-b border-amber-300/40" />
                  <div className="border-r border-amber-300/40" />
                  <div className="border-r border-amber-300/40" />
                  <div />
                </div>

                {/* 4 Corner Grips */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-neutral-900 rounded-xs" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-neutral-900 rounded-xs" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-neutral-900 rounded-xs" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-neutral-900 rounded-xs" />

                {/* Size dimensions badge */}
                <div className="absolute -top-7 left-0 px-2 py-0.5 bg-neutral-900/95 border border-neutral-700 text-[10px] font-mono text-amber-300 rounded shadow-xs whitespace-nowrap">
                  {Math.round((draftCrop.width / 100) * fullPageSize.width)} × {Math.round((draftCrop.height / 100) * fullPageSize.height)} px
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING CROP ACTION BAR (Visible when in Crop Tool mode) */}
      {isCurrentlyCropping && draftCrop && (
        <div className={`mt-4 flex items-center gap-2 p-2 border rounded-xl shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
        }`}>
          <div className="flex items-center gap-1.5 px-2 text-xs font-medium">
            <CropIcon className="w-4 h-4 text-amber-500" />
            <span>Crop Page</span>
          </div>

          <div className={`h-4 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

          {/* Aspect ratio presets */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setDraftCrop({ x: 10, y: 10, width: 80, height: 80 })}
              className={`px-2 py-1 rounded transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              1:1 Square
            </button>
            <button
              onClick={() => setDraftCrop({ x: 5, y: 5, width: 90, height: 67.5 })}
              className={`px-2 py-1 rounded transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => setDraftCrop({ x: 5, y: 5, width: 90, height: 50.6 })}
              className={`px-2 py-1 rounded transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => setDraftCrop({ x: 0, y: 0, width: 100, height: 100 })}
              className={`px-2 py-1 rounded transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Full Page
            </button>
          </div>

          <div className={`h-4 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

          {/* Reset button if already cropped */}
          {hasActiveCrop && (
            <button
              onClick={onResetCrop}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Cancel button */}
          <button
            onClick={onCancelCrop}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          {/* Apply button */}
          <button
            onClick={() => onApplyCrop(draftCrop)}
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Crop</span>
          </button>
        </div>
      )}

      {/* CONTEXTUAL ANNOTATION INSPECTOR (When an annotation is selected) */}
      {selectedAnnotation && !isCurrentlyCropping && (
        <div className={`mt-3 flex items-center gap-2 p-1.5 border rounded-xl shadow-xl z-30 text-xs animate-in fade-in ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
        }`}>
          <span className={`font-semibold uppercase tracking-wider text-[10px] pl-2 ${
            isDark ? 'text-neutral-300' : 'text-slate-700'
          }`}>
            {selectedAnnotation.type}
          </span>

          <div className={`h-3.5 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

          {/* Color changer */}
          {['#0f172a', '#2563eb', '#dc2626', '#059669', '#7c3aed', '#f59e0b'].map((col) => (
            <button
              key={col}
              onClick={() => onUpdateAnnotation(selectedAnnotation.id, {
                strokeColor: col,
                fontColor: col,
              })}
              className="w-4 h-4 rounded-full border border-neutral-600/40 hover:scale-110 transition-transform"
              style={{ backgroundColor: col }}
            />
          ))}

          <div className={`h-3.5 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

          {/* Duplicate button */}
          <button
            onClick={() => duplicateSelectedAnnotation(selectedAnnotation)}
            title="Duplicate Annotation"
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
            title="Delete Annotation (Del)"
            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
