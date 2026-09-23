import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  Layers,
  Code,
  Globe,
  Terminal,
} from 'lucide-react';
import { GlassButton } from './ui/GlassButton';

interface PromptComposerProps {
  onSend: (prompt: string, options?: { attachContext?: string }) => void;
  onCancel?: () => void;
  isLoading: boolean;
  onOpenImageLab?: () => void;
  placeholder?: string;
}

const QUICK_PROMPTS = [
  'Build me a luxury crypto dashboard with a glass interface',
  'Create a mobile PWA with offline caching and biometric theme',
  'Design an AI-native code generation workspace',
  'Build a real-time decentralized orderbook viewer',
];

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSend,
  onCancel,
  isLoading,
  onOpenImageLab,
  placeholder = 'Build a luxury crypto dashboard with a glass interface...',
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedContext, setAttachedContext] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea vertically as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [text]);

  // Voice speech-to-text setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed, { attachContext: attachedContext || undefined });
    setText('');
    setAttachedContext(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const attachArchitectureContext = () => {
    if (attachedContext) {
      setAttachedContext(null);
    } else {
      setAttachedContext('DOLOR3V Microcloud / Cloudflare Workers runtime with Pollinations AI pipeline');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Attached Context Banner */}
      {attachedContext && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate">
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Context: {attachedContext}</span>
          </div>
          <button
            onClick={() => setAttachedContext(null)}
            className="text-slate-400 hover:text-white text-[11px] ml-2 px-1"
            aria-label="Remove attached context"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Glass Prompt Composer */}
      <div className="glass-panel-elevated rounded-2xl border border-white/[0.12] p-2 sm:p-3 transition-all focus-within:border-cyan-400/50 focus-within:shadow-[0_0_25px_rgba(56,189,248,0.2)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Listening to voice...' : placeholder}
          rows={2}
          className="w-full bg-transparent resize-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2 py-1.5 leading-relaxed min-h-[48px] max-h-[180px]"
          aria-label="Prompt composer input"
        />

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-white/[0.05] gap-2">
          {/* Left tools: Attach, Image Lab, Voice */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={attachArchitectureContext}
              className={`p-2 rounded-xl text-xs transition flex items-center justify-center min-w-[38px] min-h-[38px] ${
                attachedContext
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Attach Microcloud context specification"
              aria-label="Attach context"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {onOpenImageLab && (
              <button
                type="button"
                onClick={onOpenImageLab}
                className="p-2 rounded-xl text-xs transition flex items-center justify-center min-w-[38px] min-h-[38px] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                title="Generate Visual Asset in Visual Lab"
                aria-label="Open Visual Lab"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleVoice}
              className={`p-2 rounded-xl text-xs transition flex items-center justify-center min-w-[38px] min-h-[38px] ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title={isRecording ? 'Stop voice recording' : 'Speak prompt'}
              aria-label={isRecording ? 'Stop voice recording' : 'Speak prompt'}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right tool: Send or Cancel */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <GlassButton
                variant="danger"
                size="sm"
                onClick={onCancel}
                className="h-9 px-3 gap-1.5"
                title="Cancel pending request"
                aria-label="Cancel request"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs">Stop</span>
              </GlassButton>
            ) : (
              <GlassButton
                variant="primary"
                size="sm"
                disabled={!text.trim()}
                onClick={handleSubmit}
                className="h-9 px-4 gap-2"
                title="Send prompt to DOLOR3V Microcloud"
                aria-label="Build with DOLOR3V"
              >
                <span className="text-xs font-semibold">Build</span>
                <Send className="w-3.5 h-3.5" />
              </GlassButton>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <span className="text-[10px] uppercase font-mono-code text-slate-500 shrink-0 pl-1">
          Suggestions:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setText(prompt)}
            className="text-[11px] text-slate-300 hover:text-cyan-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl px-2.5 py-1.5 whitespace-nowrap transition shrink-0 active:scale-98"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
