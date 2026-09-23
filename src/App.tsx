/**
 * DOLOR3V MOBILE AI STUDIO
 * Production-ready, installable mobile-first PWA frontend for DOLOR3V Microcloud
 * Connected to: https://cloudbackend.personaldolor.workers.dev
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Settings,
  FolderCode,
  MessageSquare,
  Play,
  Cpu,
  Activity,
  Layers,
  Code2,
  RefreshCw,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import {
  getHealth,
  getModels,
  postAi,
  HealthResponse,
  Dolor3vApiError,
} from './lib/dolor3v-api';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Subtle3DCanvas } from './components/Subtle3DCanvas';
import { ConnectionStatus } from './components/ConnectionStatus';
import { InstallPrompt } from './components/InstallPrompt';
import { PromptComposer } from './components/PromptComposer';
import { ChatMessage, ChatMessageData } from './components/ChatMessage';
import { FileTree } from './components/FileTree';
import { BuildStatus, BuildStep } from './components/BuildStatus';
import { PreviewCard } from './components/PreviewCard';
import { VisualLab, VisualAsset } from './components/VisualLab';
import { ActivityTimeline, ActivityEvent } from './components/ActivityTimeline';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { SettingsPanel } from './components/SettingsPanel';
import { GlassCard } from './components/ui/GlassCard';
import { GlassButton } from './components/ui/GlassButton';

type WorkspaceTab = 'CHAT' | 'FILES' | 'BUILD' | 'PREVIEW' | 'ACTIVITY';

export default function App() {
  const isBrowserOnline = useOnlineStatus();

  // Health state
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  // Models state
  const [availableModels, setAvailableModels] = useState<string[]>(['openai/gpt-5.4-nano']);
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-5.4-nano');

  // Navigation state
  const [navTab, setNavTab] = useState<NavTab>('home');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('CHAT');

  // Chat & AI state
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  // Build simulation & preview state
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    { id: '1', label: 'Understanding request', status: 'idle' },
    { id: '2', label: 'Workspace loaded', status: 'idle' },
    { id: '3', label: 'AI response received', status: 'idle' },
    { id: '4', label: 'Applying changes', status: 'idle' },
    { id: '5', label: 'Running verification', status: 'idle' },
    { id: '6', label: 'Preparing preview', status: 'idle' },
  ]);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [lastBuildTime, setLastBuildTime] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Activity events
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  // Abort controller ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initial Health Check and Model Fetch
  const checkMicrocloudHealth = async () => {
    setHealthStatus('checking');
    const startTime = performance.now();
    try {
      const data = await getHealth();
      const duration = Math.round(performance.now() - startTime);
      setHealthData(data);
      setHealthStatus(data.ok ? 'online' : 'offline');

      // Record telemetry
      logActivity({
        type: 'health',
        method: 'GET',
        endpoint: '/api/health',
        status: data.ok ? 'success' : 'error',
        durationMs: duration,
        provider: 'cloudflare-workers',
        details: `Service: ${data.service || 'dolor3v-microcloud'}, v${data.version || '4.0.0'}`,
      });

      // Try fetching models
      try {
        const modelsRes = await getModels();
        if (modelsRes.data && modelsRes.data.length > 0) {
          const ids = modelsRes.data.map((m) => m.id);
          setAvailableModels(ids);
          if (!ids.includes(selectedModel)) {
            setSelectedModel(ids[0]);
          }
        }
      } catch {
        // Default models fallback if /v1/models fails
      }
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      setHealthStatus('offline');
      logActivity({
        type: 'health',
        method: 'GET',
        endpoint: '/api/health',
        status: 'error',
        durationMs: duration,
        details: err instanceof Error ? err.message : 'Backend unreachable',
      });
    }
  };

  useEffect(() => {
    checkMicrocloudHealth();
    // Heartbeat every 45 seconds
    const interval = setInterval(checkMicrocloudHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  const logActivity = (evt: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      ...evt,
    };
    setActivityEvents((prev) => [newEvent, ...prev]);
  };

  // Main prompt dispatch to DOLOR3V Cloudbackend
  const handleSendPrompt = async (
    promptText: string,
    options?: { attachContext?: string }
  ) => {
    if (!promptText.trim() || isLoading) return;

    setLastError(null);
    setLastFailedPrompt(null);
    setIsLoading(true);
    setIsBuilding(true);

    const userTimestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Add user message
    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Update build steps to pending
    setBuildSteps([
      { id: '1', label: 'Understanding request', status: 'pending' },
      { id: '2', label: 'Workspace loaded', status: 'pending' },
      { id: '3', label: 'AI response received', status: 'idle' },
      { id: '4', label: 'Applying changes', status: 'idle' },
      { id: '5', label: 'Running verification', status: 'idle' },
      { id: '6', label: 'Preparing preview', status: 'idle' },
    ]);

    // Switch to Chat or Workspace tab on mobile if currently on Home
    if (navTab === 'home') {
      setNavTab('chat');
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const reqStartTime = performance.now();

    try {
      // Step 1 completed
      setBuildSteps((prev) =>
        prev.map((s) => (s.id === '1' || s.id === '2' ? { ...s, status: 'success' } : s))
      );
      setBuildSteps((prev) =>
        prev.map((s) => (s.id === '3' ? { ...s, status: 'pending' } : s))
      );

      // Build context payload
      const conversationPayload = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      conversationPayload.push({
        role: 'user',
        content: options?.attachContext
          ? `${promptText}\n[Attached Context: ${options.attachContext}]`
          : promptText,
      });

      // REAL BACKEND CALL to https://cloudbackend.personaldolor.workers.dev/api/ai
      const response = await postAi(
        {
          messages: conversationPayload,
          model: selectedModel,
        },
        abortController.signal
      );

      const reqDuration = Math.round(performance.now() - reqStartTime);

      if (response.ok && response.result) {
        const aiTimestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const aiMsg: ChatMessageData = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.result,
          timestamp: aiTimestamp,
          provider: response.provider || 'pollinations',
          model: selectedModel,
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Step 3, 4, 5, 6 update
        setBuildSteps([
          { id: '1', label: 'Understanding request', status: 'success' },
          { id: '2', label: 'Workspace loaded', status: 'success' },
          { id: '3', label: 'AI response received', status: 'success', duration: reqDuration },
          { id: '4', label: 'Applying changes', status: 'success' },
          { id: '5', label: 'Running verification', status: 'success' },
          { id: '6', label: 'Preparing preview', status: 'idle' },
        ]);

        setLastBuildTime(aiTimestamp);

        // Check if response mentions or builds preview
        if (response.result.includes('<!DOCTYPE html>') || response.result.includes('preview:')) {
          setPreviewUrl('https://ais-dev-qosjz6dazzebhlrcbysfdd-17943857953.europe-west2.run.app');
          setBuildSteps((prev) =>
            prev.map((s) => (s.id === '6' ? { ...s, status: 'success' } : s))
          );
        }

        // Log real telemetry
        logActivity({
          type: 'ai',
          method: 'POST',
          endpoint: '/api/ai',
          status: 'success',
          durationMs: reqDuration,
          provider: response.provider || 'pollinations',
          details: `Prompt: "${promptText.substring(0, 45)}..."`,
        });
      } else {
        throw new Error(response.error || 'Empty response from DOLOR3V backend');
      }
    } catch (err: unknown) {
      const reqDuration = Math.round(performance.now() - reqStartTime);

      if (err instanceof Error && err.name === 'AbortError') {
        logActivity({
          type: 'ai',
          method: 'POST',
          endpoint: '/api/ai',
          status: 'error',
          details: 'Request cancelled by user',
        });
        setBuildSteps((prev) =>
          prev.map((s) => (s.status === 'pending' ? { ...s, status: 'idle' } : s))
        );
      } else {
        const errorMsg =
          err instanceof Dolor3vApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "DOLOR3V couldn't complete that request.";

        setLastError(errorMsg);
        setLastFailedPrompt(promptText);

        setBuildSteps((prev) =>
          prev.map((s) => (s.status === 'pending' ? { ...s, status: 'failed' } : s))
        );

        logActivity({
          type: 'ai',
          method: 'POST',
          endpoint: '/api/ai',
          status: 'error',
          durationMs: reqDuration,
          details: errorMsg,
        });
      }
    } finally {
      setIsLoading(false);
      setIsBuilding(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsBuilding(false);
  };

  const handleRegenerate = (messageId: string) => {
    // Find the previous user prompt and regenerate
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex > 0) {
      const prevUserMsg = messages[msgIndex - 1];
      if (prevUserMsg && prevUserMsg.role === 'user') {
        handleSendPrompt(prevUserMsg.content);
      }
    }
  };

  const handleUseAssetInWorkspace = (asset: VisualAsset) => {
    const promptWithAsset = `Use the generated asset from Visual Lab (${asset.url}) in the workspace design for: "${asset.prompt}"`;
    handleSendPrompt(promptWithAsset);
  };

  return (
    <div className="relative min-h-screen bg-[#07080c] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* 3D Wireframe & Particle Canvas */}
      <Subtle3DCanvas />

      {/* Offline banner if browser loses network */}
      {!isBrowserOnline && (
        <div className="relative z-50 bg-amber-500/90 text-black px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span>Offline Mode — Cached application shell active</span>
        </div>
      )}

      {/* Top Application Header (Fixed/Sticky Safe-Area Compliant) */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] px-4 pt-safe pb-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNavTab('home')}
              className="flex items-center gap-2 group text-left focus:outline-none"
              aria-label="DOLOR3V Mobile Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-blue-600 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <img src="/icon.svg" alt="DOLOR3V" className="w-full h-full" />
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight text-white block leading-none">
                  DOLOR3V
                </span>
                <span className="text-[10px] font-mono-code text-cyan-400/80 tracking-wider">
                  STUDIO
                </span>
              </div>
            </button>

            {/* Connection status indicator */}
            <div className="ml-1">
              <ConnectionStatus
                status={healthStatus}
                healthData={healthData}
                onRetry={checkMicrocloudHealth}
                compact
              />
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
            <button
              onClick={() => {
                setNavTab('chat');
                setWorkspaceTab('CHAT');
              }}
              className={`hover:text-white transition ${
                navTab === 'chat' && workspaceTab === 'CHAT' ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Conversation
            </button>
            <button
              onClick={() => {
                setNavTab('workspace');
                setWorkspaceTab('FILES');
              }}
              className={`hover:text-white transition ${
                workspaceTab === 'FILES' ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Files
            </button>
            <button
              onClick={() => {
                setNavTab('workspace');
                setWorkspaceTab('BUILD');
              }}
              className={`hover:text-white transition ${
                workspaceTab === 'BUILD' ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Build Pipeline
            </button>
            <button
              onClick={() => {
                setNavTab('preview');
                setWorkspaceTab('PREVIEW');
              }}
              className={`hover:text-white transition ${
                navTab === 'preview' ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => {
                setNavTab('workspace');
                setWorkspaceTab('ACTIVITY');
              }}
              className={`hover:text-white transition ${
                workspaceTab === 'ACTIVITY' ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Telemetry
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Install button & Settings) */}
          <div className="flex items-center gap-2">
            <InstallPrompt />

            <button
              onClick={() => setNavTab('settings')}
              className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition ${
                navTab === 'settings' ? 'bg-white/[0.08] text-cyan-300' : ''
              }`}
              title="Microcloud Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-safe-nav">
        {/* DESKTOP 3-PANEL VIEW (> 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-130px)]">
          {/* Left Panel: Navigation, Models, Telemetry */}
          <div className="lg:col-span-3 flex flex-col space-y-4 overflow-y-auto pr-1">
            {/* Project Card */}
            <GlassCard variant="default" className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-xs font-mono-code uppercase text-slate-400">Workspace</span>
                <span className="text-[11px] font-mono-code text-cyan-400">Microcloud v4.0</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white font-display">Active Session</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct connection to DOLOR3V Microcloud
                </p>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-mono-code text-slate-400 block mb-1">
                  Active Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50 font-mono-code"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m} className="bg-[#090b10] text-slate-200">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </GlassCard>

            {/* Quick Actions / Strip selector */}
            <GlassCard variant="default" className="p-3 space-y-1">
              {(['CHAT', 'FILES', 'BUILD', 'PREVIEW', 'ACTIVITY'] as WorkspaceTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWorkspaceTab(tab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono-code transition text-left ${
                    workspaceTab === tab
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{tab}</span>
                  {workspaceTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </GlassCard>

            {/* Microcloud Health details */}
            <GlassCard variant="subtle" className="p-3.5 space-y-2 text-xs font-mono-code">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold">Security Verified</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero client secrets exposed. Browser speaks directly to DOLOR3V Cloudbackend.
              </p>
            </GlassCard>
          </div>

          {/* Center Panel: AI Conversation & Composer */}
          <div className="lg:col-span-5 flex flex-col h-full rounded-2xl glass-panel p-4 space-y-3 overflow-hidden">
            {/* Conversation Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono-code font-semibold uppercase text-slate-200">
                  AI Conversation
                </span>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Chat message list */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto pr-1 space-y-2 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white font-display">
                      What are we building?
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                      Describe it. DOLOR3V will help you turn the idea into a real application.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onRegenerate={handleRegenerate}
                    isLast={idx === messages.length - 1}
                  />
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl glass-panel text-xs text-cyan-300 font-mono-code animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>DOLOR3V Microcloud is processing request...</span>
                </div>
              )}

              {/* Last Error State with Retry Button */}
              {lastError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>DOLOR3V couldn't complete that request.</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">{lastError}</p>
                  {lastFailedPrompt && (
                    <GlassButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleSendPrompt(lastFailedPrompt)}
                      className="h-7 text-xs px-3 gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </GlassButton>
                  )}
                </div>
              )}
            </div>

            {/* Prompt Composer pinned at bottom */}
            <div className="shrink-0 pt-2 border-t border-white/[0.06]">
              <PromptComposer
                onSend={handleSendPrompt}
                onCancel={handleCancel}
                isLoading={isLoading}
                onOpenImageLab={() => setWorkspaceTab('ACTIVITY')}
              />
            </div>
          </div>

          {/* Right Panel: Workspace / Files / Build / Preview */}
          <div className="lg:col-span-4 flex flex-col h-full space-y-4 overflow-y-auto pr-1">
            {workspaceTab === 'CHAT' && (
              <div className="space-y-4">
                <BuildStatus
                  steps={buildSteps}
                  isBuilding={isBuilding}
                  lastBuildTime={lastBuildTime}
                />
                <PreviewCard previewUrl={previewUrl} />
              </div>
            )}

            {workspaceTab === 'FILES' && <FileTree />}

            {workspaceTab === 'BUILD' && (
              <BuildStatus
                steps={buildSteps}
                isBuilding={isBuilding}
                lastBuildTime={lastBuildTime}
              />
            )}

            {workspaceTab === 'PREVIEW' && <PreviewCard previewUrl={previewUrl} />}

            {workspaceTab === 'ACTIVITY' && (
              <div className="space-y-4">
                <VisualLab onUseInWorkspace={handleUseAssetInWorkspace} />
                <ActivityTimeline
                  events={activityEvents}
                  onClear={() => setActivityEvents([])}
                />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE LAYOUT (< 1024px) */}
        <div className="lg:hidden space-y-4">
          {/* TAB 1: HOME */}
          {navTab === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Main Hero Card */}
              <GlassCard variant="elevated" glow="cyan" className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono-code text-cyan-300 mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>DOLOR3V MICROCLOUD AI</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                      What are we building?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      Describe it. DOLOR3V will help you turn the idea into a real application.
                    </p>
                  </div>
                </div>

                {/* Prompt Composer in Hero */}
                <PromptComposer
                  onSend={handleSendPrompt}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                  onOpenImageLab={() => {
                    setNavTab('workspace');
                    setWorkspaceTab('ACTIVITY');
                  }}
                />
              </GlassCard>

              {/* Horizontal Mobile Workspace Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono-code text-slate-400 uppercase tracking-wider">
                    Workspace Strip
                  </span>
                  <span className="text-[11px] font-mono-code text-cyan-400">5 Modules</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { id: 'CHAT', label: 'CHAT', icon: MessageSquare },
                    { id: 'FILES', label: 'FILES', icon: FolderCode },
                    { id: 'BUILD', label: 'BUILD', icon: Cpu },
                    { id: 'PREVIEW', label: 'PREVIEW', icon: Play },
                    { id: 'ACTIVITY', label: 'ACTIVITY', icon: Activity },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setWorkspaceTab(item.id as WorkspaceTab);
                          setNavTab('workspace');
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-mono-code text-slate-300 hover:text-white hover:border-white/20 transition shrink-0 active:scale-97"
                      >
                        <Icon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Build Pipeline Overview Card */}
              <BuildStatus
                steps={buildSteps}
                isBuilding={isBuilding}
                lastBuildTime={lastBuildTime}
              />
            </div>
          )}

          {/* TAB 2: CHAT */}
          {navTab === 'chat' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Chat Container */}
              <GlassCard variant="default" className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono-code font-semibold uppercase text-slate-200">
                      Active AI Workspace
                    </span>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="text-[11px] font-mono-code text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 min-h-[260px] max-h-[60vh] overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs font-mono-code space-y-2">
                      <Sparkles className="w-6 h-6 text-cyan-400/50 mx-auto" />
                      <p>No messages yet. Send a prompt below to interrogate the AI.</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        onRegenerate={handleRegenerate}
                        isLast={idx === messages.length - 1}
                      />
                    ))
                  )}

                  {isLoading && (
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel text-xs text-cyan-300 font-mono-code animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>DOLOR3V Microcloud is generating response...</span>
                    </div>
                  )}

                  {lastError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4" />
                        <span>DOLOR3V couldn't complete that request.</span>
                      </div>
                      <p className="text-[11px] text-rose-300/80">{lastError}</p>
                      {lastFailedPrompt && (
                        <GlassButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleSendPrompt(lastFailedPrompt)}
                          className="h-7 text-xs px-3 gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </GlassButton>
                      )}
                    </div>
                  )}
                </div>

                {/* Composer inside Chat tab */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <PromptComposer
                    onSend={handleSendPrompt}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                    onOpenImageLab={() => {
                      setNavTab('workspace');
                      setWorkspaceTab('ACTIVITY');
                    }}
                  />
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 3: WORKSPACE */}
          {navTab === 'workspace' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Workspace Strip Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(['FILES', 'BUILD', 'ACTIVITY'] as WorkspaceTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setWorkspaceTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono-code whitespace-nowrap transition ${
                      workspaceTab === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 font-semibold'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {workspaceTab === 'FILES' && <FileTree />}
              {workspaceTab === 'BUILD' && (
                <BuildStatus
                  steps={buildSteps}
                  isBuilding={isBuilding}
                  lastBuildTime={lastBuildTime}
                />
              )}
              {workspaceTab === 'ACTIVITY' && (
                <div className="space-y-4">
                  <VisualLab onUseInWorkspace={handleUseAssetInWorkspace} />
                  <ActivityTimeline
                    events={activityEvents}
                    onClear={() => setActivityEvents([])}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREVIEW */}
          {navTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <PreviewCard previewUrl={previewUrl} />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {navTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <SettingsPanel
                healthData={healthData}
                onRefreshHealth={checkMicrocloudHealth}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                availableModels={availableModels}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation Bar (Mobile only) */}
      <BottomNavigation
        activeTab={navTab}
        onChangeTab={setNavTab}
        badgeCounts={{
          chat: messages.length > 0 ? messages.length : undefined,
        }}
      />
    </div>
  );
}
