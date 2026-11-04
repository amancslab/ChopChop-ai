import React, { useState } from 'react';
import { Key, ExternalLink, ShieldCheck, Check, X } from 'lucide-react';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveKey: (key: string) => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onSaveKey,
}) => {
  const [inputVal, setInputVal] = useState(geminiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputVal.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 bg-[#161F30] border border-[#243049] rounded-2xl shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B0F19] border border-[#243049] flex items-center justify-center text-[#FACC15]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Google Gemini API Key (BYOK)
            </h3>
            <p className="text-xs text-neutral-400">
              Bring Your Own Key · $0.00 Server Cost
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          ChopChop-ai uses your own free tier Google Gemini 1.5 Flash quota to analyze transcripts and detect viral hooks. Your key is stored strictly in client session state and never sent to third-party databases.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-neutral-400">Gemini API Key</label>
          <input
            type="password"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#10B981] transition"
          />
        </div>

        <div className="pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-[#10B981] hover:underline font-semibold"
          >
            <span>Get your free Gemini API key at aistudio.google.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold font-display bg-[#10B981] hover:bg-[#059669] text-neutral-950 flex items-center space-x-1.5 transition shadow-sm"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            <span>{saved ? 'Saved!' : 'Save Key for Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
