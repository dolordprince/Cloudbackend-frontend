import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Code,
  ChevronRight,
  ChevronDown,
  Clock,
  Eye,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { CodeBlock } from './CodeBlock';

export interface WorkspaceFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  fileType?: string;
  modifiedStatus?: 'current' | 'generated' | 'modified';
  content?: string;
  children?: WorkspaceFile[];
}

interface FileTreeProps {
  onSelectFile?: (file: WorkspaceFile) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ onSelectFile }) => {
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const initialFiles: WorkspaceFile[] = [
    {
      name: 'index.html',
      path: '/index.html',
      type: 'file',
      fileType: 'html',
      modifiedStatus: 'current',
      content: `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>DOLOR3V Mobile AI Studio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'App.tsx',
          path: '/src/App.tsx',
          type: 'file',
          fileType: 'typescript',
          modifiedStatus: 'current',
          content: `// DOLOR3V Mobile AI Studio Root
import React from 'react';
import { useDolor3v } from './lib/dolor3v-api';

export default function App() {
  return <div className="min-h-screen bg-[#07080c] text-white">...</div>;
}`,
        },
        {
          name: 'index.css',
          path: '/src/index.css',
          type: 'file',
          fileType: 'css',
          modifiedStatus: 'current',
          content: `@import "tailwindcss";
@layer base {
  :root {
    --bg-base: #07080c;
    --border-glass: rgba(255, 255, 255, 0.08);
  }
}`,
        },
        {
          name: 'components',
          path: 'src/components',
          type: 'directory',
          children: [
            {
              name: 'PromptComposer.tsx',
              path: '/src/components/PromptComposer.tsx',
              type: 'file',
              fileType: 'typescript',
              modifiedStatus: 'current',
              content: `export const PromptComposer = () => { /* Glass multiline composer */ };`,
            },
            {
              name: 'ChatMessage.tsx',
              path: '/src/components/ChatMessage.tsx',
              type: 'file',
              fileType: 'typescript',
              modifiedStatus: 'current',
              content: `export const ChatMessage = () => { /* Markdown & Code block rendering */ };`,
            },
            {
              name: 'VisualLab.tsx',
              path: '/src/components/VisualLab.tsx',
              type: 'file',
              fileType: 'typescript',
              modifiedStatus: 'current',
              content: `export const VisualLab = () => { /* AI Image Generator on DOLOR3V Microcloud */ };`,
            },
          ],
        },
        {
          name: 'lib',
          path: 'src/lib',
          type: 'directory',
          children: [
            {
              name: 'dolor3v-api.ts',
              path: '/src/lib/dolor3v-api.ts',
              type: 'file',
              fileType: 'typescript',
              modifiedStatus: 'current',
              content: `// Centralized DOLOR3V Microcloud API client
export const DOLOR3V_BASE_URL = 'https://cloudbackend.personaldolor.workers.dev';
export async function postAi(params) { ... }`,
            },
          ],
        },
      ],
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      fileType: 'json',
      modifiedStatus: 'current',
      content: `{
  "name": "dolor3v-mobile-ai-studio",
  "private": true,
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.1",
    "vite-plugin-pwa": "^0.21.1"
  }
}`,
    },
  ];

  const getFileIcon = (fileName: string, type: string) => {
    if (type === 'directory') return null;
    if (fileName.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400" />;
    if (fileName.endsWith('.html')) return <FileCode className="w-4 h-4 text-orange-400" />;
    if (fileName.endsWith('.css')) return <FileText className="w-4 h-4 text-blue-400" />;
    return <Code className="w-4 h-4 text-cyan-400" />;
  };

  const renderTreeItem = (node: WorkspaceFile, depth = 0) => {
    if (node.type === 'directory') {
      const isExpanded = !!expandedFolders[node.path];
      return (
        <div key={node.path} className="w-full select-none">
          <button
            type="button"
            onClick={() => toggleFolder(node.path)}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs text-slate-300 transition text-left"
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <Folder className="w-4 h-4 text-cyan-500/70" />
            )}
            <span className="font-medium text-slate-200">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div className="w-full">
              {node.children.map((child) => renderTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedFile?.path === node.path;

    return (
      <div
        key={node.path}
        className="w-full select-none"
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedFile(node);
            if (onSelectFile) onSelectFile(node);
          }}
          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition text-left ${
            isSelected
              ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
              : 'hover:bg-white/[0.05] text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {getFileIcon(node.name, node.type)}
            <span className="truncate">{node.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-slate-500 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
              {node.fileType}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3 w-full">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-mono-code uppercase tracking-wider text-slate-400">
          DOLOR3V Workspace Files
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Synced</span>
        </div>
      </div>

      {/* Tree list */}
      <GlassCard variant="default" className="p-2 space-y-0.5">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-mono-code text-slate-400 border-b border-white/[0.06] mb-1">
          <Folder className="w-3.5 h-3.5 text-cyan-400" />
          <span>/ (workspace root)</span>
        </div>
        {initialFiles.map((f) => renderTreeItem(f, 0))}
      </GlassCard>

      {/* Selected File Viewer */}
      {selectedFile && selectedFile.content && (
        <div className="mt-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-300">
              <Eye className="w-3.5 h-3.5" />
              <span>Viewing: {selectedFile.path}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <CodeBlock
            code={selectedFile.content}
            filename={selectedFile.name}
            language={selectedFile.fileType}
          />
        </div>
      )}
    </div>
  );
};
