import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  ShieldAlert,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

import type { ThemeMode } from '../types/pdf';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentText: { pageNumber: number; text: string }[];
  theme?: ThemeMode;
}

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  documentName,
  documentText,
  theme = 'dark',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am your **Gemini AI Document Assistant**. I have analyzed **${documentName}** and can help you summarize clauses, locate sensitive data for redaction, extract financial metrics, or draft notes. How can I assist you?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const fullDocumentContext = documentText
    .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`)
    .join('\n\n');

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          documentContext: fullDocumentContext,
          currentDocumentName: documentName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response received from Gemini.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Gemini chat request error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `Sorry, an error occurred while connecting to Gemini: ${err.message || 'Unknown error'}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        content: `Chat history cleared. I'm ready to answer any questions about **${documentName}**!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const quickPrompts = [
    { label: 'Summarize Document', text: 'Please summarize the main terms, objectives, and conclusions of this document in clear bullet points.' },
    { label: 'Find Sensitive Data to Redact', text: 'Identify any confidential data, account numbers, or personal information in this document that should be redacted.' },
    { label: 'Key Deadlines & Deliverables', text: 'What are all the key dates, milestones, and deliverables specified in this document?' },
    { label: 'Explain Legal & Financial Risks', text: 'Highlight any potential legal liability clauses or financial risks outlined in this text.' },
  ];

  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-96 border-l flex flex-col shrink-0 select-none z-30 shadow-2xl animate-in slide-in-from-right duration-200 transition-colors ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-200 bg-white/95'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-neutral-100' : 'text-slate-900'}`}>
              <span>Gemini AI Copilot</span>
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded">
                3.8 Flash
              </span>
            </h3>
            <p className={`text-[10px] truncate max-w-[190px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Grounded in: {documentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isModel = m.role === 'model';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono mb-1 text-slate-400">
                {isModel ? (
                  <>
                    <Bot className="w-3 h-3 text-amber-500" />
                    <span>Gemini</span>
                  </>
                ) : (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3" />
                  </>
                )}
              </div>

              <div
                className={`group relative max-w-[92%] rounded-xl p-3 text-xs leading-relaxed ${
                  isModel
                    ? isDark
                      ? 'bg-neutral-950 border border-neutral-800 text-neutral-200'
                      : 'bg-slate-100 border border-slate-200 text-slate-800'
                    : 'bg-amber-500 text-neutral-950 font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {isModel && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 text-[10px] font-mono mb-1 text-slate-400">
              <Bot className="w-3 h-3 text-amber-500" />
              <span>Gemini is thinking...</span>
            </div>
            <div className={`p-3 border rounded-xl flex items-center gap-1.5 ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto ${
        isDark ? 'border-neutral-800/60 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
      }`}>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.text)}
            disabled={isLoading}
            className={`px-2.5 py-1 text-[11px] whitespace-nowrap rounded-lg border transition-colors ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className={`p-3 border-t ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-slate-200 bg-white'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className={`flex items-center gap-2 border rounded-xl p-1.5 focus-within:border-amber-500 transition-colors ${
            isDark ? 'bg-neutral-950 border-neutral-700' : 'bg-slate-50 border-slate-300'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini about this PDF..."
            disabled={isLoading}
            className={`flex-1 bg-transparent px-2 text-xs outline-none ${
              isDark ? 'text-neutral-100 placeholder:text-neutral-500' : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-neutral-950 font-semibold transition-colors"
            title="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className={`text-[10px] text-center mt-1.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
          Gemini extracts answers directly from the loaded document
        </p>
      </div>
    </aside>
  );
};
