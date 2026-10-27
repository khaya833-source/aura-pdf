import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import type { ThemeMode } from '../types/pdf';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: { pageNumber: number; text: string }[];
  onJumpToPage: (pageNumber: number) => void;
  theme?: ThemeMode;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  onClose,
  documentText,
  onJumpToPage,
  theme = 'dark',
}) => {
  const [query, setQuery] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const isDark = theme === 'dark';

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const matches: { pageNumber: number; snippet: string; index: number }[] = [];

    documentText.forEach((docPage) => {
      const lowerText = docPage.text.toLowerCase();
      let pos = lowerText.indexOf(lowerQuery);

      while (pos !== -1) {
        const start = Math.max(0, pos - 30);
        const end = Math.min(docPage.text.length, pos + query.length + 40);
        const snippet = docPage.text.slice(start, end);

        matches.push({
          pageNumber: docPage.pageNumber,
          snippet: (start > 0 ? '...' : '') + snippet + (end < docPage.text.length ? '...' : ''),
          index: pos,
        });

        pos = lowerText.indexOf(lowerQuery, pos + query.length);
      }
    });

    return matches;
  }, [query, documentText]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (results.length === 0) return;
    const nextIdx = (currentResultIndex + 1) % results.length;
    setCurrentResultIndex(nextIdx);
    onJumpToPage(results[nextIdx].pageNumber);
  };

  const handlePrev = () => {
    if (results.length === 0) return;
    const prevIdx = (currentResultIndex - 1 + results.length) % results.length;
    setCurrentResultIndex(prevIdx);
    onJumpToPage(results[prevIdx].pageNumber);
  };

  return (
    <div
      className={`absolute top-16 right-6 z-40 w-80 border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-100 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
      }`}
    >
      {/* Search Input Bar */}
      <div
        className={`p-3 border-b flex items-center gap-2 ${
          isDark ? 'border-neutral-800' : 'border-slate-200'
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-slate-400'}`} />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentResultIndex(0);
          }}
          placeholder="Search document text..."
          className={`bg-transparent text-xs outline-none w-full ${
            isDark ? 'text-neutral-100 placeholder:text-neutral-500' : 'text-slate-800 placeholder:text-slate-400'
          }`}
        />

        {query && (
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] font-mono tabular-nums ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
              {results.length > 0 ? `${currentResultIndex + 1}/${results.length}` : '0/0'}
            </span>
            <button
              onClick={handlePrev}
              disabled={results.length === 0}
              className={`p-1 disabled:opacity-30 rounded transition-colors ${
                isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              disabled={results.length === 0}
              className={`p-1 disabled:opacity-30 rounded transition-colors ${
                isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className={`p-1 rounded transition-colors ${
            isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snippet Matches List */}
      {query.length >= 2 && (
        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className={`p-4 text-center text-xs ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
              No matching text found
            </div>
          ) : (
            results.map((res, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentResultIndex(i);
                  onJumpToPage(res.pageNumber);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                  i === currentResultIndex
                    ? isDark
                      ? 'bg-neutral-800 text-amber-400'
                      : 'bg-amber-50 text-amber-800 ring-1 ring-amber-300'
                    : isDark
                    ? 'text-neutral-300 hover:bg-neutral-800/50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`flex items-center justify-between text-[10px] font-mono mb-0.5 ${
                  isDark ? 'text-neutral-500' : 'text-slate-400'
                }`}>
                  <span>Match #{i + 1}</span>
                  <span>Page {res.pageNumber}</span>
                </div>
                <p className={`line-clamp-2 text-[11px] leading-relaxed ${
                  isDark ? 'text-neutral-300' : 'text-slate-600'
                }`}>
                  {res.snippet}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
