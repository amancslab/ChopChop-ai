import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ShortsStudio } from './components/ShortsStudio';
import { AssInspector } from './components/AssInspector';
import { CodeHub } from './components/CodeHub';
import { DeploymentGuide } from './components/DeploymentGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'ass' | 'code' | 'deploy'>('studio');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-500 selection:text-white antialiased">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 pb-16">
        {activeTab === 'studio' && <ShortsStudio />}
        {activeTab === 'ass' && <AssInspector />}
        {activeTab === 'code' && <CodeHub />}
        {activeTab === 'deploy' && <DeploymentGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">ShortsForge</span>
            <span>•</span>
            <span>100% Free & Open-Source AI Multimedia Architecture</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by Streamlit, yt-dlp, FFmpeg & Whisper</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono text-[10px]">
              MIT License
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
