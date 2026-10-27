import React, { useRef, useState, useEffect } from 'react';
import { Pen, Type, Upload, Trash2, Check, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSaveSignature }) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [inkColor, setInkColor] = useState<string>('#0f172a');
  const [typedName, setTypedName] = useState<string>('Alex Morgan');
  const [typedFont, setTypedFont] = useState<string>('cursive');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && tab === 'draw') {
      const timer = setTimeout(() => {
        clearCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
      onClose();
    } else if (tab === 'type') {
      // Render typed signature to a temporary canvas to get clean transparent PNG
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 450;
      tempCanvas.height = 160;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.fillStyle = inkColor;
        ctx.font = `italic 42px ${typedFont}, 'Brush Script MT', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Signature', tempCanvas.width / 2, tempCanvas.height / 2);
        const dataUrl = tempCanvas.toDataURL('image/png');
        onSaveSignature(dataUrl);
        onClose();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          onSaveSignature(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-100">Create Digital Signature</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Sign once to stamp onto any document page</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center px-6 pt-4 gap-2 border-b border-neutral-800/60 pb-3">
          <button
            onClick={() => setTab('draw')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'draw'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            Draw
          </button>
          <button
            onClick={() => setTab('type')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'type'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'upload'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>

          {/* Color choices */}
          <div className="ml-auto flex items-center gap-1.5">
            {[
              { color: '#0f172a', name: 'Navy Black' },
              { color: '#1e3a8a', name: 'Executive Blue' },
              { color: '#047857', name: 'Emerald' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => setInkColor(c.color)}
                title={c.name}
                className={`w-5 h-5 rounded-full border transition-all ${
                  inkColor === c.color ? 'border-amber-400 scale-110 shadow-xs' : 'border-neutral-600'
                }`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          {tab === 'draw' && (
            <div>
              <div className="relative border border-neutral-700/80 rounded-lg bg-neutral-950 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 cursor-crosshair touch-none"
                />
                <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-neutral-700 pointer-events-none flex justify-between">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Sign on the line</span>
                  <span className="text-[10px] text-neutral-500">✕</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                <span>Use mouse or touch screen to draw your signature</span>
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {tab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter name to sign"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Signature Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cursive', name: 'Formal Cursive' },
                    { id: 'serif', name: 'Executive Script' },
                    { id: 'sans-serif', name: 'Clean Modern' },
                    { id: 'monospace', name: 'Technical Stamp' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setTypedFont(style.id)}
                      className={`p-3 text-center rounded-lg border transition-colors ${
                        typedFont === style.id
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-100'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="text-lg block truncate"
                        style={{
                          fontFamily: style.id === 'cursive' ? 'cursive' : style.id,
                          fontStyle: 'italic',
                          color: inkColor,
                        }}
                      >
                        {typedName || 'Signature'}
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-1 block">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-neutral-500 transition-colors bg-neutral-950">
              <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-200">Upload signature image</p>
              <p className="text-xs text-neutral-500 mt-1">PNG with transparent background recommended</p>
              <label className="mt-4 inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg cursor-pointer transition-colors">
                Choose Image File
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-neutral-800 bg-neutral-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          {tab !== 'upload' && (
            <button
              onClick={handleSave}
              disabled={tab === 'draw' && !hasDrawn}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Signature
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
