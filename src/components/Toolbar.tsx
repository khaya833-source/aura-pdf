import React, { useState } from 'react';
import {
  MousePointer2,
  Hand,
  Highlighter,
  PenTool,
  Type,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  FileSignature,
  Stamp,
  ShieldAlert,
  Eraser,
  Undo2,
  Redo2,
  ChevronDown,
} from 'lucide-react';
import type { ToolMode, ShapeType, StampType } from '../types/pdf';

interface ToolbarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  selectedStamp: StampType;
  onSelectStamp: (stamp: StampType) => void;
  drawColor: string;
  onSelectDrawColor: (color: string) => void;
  highlightColor: string;
  onSelectHighlightColor: (color: string) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  fontSize: number;
  onSelectFontSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSignatureModal: () => void;
  hasActiveSignature: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedShape,
  onSelectShape,
  selectedStamp,
  onSelectStamp,
  drawColor,
  onSelectDrawColor,
  highlightColor,
  onSelectHighlightColor,
  strokeWidth,
  onSelectStrokeWidth,
  fontSize,
  onSelectFontSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSignatureModal,
  hasActiveSignature,
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showStampMenu, setShowStampMenu] = useState(false);
  const [showPenMenu, setShowPenMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);

  const drawColors = ['#0f172a', '#2563eb', '#dc2626', '#059669', '#7c3aed'];
  const highlightColors = ['#fef08a', '#a7f3d0', '#bae6fd', '#fbcfe8'];
  const stampOptions: StampType[] = [
    'APPROVED',
    'CONFIDENTIAL',
    'DRAFT',
    'FINAL',
    'PAID',
    'URGENT',
    'REVIEWED',
    'VOID',
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg backdrop-blur-md">
      {/* Pointer / Hand navigation */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-neutral-800">
        <button
          onClick={() => onSelectTool('select')}
          title="Select & Edit Annotations (V)"
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'select'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTool('hand')}
          title="Pan & Scroll Document (H)"
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'hand'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>
      </div>

      {/* Drawing / Pen tool */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTool('draw')}
            title="Pen / Freehand Draw"
            className={`flex items-center gap-1 p-2 rounded-l-lg text-xs font-medium transition-colors ${
              activeTool === 'draw'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span
              className="w-2 h-2 rounded-full border border-black/20"
              style={{ backgroundColor: drawColor }}
            />
          </button>
          <button
            onClick={() => setShowPenMenu(!showPenMenu)}
            className={`p-1.5 rounded-r-lg border-l border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 ${
              activeTool === 'draw' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showPenMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 w-48 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl space-y-3">
            <div>
              <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">Pen Color</span>
              <div className="flex items-center gap-1.5">
                {drawColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onSelectDrawColor(color);
                      setShowPenMenu(false);
                      onSelectTool('draw');
                    }}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      drawColor === color ? 'border-amber-400 scale-110 shadow-xs' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Thickness</span>
                <span className="font-mono">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={strokeWidth}
                onChange={(e) => onSelectStrokeWidth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Highlighter */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTool('highlight')}
            title="Highlighter"
            className={`flex items-center gap-1 p-2 rounded-l-lg text-xs font-medium transition-colors ${
              activeTool === 'highlight'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/20"
              style={{ backgroundColor: highlightColor }}
            />
          </button>
          <button
            onClick={() => setShowHighlightMenu(!showHighlightMenu)}
            className={`p-1.5 rounded-r-lg border-l border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 ${
              activeTool === 'highlight' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showHighlightMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 w-44 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl">
            <span className="text-[11px] font-medium text-neutral-400 block mb-2">Highlighter Shade</span>
            <div className="grid grid-cols-4 gap-2">
              {highlightColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onSelectHighlightColor(color);
                    setShowHighlightMenu(false);
                    onSelectTool('highlight');
                  }}
                  className={`h-7 rounded-md border transition-all ${
                    highlightColor === color ? 'border-amber-400 scale-105 shadow-xs' : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Box tool */}
      <button
        onClick={() => onSelectTool('text')}
        title="Insert Text Box"
        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
          activeTool === 'text'
            ? 'bg-amber-500 text-neutral-950 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Shapes tool with menu */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTool('shape')}
            title={`Shape: ${selectedShape}`}
            className={`p-2 rounded-l-lg text-xs font-medium transition-colors ${
              activeTool === 'shape'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {selectedShape === 'rectangle' && <Square className="w-4 h-4" />}
            {selectedShape === 'circle' && <Circle className="w-4 h-4" />}
            {selectedShape === 'arrow' && <ArrowUpRight className="w-4 h-4" />}
            {selectedShape === 'line' && <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            className={`p-1.5 rounded-r-lg border-l border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 ${
              activeTool === 'shape' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showShapeMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 w-36 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl flex flex-col gap-0.5">
            {[
              { id: 'rectangle', name: 'Rectangle', icon: Square },
              { id: 'circle', name: 'Circle', icon: Circle },
              { id: 'arrow', name: 'Arrow', icon: ArrowUpRight },
              { id: 'line', name: 'Line', icon: Minus },
            ].map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.id}
                  onClick={() => {
                    onSelectShape(shape.id as ShapeType);
                    setShowShapeMenu(false);
                    onSelectTool('shape');
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedShape === shape.id
                      ? 'bg-neutral-800 text-amber-400 font-medium'
                      : 'text-neutral-300 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{shape.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Signature tool */}
      <button
        onClick={() => {
          if (!hasActiveSignature) {
            onOpenSignatureModal();
          } else {
            onSelectTool('signature');
          }
        }}
        title="Digital Signature (Draw or Stamp)"
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
          activeTool === 'signature'
            ? 'bg-amber-500 text-neutral-950 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <FileSignature className="w-4 h-4" />
        <span className="hidden sm:inline">Sign</span>
      </button>

      {/* Stamp tool with dropdown */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTool('stamp')}
            title={`Stamp: ${selectedStamp}`}
            className={`flex items-center gap-1.5 px-2 py-2 rounded-l-lg text-xs font-medium transition-colors ${
              activeTool === 'stamp'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span className="text-[11px] font-mono hidden md:inline">{selectedStamp}</span>
          </button>
          <button
            onClick={() => setShowStampMenu(!showStampMenu)}
            className={`p-1.5 rounded-r-lg border-l border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 ${
              activeTool === 'stamp' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showStampMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 w-44 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl flex flex-col gap-0.5">
            {stampOptions.map((st) => (
              <button
                key={st}
                onClick={() => {
                  onSelectStamp(st);
                  setShowStampMenu(false);
                  onSelectTool('stamp');
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedStamp === st
                    ? 'bg-neutral-800 text-amber-400 font-medium'
                    : 'text-neutral-300 hover:bg-neutral-800/60'
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] font-mono opacity-50">STAMP</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Redaction tool */}
      <button
        onClick={() => onSelectTool('redact')}
        title="Redact / Blackout Sensitive Information"
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
          activeTool === 'redact'
            ? 'bg-rose-600 text-white font-semibold shadow-xs'
            : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
        }`}
      >
        <ShieldAlert className="w-4 h-4" />
        <span className="hidden sm:inline">Redact</span>
      </button>

      {/* Eraser */}
      <button
        onClick={() => onSelectTool('eraser')}
        title="Eraser (Click any annotation to remove)"
        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
          activeTool === 'eraser'
            ? 'bg-amber-500 text-neutral-950 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <Eraser className="w-4 h-4" />
      </button>

      {/* Undo & Redo divider */}
      <div className="flex items-center gap-0.5 pl-1.5 border-l border-neutral-800 ml-auto">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
