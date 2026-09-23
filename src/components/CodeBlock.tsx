import React, { useState } from 'react';
import { Check, Copy, FileCode, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Syntax highlighting approximation for key tokens without huge bundles
  const renderHighlightedCode = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Simple token coloring
      let formattedLine: React.ReactNode = line;

      if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
        formattedLine = <span className="text-slate-500 italic">{line}</span>;
      } else if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
        formattedLine = <span className="text-violet-400">{line}</span>;
      } else if (line.includes('const ') || line.includes('let ') || line.includes('function ') || line.includes('interface ')) {
        formattedLine = <span className="text-cyan-300">{line}</span>;
      }

      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-3 select-none text-[11px] text-slate-600 text-right w-8">
            {idx + 1}
          </span>
          <span className="table-cell font-mono-code whitespace-pre">{formattedLine}</span>
        </div>
      );
    });
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0e14] shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.03] border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono-code">
          {language === 'bash' || language === 'sh' ? (
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="text-slate-200 font-medium">
            {filename || language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
          title="Copy code"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto text-xs font-mono-code leading-relaxed text-slate-200">
        <div className="table w-full">{renderHighlightedCode(code)}</div>
      </div>
    </div>
  );
};
