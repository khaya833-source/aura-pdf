import React, { useEffect, useRef, useState, useCallback } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderPageToCanvas } from '../utils/pdfEngine';
import type { Annotation, Point, ToolMode, ShapeType, StampType } from '../types/pdf';
import { Trash2, GripVertical, Check } from 'lucide-react';

interface PageRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  annotations: Annotation[];
  activeTool: ToolMode;
  selectedShape: ShapeType;
  selectedStamp: StampType;
  drawColor: string;
  highlightColor: string;
  strokeWidth: number;
  fontSize: number;
  activeSignatureUrl: string | null;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  annotations,
  activeTool,
  selectedShape,
  selectedStamp,
  drawColor,
  highlightColor,
  strokeWidth,
  fontSize,
  activeSignatureUrl,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  selectedAnnotationId,
  onSelectAnnotation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [livePoints, setLivePoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [tempTextValue, setTempTextValue] = useState<string>('');

  // Render PDF page to canvas
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        const dims = await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, scale, rotation);
        if (!isCancelled) {
          setPageSize(dims);
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
        fontSize,
        fontColor: drawColor,
        isBold: false,
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
        x: coords.x - 10,
        y: coords.y - 4,
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
          x: coords.x - 15,
          y: coords.y - 7,
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
    if (!isInteracting) return;
    const coords = getRelativeCoords(e);

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setLivePoints((prev) => [...prev, coords]);
    } else if (activeTool === 'shape' || activeTool === 'redact') {
      setDragCurrent(coords);
    }
  };

  const handleMouseUp = () => {
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

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative select-none bg-white shadow-xl rounded-sm transition-shadow duration-150 mx-auto ${
        activeTool === 'draw' || activeTool === 'highlight'
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
        width: pageSize.width,
        height: pageSize.height,
      }}
    >
      {/* Underlying PDF Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

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
                strokeWidth={((ann.strokeWidth || 2) / pageSize.width) * 100}
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
            const strokeW = ((ann.strokeWidth || 2) / pageSize.width) * 100;
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
              (((activeTool === 'highlight' ? 14 : strokeWidth)) / pageSize.width) * 100
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
            strokeWidth={((strokeWidth || 2) / pageSize.width) * 100}
            strokeDasharray={activeTool === 'redact' ? '2,2' : undefined}
            fill={activeTool === 'redact' ? 'rgba(0,0,0,0.7)' : 'rgba(37,99,235,0.08)'}
          />
        )}
      </svg>

      {/* HTML Interactive Layer for Text, Stamps, Signatures, Redactions, Selection Handles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-auto">
        {annotations.map((ann) => {
          const isSelected = selectedAnnotationId === ann.id;

          if (ann.type === 'text') {
            return (
              <div
                key={ann.id}
                onClick={(e) => handleAnnotationClick(e, ann)}
                className={`absolute group cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-amber-500 rounded px-1' : ''
                }`}
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  fontSize: `${(ann.fontSize || 14) * (scale / 1.5)}px`,
                  color: ann.fontColor || '#0f172a',
                  fontWeight: ann.isBold ? 700 : 400,
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
                      className="bg-transparent text-neutral-900 outline-none text-sm px-1 min-w-[120px]"
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
                  <div className="px-1 py-0.5 rounded hover:bg-amber-100/30">
                    {ann.text}
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

          return null;
        })}
      </div>
    </div>
  );
};
