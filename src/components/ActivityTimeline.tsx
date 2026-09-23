import React from 'react';
import { Activity, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export interface ActivityEvent {
  id: string;
  type: 'ai' | 'health' | 'image' | 'browser' | 'system';
  method: string;
  endpoint: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  durationMs?: number;
  provider?: string;
  details?: string;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  onClear?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, onClear }) => {
  return (
    <GlassCard variant="default" className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-white font-mono-code uppercase tracking-wider">
            ACTIVITY TELEMETRY
          </h3>
        </div>

        {events.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition"
            aria-label="Clear activity logs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-mono-code">
          No activity recorded yet. Interacting with the AI or backend will log requests here.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {events.map((evt) => {
            const isSuccess = evt.status === 'success';
            const isPending = evt.status === 'pending';

            return (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isPending ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-mono-code text-[11px] font-semibold text-slate-200">
                      {evt.method} {evt.endpoint}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono-code text-slate-500">
                    {evt.durationMs !== undefined && (
                      <span className="text-cyan-400">{evt.durationMs}ms</span>
                    )}
                    <span>{evt.timestamp}</span>
                  </div>
                </div>

                {evt.details && (
                  <p className="text-[11px] font-mono-code text-slate-400 truncate pl-5">
                    {evt.details}
                  </p>
                )}

                {evt.provider && (
                  <div className="pl-5 flex items-center gap-2 text-[10px] font-mono-code text-slate-500">
                    <span>Provider:</span>
                    <span className="text-indigo-300">{evt.provider}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
