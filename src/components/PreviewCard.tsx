import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';

interface PreviewCardProps {
  previewUrl?: string | null;
  appName?: string;
  onRefresh?: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  previewUrl,
  appName = 'Live Workspace App',
  onRefresh,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewDevice, setViewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleManualRefresh = () => {
    setRefreshKey((k) => k + 1);
    if (onRefresh) onRefresh();
  };

  return (
    <GlassCard variant="default" className="p-3 sm:p-4 space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
        <div className="flex items-center gap-2 truncate">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <h3 className="text-xs font-semibold text-white font-mono-code uppercase tracking-wider truncate">
            LIVE PREVIEW
          </h3>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setViewDevice((v) => (v === 'mobile' ? 'desktop' : 'mobile'))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition text-xs flex items-center gap-1"
            title={`Switch to ${viewDevice === 'mobile' ? 'Desktop' : 'Mobile'} view`}
            aria-label="Toggle viewport view"
          >
            {viewDevice === 'mobile' ? (
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>

          {previewUrl && (
            <>
              <button
                onClick={handleManualRefresh}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                title="Refresh preview"
                aria-label="Refresh preview iframe"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition"
                title="Open in new tab"
                aria-label="Open preview in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono-code text-slate-400">
        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">{previewUrl || 'No preview URL assigned'}</span>
      </div>

      {/* Viewport Frame */}
      {previewUrl ? (
        <div
          className={`relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090b10] flex justify-center items-center transition-all ${
            isFullscreen
              ? 'fixed inset-0 z-50 rounded-none border-none'
              : 'min-h-[380px] max-h-[550px]'
          }`}
        >
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/80 text-white hover:bg-white/20 transition"
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
          <iframe
            key={refreshKey}
            src={previewUrl}
            title={appName}
            className={`w-full h-full border-0 transition-all ${
              viewDevice === 'mobile' && !isFullscreen
                ? 'max-w-[390px] h-[500px] rounded-2xl border border-white/10 shadow-2xl my-4'
                : 'w-full h-[450px]'
            }`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300">No preview available</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Build an application or generate code in the workspace to launch a live sandbox preview.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
