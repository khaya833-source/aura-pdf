import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Highlighter,
  ChevronDown,
  Quote,
  MessageSquare,
  FileCheck2,
  FileText,
} from 'lucide-react';
import type { WordFormatting, DeviceMode, ThemeMode } from '../types/pdf';

interface WordRibbonToolbarProps {
  formatting: WordFormatting;
  onChangeFormatting: (updates: Partial<WordFormatting>) => void;
  deviceMode: DeviceMode;
  wordCount: number;
  charCount: number;
  onInsertWordPreset?: (type: 'callout' | 'quote' | 'clause') => void;
  theme?: ThemeMode;
}

export const WordRibbonToolbar: React.FC<WordRibbonToolbarProps> = ({
  formatting,
  onChangeFormatting,
  deviceMode,
  wordCount,
  charCount,
  onInsertWordPreset,
  theme = 'dark',
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const fontFamilies = [
    { name: 'Calibri', font: 'Calibri, sans-serif' },
    { name: 'Arial', font: 'Arial, Helvetica, sans-serif' },
    { name: 'Times New Roman', font: '"Times New Roman", Times, serif' },
    { name: 'Georgia', font: 'Georgia, serif' },
    { name: 'Courier New', font: '"Courier New", Courier, monospace' },
    { name: 'Plus Jakarta Sans', font: '"Plus Jakarta Sans", sans-serif' },
  ];

  const fontSizes = [9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48];

  const wordColors = [
    { color: '#000000', label: 'Black' },
    { color: '#1f2937', label: 'Dark Gray' },
    { color: '#2563eb', label: 'Royal Blue' },
    { color: '#dc2626', label: 'Crimson' },
    { color: '#16a34a', label: 'Forest Green' },
    { color: '#9333ea', label: 'Purple' },
    { color: '#ea580c', label: 'Amber Orange' },
    { color: '#0891b2', label: 'Teal' },
  ];

  const highlightColors = [
    { color: 'transparent', label: 'No Color' },
    { color: '#fef08a', label: 'Yellow' },
    { color: '#bbf7d0', label: 'Light Green' },
    { color: '#bae6fd', label: 'Light Cyan' },
    { color: '#fbcfe8', label: 'Pink' },
  ];

  const isAndroid = deviceMode === 'android';
  const isDark = theme === 'dark';

  const selectBtnClass = isDark
    ? 'bg-neutral-950 border-neutral-700/80 hover:border-neutral-600 text-neutral-200'
    : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700 shadow-2xs';
  const dropdownPanelClass = isDark
    ? 'bg-neutral-900 border-neutral-800 text-neutral-200 shadow-2xl'
    : 'bg-white border-slate-200 text-slate-800 shadow-2xl';
  const btnToggleInactive = isDark
    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60';
  const borderDivider = isDark ? 'border-neutral-800' : 'border-slate-200';

  return (
    <div
      className={`border-b flex items-center justify-between select-none transition-colors duration-150 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
          : 'bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
      } ${
        isAndroid ? 'px-3 py-2 overflow-x-auto min-h-[52px]' : 'px-6 py-1.5'
      }`}
    >
      {/* Left: Office Word formatting tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Word Tag Icon */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600/20 text-blue-500 font-semibold text-xs border border-blue-500/30 shrink-0 ${
            isAndroid ? 'hidden sm:flex' : ''
          }`}
        >
          <span className="font-bold font-serif text-sm">W</span>
          <span className="text-[11px] hidden md:inline">Word Styles</span>
        </div>

        {/* Font Family Selector */}
        <div className="relative">
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className={`flex items-center justify-between gap-1.5 border rounded-lg text-xs font-medium transition-colors ${selectBtnClass} ${
              isAndroid ? 'px-3 py-2 min-h-[44px]' : 'px-2.5 py-1 min-w-[125px]'
            }`}
          >
            <span className="truncate max-w-[100px]">{formatting.fontFamily}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showFontMenu && (
            <div className={`absolute top-full mt-1 left-0 z-50 w-44 rounded-xl border p-1 max-h-60 overflow-y-auto ${dropdownPanelClass}`}>
              {fontFamilies.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    onChangeFormatting({ fontFamily: item.name });
                    setShowFontMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    formatting.fontFamily === item.name
                      ? isDark ? 'bg-amber-500/10 text-amber-400 font-medium' : 'bg-amber-100 text-amber-900 font-semibold'
                      : isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{ fontFamily: item.font }}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Selector */}
        <div className={`flex items-center border rounded-lg overflow-hidden shrink-0 ${selectBtnClass}`}>
          <select
            value={formatting.fontSize}
            onChange={(e) => onChangeFormatting({ fontSize: Number(e.target.value) })}
            className={`bg-transparent text-xs font-mono outline-none cursor-pointer ${
              isDark ? 'text-neutral-200' : 'text-slate-800'
            } ${
              isAndroid ? 'px-3 py-2 min-h-[44px]' : 'px-2 py-1'
            }`}
          >
            {fontSizes.map((sz) => (
              <option key={sz} value={sz} className={isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white text-slate-900'}>
                {sz} pt
              </option>
            ))}
          </select>
        </div>

        {/* B, I, U, S Format buttons */}
        <div className={`flex items-center border rounded-lg p-0.5 shrink-0 ${
          isDark ? 'bg-neutral-950 border-neutral-700/80' : 'bg-white border-slate-300'
        }`}>
          <button
            onClick={() => onChangeFormatting({ isBold: !formatting.isBold })}
            title="Bold (Ctrl+B)"
            className={`rounded font-bold transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.isBold
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ isItalic: !formatting.isItalic })}
            title="Italic (Ctrl+I)"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.isItalic
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ isUnderline: !formatting.isUnderline })}
            title="Underline (Ctrl+U)"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.isUnderline
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ isStrikethrough: !formatting.isStrikethrough })}
            title="Strikethrough"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.isStrikethrough
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Color & Highlight */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Text Color Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColorMenu(!showColorMenu)}
              title="Font Color"
              className={`flex items-center gap-1 border rounded-lg transition-colors ${selectBtnClass} ${
                isAndroid ? 'p-2 min-h-[44px]' : 'p-1.5'
              }`}
            >
              <span className="font-bold font-serif text-xs">A</span>
              <span
                className="w-2.5 h-2.5 rounded-sm border border-neutral-500/50"
                style={{ backgroundColor: formatting.fontColor }}
              />
            </button>

            {showColorMenu && (
              <div className={`absolute top-full mt-1 left-0 z-50 w-44 rounded-xl border p-2.5 ${dropdownPanelClass}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Font Color
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {wordColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => {
                        onChangeFormatting({ fontColor: c.color });
                        setShowColorMenu(false);
                      }}
                      title={c.label}
                      className="w-7 h-7 rounded-md border border-neutral-600/40 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Highlight Color */}
          <div className="relative">
            <button
              onClick={() => setShowHighlightMenu(!showHighlightMenu)}
              title="Text Highlight Color"
              className={`flex items-center gap-1 border rounded-lg transition-colors ${selectBtnClass} ${
                isAndroid ? 'p-2 min-h-[44px]' : 'p-1.5'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            </button>

            {showHighlightMenu && (
              <div className={`absolute top-full mt-1 left-0 z-50 w-40 rounded-xl border p-2.5 ${dropdownPanelClass}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Highlight
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {highlightColors.map((h) => (
                    <button
                      key={h.color}
                      onClick={() => {
                        onChangeFormatting({ highlightBgColor: h.color });
                        setShowHighlightMenu(false);
                      }}
                      title={h.label}
                      className="w-6 h-6 rounded-md border border-neutral-600/40 hover:scale-110 transition-transform flex items-center justify-center text-[10px] text-neutral-400"
                      style={{ backgroundColor: h.color }}
                    >
                      {h.color === 'transparent' ? '✕' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alignment */}
        <div className={`flex items-center border rounded-lg p-0.5 shrink-0 ${
          isDark ? 'bg-neutral-950 border-neutral-700/80' : 'bg-white border-slate-300'
        }`}>
          <button
            onClick={() => onChangeFormatting({ textAlign: 'left' })}
            title="Align Left"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.textAlign === 'left'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ textAlign: 'center' })}
            title="Align Center"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.textAlign === 'center'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ textAlign: 'right' })}
            title="Align Right"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.textAlign === 'right'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeFormatting({ textAlign: 'justify' })}
            title="Justify"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.textAlign === 'justify'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List formatting */}
        <div className={`flex items-center border rounded-lg p-0.5 shrink-0 ${
          isDark ? 'bg-neutral-950 border-neutral-700/80' : 'bg-white border-slate-300'
        }`}>
          <button
            onClick={() =>
              onChangeFormatting({
                bulletType: formatting.bulletType === 'bullet' ? 'none' : 'bullet',
              })
            }
            title="Bullet List"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.bulletType === 'bullet'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onChangeFormatting({
                bulletType: formatting.bulletType === 'number' ? 'none' : 'number',
              })
            }
            title="Numbered List"
            className={`rounded transition-colors ${
              isAndroid ? 'p-2 min-w-[40px] min-h-[40px]' : 'p-1.5'
            } ${
              formatting.bulletType === 'number'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : btnToggleInactive
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Word Presets (Callout, Quote, Clause) */}
        {onInsertWordPreset && (
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className={`flex items-center gap-1.5 border rounded-lg text-xs font-medium transition-colors ${selectBtnClass} ${
                isAndroid ? 'px-3 py-2 min-h-[44px]' : 'px-2.5 py-1'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Insert Preset</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showPresetMenu && (
              <div className={`absolute top-full mt-1 left-0 z-50 w-48 rounded-xl border p-1.5 space-y-1 ${dropdownPanelClass}`}>
                <button
                  onClick={() => {
                    onInsertWordPreset('callout');
                    setShowPresetMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                    isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <span className={`font-medium block ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>Word Callout Box</span>
                    <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Highlighted advisory note</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onInsertWordPreset('quote');
                    setShowPresetMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                    isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Quote className="w-3.5 h-3.5 text-amber-500" />
                  <div>
                    <span className={`font-medium block ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>Blockquote Block</span>
                    <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Formal indented quote</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onInsertWordPreset('clause');
                    setShowPresetMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 ${
                    isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <div>
                    <span className={`font-medium block ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>Legal Clause Paragraph</span>
                    <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Numbered contractual clause</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Word Count & Document Statistics */}
      <div className={`items-center gap-3 text-xs pl-4 border-l shrink-0 ${borderDivider} ${
        isDark ? 'text-neutral-400' : 'text-slate-500'
      } ${
        isAndroid ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>{wordCount}</span>
          <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>words</span>
        </div>
        <span className={isDark ? 'text-neutral-700' : 'text-slate-300'}>·</span>
        <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
          <span className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>{charCount}</span>
          <span className={isDark ? 'text-neutral-500' : 'text-slate-400'}>chars</span>
        </div>
      </div>
    </div>
  );
};
