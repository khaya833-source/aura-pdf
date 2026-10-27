import React, { useState } from 'react';
import {
  MousePointer2,
  Hand,
  Crop,
  Palette,
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
  RotateCcw,
  ImagePlus,
} from 'lucide-react';
import type { ToolMode, ShapeType, StampType, ThemeMode } from '../types/pdf';

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
  onInsertImage?: (file: File) => void;
  currentPageColor?: string;
  onSelectPageColor?: (color: string, applyToAll: boolean) => void;
  isCurrentPageCropped?: boolean;
  onResetPageCrop?: () => void;
  theme?: ThemeMode;
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
  onInsertImage,
  currentPageColor = '#ffffff',
  onSelectPageColor,
  isCurrentPageCropped = false,
  onResetPageCrop,
  theme = 'dark',
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showStampMenu, setShowStampMenu] = useState(false);
  const [showPenMenu, setShowPenMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [applyColorToAll, setApplyColorToAll] = useState(false);

  const isDark = theme === 'dark';
  const btnInactive = isDark
    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
  const borderDivider = isDark ? 'border-neutral-800' : 'border-slate-200';
  const dropdownPanel = isDark
    ? 'bg-neutral-900 border-neutral-800 text-neutral-200 shadow-xl'
    : 'bg-white border-slate-200 text-slate-800 shadow-xl';

  const drawColors = ['#0f172a', '#2563eb', '#dc2626', '#059669', '#7c3aed'];
  const highlightColors = ['#fef08a', '#a7f3d0', '#bae6fd', '#fbcfe8'];
  const pageColorPresets = [
    { name: 'White', color: '#ffffff', border: '#e2e8f0' },
    { name: 'Warm Ivory', color: '#fdfbf7', border: '#e5e0d8' },
    { name: 'Sepia Paper', color: '#f7f0e1', border: '#d9cdb8' },
    { name: 'Soft Mint', color: '#f0fdf4', border: '#bbf7d0' },
    { name: 'Ice Blue', color: '#f0f7ff', border: '#bfdbfe' },
    { name: 'Legal Yellow', color: '#fef9c3', border: '#fde047' },
    { name: 'Dark Slate', color: '#1e293b', border: '#334155' },
  ];
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
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-xl shadow-lg backdrop-blur-md transition-colors duration-150 ${
        isDark
          ? 'bg-neutral-900 border border-neutral-800 text-neutral-100'
          : 'bg-white/95 border border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      {/* Pointer / Hand navigation */}
      <div className={`flex items-center gap-0.5 pr-1.5 border-r ${borderDivider}`}>
        <button
          onClick={() => onSelectTool('select')}
          title="Select & Edit Annotations (V)"
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'select'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : btnInactive
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
              : btnInactive
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Crop tool */}
        <button
          onClick={() => onSelectTool('crop')}
          title="Crop Page: Select a region to remove outer content (C)"
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'crop'
              ? 'bg-amber-500 text-neutral-950 font-semibold'
              : btnInactive
          }`}
        >
          <Crop className="w-4 h-4" />
        </button>

        {/* Reset Crop button if cropped */}
        {isCurrentPageCropped && onResetPageCrop && (
          <button
            onClick={onResetPageCrop}
            title="Reset Page Crop to Original Size"
            className={`p-1.5 rounded-lg text-xs text-amber-500 ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'} transition-colors`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Page Color Picker Dropdown */}
      <div className={`relative border-r pr-1.5 ${borderDivider}`}>
        <button
          onClick={() => setShowColorMenu(!showColorMenu)}
          title="Change Page Background Color"
          className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium ${btnInactive} transition-colors`}
        >
          <Palette className="w-4 h-4" />
          <span
            className="w-2.5 h-2.5 rounded-full border border-neutral-600 shadow-2xs"
            style={{ backgroundColor: currentPageColor }}
          />
        </button>

        {showColorMenu && (
          <div className={`absolute top-full mt-2 left-0 z-40 w-52 p-3 rounded-xl border space-y-3 ${dropdownPanel}`}>
            <div>
              <span className={`text-[11px] font-medium block mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Page Background Tint
              </span>
              <div className="grid grid-cols-4 gap-2">
                {pageColorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => {
                      onSelectPageColor?.(preset.color, applyColorToAll);
                      setShowColorMenu(false);
                    }}
                    title={preset.name}
                    className={`h-7 rounded-md border flex items-center justify-center transition-all ${
                      currentPageColor === preset.color
                        ? 'ring-2 ring-amber-400 scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.color, borderColor: preset.border }}
                  />
                ))}
              </div>
            </div>

            <div className={`pt-2 border-t ${borderDivider}`}>
              <label className={`flex items-center gap-2 cursor-pointer text-[11px] ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={applyColorToAll}
                  onChange={(e) => setApplyColorToAll(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Apply to all pages</span>
              </label>
            </div>
          </div>
        )}
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
                : btnInactive
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
            className={`p-1.5 rounded-r-lg border-l ${borderDivider} ${btnInactive} ${
              activeTool === 'draw' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showPenMenu && (
          <div className={`absolute top-full mt-2 left-0 z-40 w-48 p-3 rounded-xl border space-y-3 ${dropdownPanel}`}>
            <div>
              <span className={`text-[11px] font-medium block mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Pen Color
              </span>
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
                      drawColor === color ? 'border-amber-400 scale-110 shadow-xs' : isDark ? 'border-neutral-700' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className={`flex justify-between text-[11px] mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
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
                className={`w-full accent-amber-500 cursor-pointer h-1 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}
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
                : btnInactive
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
            className={`p-1.5 rounded-r-lg border-l ${borderDivider} ${btnInactive} ${
              activeTool === 'highlight' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showHighlightMenu && (
          <div className={`absolute top-full mt-2 left-0 z-40 w-44 p-2.5 rounded-xl border ${dropdownPanel}`}>
            <span className={`text-[11px] font-medium block mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Highlighter Shade
            </span>
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
                    highlightColor === color ? 'ring-2 ring-amber-400 scale-105 shadow-xs' : isDark ? 'border-neutral-700' : 'border-slate-300'
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
            : btnInactive
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
                : btnInactive
            }`}
          >
            {selectedShape === 'rectangle' && <Square className="w-4 h-4" />}
            {selectedShape === 'circle' && <Circle className="w-4 h-4" />}
            {selectedShape === 'arrow' && <ArrowUpRight className="w-4 h-4" />}
            {selectedShape === 'line' && <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            className={`p-1.5 rounded-r-lg border-l ${borderDivider} ${btnInactive} ${
              activeTool === 'shape' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showShapeMenu && (
          <div className={`absolute top-full mt-2 left-0 z-40 w-36 p-1.5 rounded-xl border flex flex-col gap-0.5 ${dropdownPanel}`}>
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
                      ? isDark ? 'bg-neutral-800 text-amber-400 font-medium' : 'bg-amber-50 text-amber-800 font-medium'
                      : isDark ? 'text-neutral-300 hover:bg-neutral-800/60' : 'text-slate-700 hover:bg-slate-100'
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
            : btnInactive
        }`}
      >
        <FileSignature className="w-4 h-4" />
        <span className="hidden sm:inline">Sign</span>
      </button>

      {/* Insert Image tool */}
      {onInsertImage && (
        <label
          title="Insert Image / Photo into PDF"
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${btnInactive}`}
        >
          <ImagePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onInsertImage(file);
                e.target.value = '';
              }
            }}
          />
        </label>
      )}

      {/* Stamp tool with dropdown */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTool('stamp')}
            title={`Stamp: ${selectedStamp}`}
            className={`flex items-center gap-1.5 px-2 py-2 rounded-l-lg text-xs font-medium transition-colors ${
              activeTool === 'stamp'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : btnInactive
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span className="text-[11px] font-mono hidden md:inline">{selectedStamp}</span>
          </button>
          <button
            onClick={() => setShowStampMenu(!showStampMenu)}
            className={`p-1.5 rounded-r-lg border-l ${borderDivider} ${btnInactive} ${
              activeTool === 'stamp' ? 'bg-amber-600/30 text-amber-300' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showStampMenu && (
          <div className={`absolute top-full mt-2 left-0 z-40 w-44 p-1.5 rounded-xl border flex flex-col gap-0.5 ${dropdownPanel}`}>
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
                    ? isDark ? 'bg-neutral-800 text-amber-400 font-medium' : 'bg-amber-50 text-amber-800 font-medium'
                    : isDark ? 'text-neutral-300 hover:bg-neutral-800/60' : 'text-slate-700 hover:bg-slate-100'
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
            : isDark
            ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
            : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
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
            : btnInactive
        }`}
      >
        <Eraser className="w-4 h-4" />
      </button>

      {/* Undo & Redo divider */}
      <div className={`flex items-center gap-0.5 pl-1.5 border-l ${borderDivider} ml-auto`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${btnInactive}`}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-2 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${btnInactive}`}
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
