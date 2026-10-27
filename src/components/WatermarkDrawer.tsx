import React from 'react';
import type { WatermarkConfig, PageNumberConfig } from '../types/pdf';
import { Shield, Hash, Check } from 'lucide-react';

interface WatermarkDrawerProps {
  watermark: WatermarkConfig;
  onUpdateWatermark: (updates: Partial<WatermarkConfig>) => void;
  pageNumbers: PageNumberConfig;
  onUpdatePageNumbers: (updates: Partial<PageNumberConfig>) => void;
  onApplyAndReturn: () => void;
}

export const WatermarkDrawer: React.FC<WatermarkDrawerProps> = ({
  watermark,
  onUpdateWatermark,
  pageNumbers,
  onUpdatePageNumbers,
  onApplyAndReturn,
}) => {
  const presetWatermarks = [
    'CONFIDENTIAL',
    'INTERNAL USE ONLY',
    'DRAFT - NOT FOR DISTRIBUTION',
    'DO NOT DUPLICATE',
    'SAMPLE COPY',
    'HIGHLY RESTRICTED',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Watermark & Page Numbering</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Apply automated security watermarks and standardized pagination across all document pages
          </p>
        </div>
        <button
          onClick={onApplyAndReturn}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition-colors shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>Save & Return to Editor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Security Watermark */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-800 text-amber-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Document Watermark</h3>
                <p className="text-[11px] text-neutral-400">Overlaid diagonally across all pages</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={watermark.enabled}
                onChange={(e) => onUpdateWatermark({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-neutral-950 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {watermark.enabled && (
            <div className="space-y-4 pt-2 border-t border-neutral-800/80">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Watermark Text</label>
                <input
                  type="text"
                  value={watermark.text}
                  onChange={(e) => onUpdateWatermark({ text: e.target.value })}
                  placeholder="e.g. CONFIDENTIAL"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">Quick Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetWatermarks.map((text) => (
                    <button
                      key={text}
                      onClick={() => onUpdateWatermark({ text })}
                      className="px-2.5 py-1 text-[11px] bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-md transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-neutral-400">{(watermark.opacity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.02"
                  value={watermark.opacity}
                  onChange={(e) => onUpdateWatermark({ opacity: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Font Size & Rotation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Font Size</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={watermark.fontSize}
                    onChange={(e) => onUpdateWatermark({ fontSize: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Angle</label>
                  <select
                    value={watermark.rotation}
                    onChange={(e) => onUpdateWatermark({ rotation: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="45">45° (Standard Diagonal)</option>
                    <option value="0">0° (Horizontal)</option>
                    <option value="30">30° (Subtle Diagonal)</option>
                    <option value="90">90° (Vertical)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Page Numbering */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-800 text-amber-400 rounded-lg">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Page Numbering</h3>
                <p className="text-[11px] text-neutral-400">Standard pagination coordinates</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pageNumbers.enabled}
                onChange={(e) => onUpdatePageNumbers({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-neutral-950 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {pageNumbers.enabled && (
            <div className="space-y-4 pt-2 border-t border-neutral-800/80">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Numbering Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { format: 'Page X of Y', example: 'Page 1 of 5' },
                    { format: 'X of Y', example: '1 of 5' },
                    { format: 'Page X', example: 'Page 1' },
                    { format: 'X', example: '1' },
                  ].map((item) => (
                    <button
                      key={item.format}
                      onClick={() => onUpdatePageNumbers({ format: item.format as PageNumberConfig['format'] })}
                      className={`p-2.5 text-left rounded-lg border transition-colors ${
                        pageNumbers.format === item.format
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-100'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-medium block">{item.format}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{item.example}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Placement Position</label>
                <select
                  value={pageNumbers.position}
                  onChange={(e) => onUpdatePageNumbers({ position: e.target.value as PageNumberConfig['position'] })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="bottom-center">Bottom Center (Recommended)</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right Header</option>
                  <option value="top-center">Top Center Header</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono text-neutral-400">{pageNumbers.fontSize}pt</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="14"
                  step="1"
                  value={pageNumbers.fontSize}
                  onChange={(e) => onUpdatePageNumbers({ fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
