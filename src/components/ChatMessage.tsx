import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, CheckCircle2, ListTodo, Layers, ArrowRight } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { GlassCard } from './ui/GlassCard';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  provider?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRegenerate?: (messageId: string) => void;
  isLast?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  isLast,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Helper to parse markdown-like content including code blocks and structured sections
  const renderFormattedContent = (text: string) => {
    // Check for code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Content before code block
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        parts.push(renderTextSections(textBefore, `text-${lastIndex}`));
      }

      const lang = match[1] || 'typescript';
      const code = match[2].trimEnd();
      parts.push(
        <CodeBlock
          key={`code-${matchIndex}`}
          code={code}
          language={lang}
        />
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      parts.push(renderTextSections(textAfter, `text-${lastIndex}`));
    }

    return parts;
  };

  // Helper for paragraphs, lists, and structured cards
  const renderTextSections = (rawText: string, keyPrefix: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushList = (idx: number) => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-list-${idx}`} className="my-2 space-y-1 pl-4 list-disc text-slate-300">
            {listBuffer.map((item, lIdx) => (
              <li key={lIdx} className="text-sm leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        listBuffer.push(trimmed.substring(2));
        return;
      } else {
        flushList(idx);
      }

      if (!trimmed) {
        return;
      }

      // Check for markdown headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`${keyPrefix}-h4-${idx}`} className="text-sm font-semibold text-cyan-300 mt-3 mb-1">
            {trimmed.substring(4)}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`${keyPrefix}-h3-${idx}`} className="text-base font-semibold text-white mt-4 mb-1.5 font-display">
            {trimmed.substring(3)}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`${keyPrefix}-h2-${idx}`} className="text-lg font-bold text-white mt-4 mb-2 font-display">
            {trimmed.substring(2)}
          </h2>
        );
      } else if (trimmed.toUpperCase().startsWith('PLAN:') || trimmed.toUpperCase() === 'PLAN') {
        // Structured PLAN card
        elements.push(
          <div key={`${keyPrefix}-plan-${idx}`} className="my-3 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1 font-mono-code uppercase tracking-wider">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Execution Plan</span>
            </div>
            <p className="text-xs text-slate-300">
              {renderInlineFormatting(trimmed.replace(/^PLAN:?\s*/i, ''))}
            </p>
          </div>
        );
      } else if (trimmed.toUpperCase().startsWith('RESULT:') || trimmed.toUpperCase() === 'RESULT') {
        // Structured RESULT card
        elements.push(
          <div key={`${keyPrefix}-res-${idx}`} className="my-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1 font-mono-code uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Result Output</span>
            </div>
            <p className="text-xs text-slate-300">
              {renderInlineFormatting(trimmed.replace(/^RESULT:?\s*/i, ''))}
            </p>
          </div>
        );
      } else {
        elements.push(
          <p key={`${keyPrefix}-p-${idx}`} className="text-sm text-slate-200 leading-relaxed my-1.5">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    });

    flushList(lines.length);
    return <div key={keyPrefix}>{elements}</div>;
  };

  // Inline formatting helper for bold, code, and links
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-white/[0.08] text-cyan-300 font-mono-code text-[12px] border border-white/[0.06]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex flex-col w-full my-3 transition-all ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${
          isUser
            ? 'rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-blue-950/40 border border-indigo-400/20 px-4 py-3 text-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.3)]'
            : 'rounded-2xl rounded-tl-sm glass-panel px-4 py-3.5 border border-white/[0.09] text-slate-200 w-full'
        }`}
      >
        {/* Header line */}
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            {isUser ? (
              <span className="text-[11px] font-mono-code text-indigo-300 uppercase tracking-wider font-semibold">
                You
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center p-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-black" />
                </div>
                <span className="text-[11px] font-mono-code text-cyan-300 font-semibold tracking-wide">
                  DOLOR3V
                </span>
                {message.provider && (
                  <span className="text-[10px] text-slate-500 font-mono-code">
                    · {message.provider}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono-code">
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* Message body */}
        <div className="space-y-1 break-words">
          {renderFormattedContent(message.content)}
        </div>

        {/* Footer actions for AI response */}
        {!isUser && (
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.05] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition text-[11px]"
                title="Copy response"
                aria-label="Copy AI response"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>

              {onRegenerate && isLast && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/[0.06] text-slate-400 hover:text-cyan-300 transition text-[11px]"
                  title="Regenerate response from Microcloud"
                  aria-label="Regenerate response"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px]">Regenerate</span>
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-600 font-mono-code">
              Microcloud Verified
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
