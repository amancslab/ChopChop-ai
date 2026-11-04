import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Code2, Terminal, CheckCircle2 } from 'lucide-react';
import { DELIVERABLE_FILES } from '../data/deliverables';

export const CodeHub: React.FC = () => {
  const fileKeys = Object.keys(DELIVERABLE_FILES);
  const [activeFile, setActiveFile] = useState<string>('app.py');
  const [copied, setCopied] = useState<boolean>(false);

  const fileData = DELIVERABLE_FILES[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#243049] bg-[#161F30] backdrop-blur-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>PRODUCTION SOURCE CODE & DEPLOYMENT FILES</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          ChopChop-ai Open Source Deliverables
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          Complete, verified, single-file implementations without paid dependencies or placeholders. Run locally with Python 3.10+, launch with Streamlit, or deploy directly to Hugging Face Spaces.
        </p>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#243049] pb-3">
        {fileKeys.map((key) => {
          const item = DELIVERABLE_FILES[key];
          const isActive = activeFile === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                isActive
                  ? 'bg-[#10B981] text-neutral-950 font-bold shadow-md shadow-[#10B981]/20'
                  : 'bg-[#161F30] border border-[#243049] text-neutral-400 hover:text-white hover:bg-[#243049]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{item.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Active File Card */}
      <div className="rounded-2xl border border-[#243049] bg-[#0B0F19] overflow-hidden shadow-2xl">
        {/* Top File Meta Bar */}
        <div className="p-4 bg-[#161F30] border-b border-[#243049] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 font-mono text-sm font-bold text-white">
              <span>{fileData.filename}</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#0B0F19] text-[#10B981] border border-[#243049]">
                {fileData.language.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-400">{fileData.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0B0F19] hover:bg-[#243049] text-neutral-200 border border-[#243049] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#10B981] hover:bg-[#059669] text-neutral-950 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-xs text-neutral-300 max-h-[620px] overflow-y-auto overflow-x-auto leading-relaxed bg-[#0B0F19]">
          <pre className="text-neutral-300">
            {fileData.content.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-[#161F30]/60 py-0.5 px-1 rounded">
                <span className="w-10 text-neutral-600 select-none text-right pr-4 shrink-0 font-mono text-[11px]">
                  {idx + 1}
                </span>
                <span className="whitespace-pre overflow-x-visible">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
