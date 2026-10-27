import React from 'react';
import {
  Type,
  PenTool,
  Highlighter,
  Crop,
  Sparkles,
  Palette,
  Laptop,
  Smartphone,
  Download,
} from 'lucide-react';
import type { ToolMode, ThemeMode } from '../types/pdf';

interface AndroidTouchBarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  onToggleGemini: () => void;
  isGeminiOpen: boolean;
  onDownload: () => void;
  onToggleDeviceMode: () => void;
  theme?: ThemeMode;
}

export const AndroidTouchBar: React.FC<AndroidTouchBarProps> = ({
  activeTool,
  onSelectTool,
  onToggleGemini,
  isGeminiOpen,
  onDownload,
  onToggleDeviceMode,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const inactiveBtn = isDark
    ? 'text-neutral-400 active:bg-neutral-800'
    : 'text-slate-600 active:bg-slate-100';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-4 py-2 flex items-center justify-between shadow-2xl safe-area-pb transition-colors ${
        isDark ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-slate-200'
      }`}
    >
      {/* 5 Finger-friendly Touch Tabs */}
      <div className="flex-1 grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {/* Word Text Writing */}
        <button
          onClick={() => onSelectTool('text')}
          className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all ${
            activeTool === 'text'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : inactiveBtn
          }`}
        >
          <Type className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">Word</span>
        </button>

        {/* Draw Pen */}
        <button
          onClick={() => onSelectTool('draw')}
          className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all ${
            activeTool === 'draw'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : inactiveBtn
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">Draw</span>
        </button>

        {/* Highlighter */}
        <button
          onClick={() => onSelectTool('highlight')}
          className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all ${
            activeTool === 'highlight'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : inactiveBtn
          }`}
        >
          <Highlighter className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">Highlight</span>
        </button>

        {/* Crop tool */}
        <button
          onClick={() => onSelectTool('crop')}
          className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all ${
            activeTool === 'crop'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : inactiveBtn
          }`}
        >
          <Crop className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">Crop</span>
        </button>

        {/* Gemini AI */}
        <button
          onClick={onToggleGemini}
          className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all ${
            isGeminiOpen
              ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-bold shadow-md'
              : isDark ? 'text-amber-400 active:bg-neutral-800' : 'text-amber-600 active:bg-amber-50'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">AI Chat</span>
        </button>
      </div>
    </div>
  );
};
