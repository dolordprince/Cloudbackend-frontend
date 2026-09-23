import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  RefreshCw,
  Database,
  Smartphone,
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { HealthResponse, DOLOR3V_BASE_URL } from '../lib/dolor3v-api';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsPanelProps {
  healthData: HealthResponse | null;
  onRefreshHealth: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  availableModels: string[];
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  healthData,
  onRefreshHealth,
  selectedModel,
  onSelectModel,
  availableModels,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4 w-full pb-8">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-base font-semibold text-white font-display">
          Microcloud Settings & Telemetry
        </h2>
        <p className="text-xs text-slate-400">
          DOLOR3V Microcloud backend diagnostics and client configuration
        </p>
      </div>

      {/* Backend Status Card */}
      <GlassCard variant="elevated" className="p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-slate-200">
              Core Backend Connection
            </span>
          </div>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
            className="h-7 text-xs px-2.5"
            aria-label="Refresh backend telemetry"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Test Ping</span>
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono-code">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-slate-500 block text-[10px]">BACKEND URL</span>
            <span className="text-slate-200 font-semibold truncate block mt-0.5">
              {DOLOR3V_BASE_URL}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-slate-500 block text-[10px]">SERVICE / RUNTIME</span>
            <span className="text-cyan-300 font-semibold block mt-0.5">
              {healthData?.service || 'dolor3v-microcloud'} (
              {healthData?.runtime || 'cloudflare-workers'})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-slate-500 block text-[10px]">BACKEND VERSION</span>
            <span className="text-slate-200 font-semibold block mt-0.5">
              {healthData?.version ? `v${healthData.version}` : 'v4.0.0'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-slate-500 block text-[10px]">POLLINATIONS AI</span>
            <span className="text-emerald-400 font-semibold block mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Link Active</span>
            </span>
          </div>
        </div>

        {/* Microcloud Capabilities Matrix */}
        <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-wider block">
            Active Microcloud Capabilities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Durable Objects', ok: healthData?.durableObjects },
              { name: 'SQLite', ok: healthData?.sqlite },
              { name: 'Browser-Run', ok: healthData?.browserRun },
              { name: 'WebSocket', ok: healthData?.websocket },
              { name: 'AHP 0.9.0', ok: !!healthData?.ahp },
            ].map((cap, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono-code text-slate-300 flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                {cap.name}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Model Selection Card */}
      <GlassCard variant="default" className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-mono-code font-semibold uppercase tracking-wider text-slate-200">
            Model Routing
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Select target AI routing engine executed securely on DOLOR3V Microcloud backend:
        </p>

        <div className="space-y-1.5">
          {availableModels.map((model) => (
            <label
              key={model}
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                selectedModel === model
                  ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-200'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="modelSelection"
                  value={model}
                  checked={selectedModel === model}
                  onChange={() => onSelectModel(model)}
                  className="accent-cyan-400"
                />
                <span className="text-xs font-mono-code font-medium">{model}</span>
              </div>
              {selectedModel === model && (
                <span className="text-[10px] font-mono-code text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Security & PWA Status */}
      <GlassCard variant="default" className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono-code font-semibold uppercase tracking-wider text-slate-200">
            Security & PWA Architecture
          </h3>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Zero Secret Exposure:</strong> Frontend communicates exclusively with{' '}
              <code className="text-cyan-300 font-mono-code">/api/ai</code>. No API tokens, keys, or
              third-party secrets reside in browser code or bundles.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>PWA Status:</strong>{' '}
              {isInstalled
                ? 'Running in Standalone Native Display Mode'
                : isInstallable
                ? 'Available for Installation'
                : 'PWA Web Shell Active'}
            </p>
          </div>
        </div>

        {isInstallable && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={install}
            className="w-full mt-2 text-xs"
          >
            Install DOLOR3V Mobile PWA
          </GlassButton>
        )}
      </GlassCard>
    </div>
  );
};
