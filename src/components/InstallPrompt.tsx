import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { GlassButton } from './ui/GlassButton';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running in standalone mode or user dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Android / Chromium flow
  if (isInstallable) {
    return (
      <GlassButton
        variant="primary"
        size="sm"
        onClick={install}
        className="text-xs py-1 px-2.5 h-8 gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
        aria-label="Install DOLOR3V Mobile App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </GlassButton>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setShowIOSGuide(true)}
          className="text-xs py-1 px-2.5 h-8 gap-1.5"
          aria-label="Install App on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
          <span>Install</span>
        </GlassButton>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl glass-panel-elevated p-6 shadow-2xl border border-white/15 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-cyan-500/20">
                  <img src="/icon.svg" alt="DOLOR3V" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white font-display">
                    Install DOLOR3V Mobile
                  </h3>
                  <p className="text-xs text-slate-400">Full native standalone workspace</p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button in Safari’s bottom toolbar (
                    <Share className="w-3 h-3 inline text-cyan-400 mx-0.5" />
                    ).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down in the share sheet and tap{' '}
                    <strong>Add to Home Screen</strong> (
                    <PlusSquare className="w-3 h-3 inline text-cyan-400 mx-0.5" />
                    ).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Tap <strong>Add</strong> in the top right to launch fullscreen.</span>
                </div>
              </div>

              <GlassButton
                variant="primary"
                size="md"
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-2"
              >
                Got It
              </GlassButton>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
