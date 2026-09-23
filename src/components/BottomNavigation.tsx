import React from 'react';
import { Home, MessageSquare, FolderCode, Play, Settings } from 'lucide-react';

export type NavTab = 'home' | 'chat' | 'workspace' | 'preview' | 'settings';

interface BottomNavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  badgeCounts?: Partial<Record<NavTab, number>>;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  badgeCounts = {},
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'workspace', label: 'Workspace', icon: FolderCode },
    { id: 'preview', label: 'Preview', icon: Play },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 md:hidden"
    >
      <div className="mx-auto max-w-md rounded-2xl glass-panel-elevated border border-white/[0.12] p-1 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = badgeCounts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 min-h-[48px] ${
                  isActive
                    ? 'text-cyan-300 bg-white/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 text-cyan-300' : 'text-slate-400'
                    }`}
                  />
                  {count !== undefined && count > 0 && (
                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-[10px] font-mono-code font-bold text-black flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-tight mt-1 truncate ${
                    isActive ? 'text-cyan-200 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Subtle active glow indicator dot */}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
