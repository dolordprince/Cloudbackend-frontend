import React from 'react';
import { Check, Circle, Loader2, Sparkles, Terminal, Cpu } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export type BuildStepStatus = 'idle' | 'pending' | 'success' | 'failed';

export interface BuildStep {
  id: string;
  label: string;
  status: BuildStepStatus;
  detail?: string;
  duration?: number;
}

interface BuildStatusProps {
  steps: BuildStep[];
  isBuilding: boolean;
  totalDuration?: number;
  lastBuildTime?: string;
}

export const BuildStatus: React.FC<BuildStatusProps> = ({
  steps,
  isBuilding,
  totalDuration,
  lastBuildTime,
}) => {
  const renderStepIcon = (status: BuildStepStatus) => {
    switch (status) {
      case 'success':
        return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'pending':
        return <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
      case 'failed':
        return <Circle className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />;
      case 'idle':
      default:
        return <Circle className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStepStatusText = (status: BuildStepStatus) => {
    switch (status) {
      case 'success':
        return 'Completed';
      case 'pending':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      case 'idle':
      default:
        return 'Queued';
    }
  };

  const completedCount = steps.filter((s) => s.status === 'success').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <GlassCard variant="default" className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-display">DOLOR3V BUILD</h3>
            <p className="text-[11px] text-slate-400 font-mono-code">
              Microcloud Build Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBuilding ? (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono-code text-cyan-300 animate-pulse">
              ACTIVE BUILD
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono-code text-slate-400">
              IDLE
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono-code text-slate-400">
          <span>Execution Progress</span>
          <span className="text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step) => {
          const isPending = step.status === 'pending';
          const isSuccess = step.status === 'success';

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition border ${
                isPending
                  ? 'bg-cyan-950/20 border-cyan-500/30'
                  : isSuccess
                  ? 'bg-white/[0.02] border-white/[0.04]'
                  : 'bg-transparent border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center">
                  {renderStepIcon(step.status)}
                </div>
                <span
                  className={`text-xs ${
                    isPending
                      ? 'text-cyan-200 font-medium'
                      : isSuccess
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono-code text-slate-500">
                {step.duration && <span>{step.duration}ms</span>}
                <span
                  className={
                    isSuccess
                      ? 'text-emerald-400'
                      : isPending
                      ? 'text-cyan-400'
                      : 'text-slate-600'
                  }
                >
                  {getStepStatusText(step.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono-code text-slate-500">
        <span>Cloudflare Worker Engine</span>
        {lastBuildTime && <span>Last sync: {lastBuildTime}</span>}
      </div>
    </GlassCard>
  );
};
