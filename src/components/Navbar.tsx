import React from 'react';
import { Film, Code2, Terminal, FileCode, Sparkles, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'ass' | 'code' | 'deploy';
  setActiveTab: (tab: 'studio' | 'ass' | 'code' | 'deploy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 ring-1 ring-white/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  ShortsForge
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                  Open Source
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                AI YouTube to 9:16 Shorts Repurposer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-neutral-900/70 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio & Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('ass')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ass'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>ASS Subtitle Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Deliverables & Code</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'deploy'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Deployment Guide</span>
              <span className="sm:hidden">Deploy</span>
            </button>
          </nav>

          {/* Engine Pill */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-neutral-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>faster-whisper + ffmpeg</span>
          </div>
        </div>
      </div>
    </header>
  );
};
