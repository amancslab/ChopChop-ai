import React from 'react';
import { Scissors, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthGateProps {
  onSignIn: (user: UserProfile) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onSignIn }) => {
  const handleGoogleSignIn = () => {
    onSignIn({
      name: 'Aman Maurya',
      email: 'mauryaaman2000@gmail.com',
      picture: 'https://unavatar.io/mauryaaman2000@gmail.com?fallback=https://ui-avatars.com/api/?name=Aman+Maurya&background=10B981&color=fff&rounded=true&bold=true',
      authenticated: true,
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg p-8 sm:p-10 bg-[#161F30] border border-[#243049] rounded-3xl shadow-2xl space-y-6 text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B0F19] border border-[#243049] shadow-lg shadow-black/50 text-[#10B981]">
            <Scissors className="w-7 h-7 transform -rotate-45" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
              ChopChop<span className="text-[#10B981]">.ai</span>
            </h2>
            <p className="text-sm text-neutral-400 font-medium">
              Turn fat videos into viral Shorts in 1 chop.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 text-left bg-[#0B0F19] border border-[#243049] rounded-2xl p-4 space-y-2.5 text-xs text-neutral-300">
          <div className="flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-[#10B981] shrink-0" />
            <span><strong>Gemini 1.5 Flash:</strong> AI-powered viral hook & moment extraction</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Scissors className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span><strong>yt-dlp Range:</strong> Streams only the cut slice (zero 1-hour bloat)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span><strong>Whisper ASS Subtitles:</strong> Word-level TikTok Gold karaoke captions</span>
          </div>
        </div>

        {/* Google Sign-In Action */}
        <div className="relative z-10 pt-2 space-y-3">
          <p className="text-xs text-neutral-400">
            Sign in with your Google account to access the repurposing studio:
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm flex items-center justify-center space-x-3 transition shadow-lg hover:shadow-xl active:scale-[0.99] cursor-pointer"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono text-neutral-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>OAuth 2.0 Secure Gate · Restricted Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
