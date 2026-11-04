import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChopStudio } from './components/ChopStudio';
import { DesignSystemView } from './components/DesignSystemView';
import { AssInspector } from './components/AssInspector';
import { CodeHub } from './components/CodeHub';
import { AuthGate } from './components/AuthGate';
import { KeyModal } from './components/KeyModal';
import { UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'design-system' | 'ass' | 'code'>('studio');

  // User Authentication State (Default signed-in with user's Gmail)
  const [user, setUser] = useState<UserProfile>({
    name: 'Aman Maurya',
    email: 'mauryaaman2000@gmail.com',
    picture: 'https://unavatar.io/mauryaaman2000@gmail.com?fallback=https://ui-avatars.com/api/?name=Aman+Maurya&background=10B981&color=fff&rounded=true&bold=true',
    authenticated: true,
  });

  // BYOK Gemini Key State
  const [geminiKey, setGeminiKey] = useState<string>('AIzaSyD-Free-BYOK-Tier');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  const handleSignOut = () => {
    setUser({
      name: '',
      email: '',
      picture: '',
      authenticated: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#10B981] selection:text-neutral-950 antialiased">
      {/* Clean Top Navbar: No tabs, no '/ razor-cut', no 'Gemini: BYOK Active', no email text */}
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        geminiKey={geminiKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {!user.authenticated ? (
          <AuthGate onSignIn={(loggedUser) => setUser(loggedUser)} />
        ) : (
          <>
            {activeTab === 'studio' && (
              <ChopStudio
                geminiKey={geminiKey}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            )}
            {activeTab === 'design-system' && <DesignSystemView />}
            {activeTab === 'ass' && <AssInspector />}
            {activeTab === 'code' && <CodeHub />}
          </>
        )}
      </main>

      {/* Key Modal (BYOK) */}
      <KeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        geminiKey={geminiKey}
        onSaveKey={(k) => setGeminiKey(k)}
      />

      {/* Footer with quiet secondary links */}
      <footer className="border-t border-[#243049] bg-[#0B0F19]/90 py-6 text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white font-display">
              ChopChop<span className="text-[#10B981]">.ai</span>
            </span>
            <span>·</span>
            <span className="text-neutral-400">
              Turn fat videos into viral Shorts in 1 chop.
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setActiveTab('studio')}
              className={`hover:text-white transition ${
                activeTab === 'studio' ? 'text-[#10B981] font-bold' : 'text-neutral-400'
              }`}
            >
              Studio
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('design-system')}
              className={`hover:text-white transition ${
                activeTab === 'design-system' ? 'text-[#10B981] font-bold' : 'text-neutral-400'
              }`}
            >
              Design System
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('ass')}
              className={`hover:text-white transition ${
                activeTab === 'ass' ? 'text-[#10B981] font-bold' : 'text-neutral-400'
              }`}
            >
              ASS Engine
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('code')}
              className={`hover:text-white transition ${
                activeTab === 'code' ? 'text-[#10B981] font-bold' : 'text-neutral-400'
              }`}
            >
              Code & Deploy
            </button>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-[#161F30] text-[#10B981] border border-[#243049]">
              MIT License · 100% Free
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
