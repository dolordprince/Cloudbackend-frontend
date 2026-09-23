import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  Check,
  Copy,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { postImage, Dolor3vApiError } from '../lib/dolor3v-api';

export interface VisualAsset {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  provider: string;
}

interface VisualLabProps {
  onUseInWorkspace?: (asset: VisualAsset) => void;
}

export const VisualLab: React.FC<VisualLabProps> = ({ onUseInWorkspace }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const samplePrompts = [
    'Futuristic glowing crystal microcloud emblem on dark graphite background, 8k',
    'Luxury glass UI dashboard mockup with floating neon telemetry cards, ultra realistic',
    'Holographic cybernetic orb node in deep obsidian space, octane render',
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = (customPrompt || prompt).trim();
    if (!textToUse || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await postImage({ prompt: textToUse });
      if (res.ok && res.result) {
        const newAsset: VisualAsset = {
          id: `img-${Date.now()}`,
          url: res.result,
          prompt: textToUse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: res.provider || 'pollinations',
        };
        setAssets((prev) => [newAsset, ...prev]);
        setPrompt('');
      } else {
        throw new Error(res.error || 'Failed to generate visual');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Dolor3vApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to generate image via DOLOR3V backend';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header card */}
      <GlassCard variant="elevated" className="p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-display">VISUAL LAB</h3>
              <p className="text-[11px] text-slate-400 font-mono-code">
                Microcloud Neural Image Synthesis
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono-code text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            POLLINATIONS AI
          </span>
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a visual asset for your application..."
              rows={2}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGenerate(sp)}
                  disabled={isGenerating}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] whitespace-nowrap shrink-0 transition"
                >
                  Prompt {idx + 1}
                </button>
              ))}
            </div>

            <GlassButton
              variant="primary"
              size="sm"
              loading={isGenerating}
              disabled={!prompt.trim() || isGenerating}
              onClick={() => handleGenerate()}
              className="h-8 px-3 text-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate</span>
            </GlassButton>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Gallery of Assets */}
      {assets.length === 0 && !isGenerating && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-6 text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">No visual assets generated yet</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Use the prompt composer above to create high-resolution imagery powered by DOLOR3V Microcloud.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {assets.map((asset) => (
          <GlassCard key={asset.id} variant="default" className="overflow-hidden p-3 space-y-3">
            {/* Image Preview with responsive ratio */}
            <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] aspect-video flex items-center justify-center group">
              <img
                src={asset.url}
                alt={asset.prompt}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />

              {/* Glass Overlay on Hover / Mobile tap */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition p-3 flex flex-col justify-end">
                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {asset.prompt}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400 mt-1">
                  <span>{asset.provider}</span>
                  <span>{asset.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => handleCopyUrl(asset.id, asset.url)}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
                aria-label="Copy image URL"
              >
                {copiedId === asset.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  download={`dolor3v-asset-${asset.id}.png`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                  title="Download asset"
                  aria-label="Download image"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleGenerate(asset.prompt)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition"
                  title="Regenerate this prompt"
                  aria-label="Regenerate asset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {onUseInWorkspace && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => onUseInWorkspace(asset)}
                    className="text-[11px] h-7 px-2.5 gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Use in Workspace</span>
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
