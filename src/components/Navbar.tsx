import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Key, LogOut, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  onSignOut: () => void;
  geminiKey: string;
  onOpenKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  geminiKey,
  onOpenKeyModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch avatar image based on Gmail account
  const userEmail = user.email || 'mauryaaman2000@gmail.com';
  const gmailAvatarUrl = `https://unavatar.io/${encodeURIComponent(userEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Aman+Maurya')}&background=10B981&color=fff&rounded=true&bold=true`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#243049] bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark (Clean, without "/ razor-cut") */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#161F30] to-[#0B0F19] border border-[#243049] flex items-center justify-center shadow-lg shadow-black/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Scissors className="w-4 h-4 text-[#10B981] transform -rotate-45" />
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="font-display text-lg font-black tracking-tight text-white">
                ChopChop<span className="text-[#10B981]">.ai</span>
              </span>
            </div>

            {/* Subtle Engine Status Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#161F30] border border-[#243049] text-[11px] font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Engine: Ready</span>
            </div>
          </div>

          {/* Right Area: Circular Gmail Profile Icon (No Email text shown) */}
          <div className="flex items-center space-x-3" ref={menuRef}>
            {user.authenticated && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center focus:outline-none transition group"
                  title="Google Account"
                  aria-label="User profile menu"
                >
                  {/* Circular Gmail Profile Icon */}
                  <div className="relative">
                    <img
                      src={gmailAvatarUrl}
                      alt="Gmail Profile"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#243049] group-hover:ring-[#10B981] shadow-lg shadow-black/50 transition-all duration-150"
                      onError={(e) => {
                        // Fallback to stylized initial if network issue
                        const target = e.currentTarget;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'A')}&background=10B981&color=fff&rounded=true&bold=true`;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#0B0F19]" />
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#161F30] border border-[#243049] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                    <div className="px-3 py-2 border-b border-[#243049]/80">
                      <div className="text-xs font-bold text-white font-display">
                        {user.name || 'Google Account'}
                      </div>
                      <div className="text-[11px] text-[#10B981] font-mono flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Google Sign-In Active</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenKeyModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-neutral-300 hover:text-white hover:bg-[#243049]/60 flex items-center space-x-2 transition"
                    >
                      <Key className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Gemini API Key (BYOK)</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
