import React from 'react';
import { SAMPLE_DOCUMENTS, SampleDocMeta } from '../utils/sampleDocuments';
import { FileText, Check, X, Shield, DollarSign, PenTool } from 'lucide-react';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sampleId: string) => void;
  currentSampleId?: string;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  currentSampleId,
}) => {
  if (!isOpen) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    Contract: <Shield className="w-4 h-4 text-amber-400" />,
    Financial: <DollarSign className="w-4 h-4 text-emerald-400" />,
    Invoice: <PenTool className="w-4 h-4 text-blue-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-100">Load Sample Document</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select a pre-built document to explore signing, redacting, annotating, and watermarking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Sample Documents */}
        <div className="p-6 space-y-3">
          {SAMPLE_DOCUMENTS.map((sample: SampleDocMeta) => {
            const isSelected = currentSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 shrink-0 mt-0.5">
                  {categoryIcons[sample.category] || <FileText className="w-4 h-4 text-neutral-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-neutral-100 truncate">{sample.title}</h4>
                    <span className="text-[10px] font-mono text-neutral-400">· {sample.pages} {sample.pages === 1 ? 'Page' : 'Pages'}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{sample.description}</p>
                </div>

                {isSelected && (
                  <div className="p-1 text-amber-400 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
          <span>You can also drag and drop any local PDF anywhere into the editor.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
