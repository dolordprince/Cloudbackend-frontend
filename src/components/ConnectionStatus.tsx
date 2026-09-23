import React from 'react';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { HealthResponse } from '../lib/dolor3v-api';

interface ConnectionStatusProps {
  status: 'checking' | 'online' | 'offline';
  healthData: HealthResponse | null;
  onRetry: () => void;
  compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  healthData,
  onRetry,
  compact = false,
}) => {
  if (status === 'checking') {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono-code text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>CONNECTING...</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono-code text-emerald-300"
        title={`DOLOR3V Microcloud v${healthData?.version || '4.0.0'} (${healthData?.runtime || 'workers'})`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wide">
          {compact ? 'ONLINE' : 'MICROCLOUD • ONLINE'}
        </span>
        {healthData?.version && (
          <span className="text-[10px] text-emerald-400/70 hidden sm:inline">
            v{healthData.version}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono-code text-rose-300">
      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
      <span className="font-semibold">MICROCLOUD OFFLINE</span>
      <button
        onClick={onRetry}
        className="ml-1 p-0.5 rounded hover:bg-rose-500/30 active:scale-95 transition text-rose-200"
        title="Retry connection"
        aria-label="Retry connection to Microcloud"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
};
