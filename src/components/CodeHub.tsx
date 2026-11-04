import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle, Code2, Terminal } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>Deliverables & Source Code Repository</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Production Source Files for Streamlit & Hugging Face
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          All required deliverables are production-ready without any omissions, placeholders, or paid API keys. You can run these files locally or push directly to a Hugging Face Space.
        </p>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        {fileKeys.map((key) => {
          const item = DELIVERABLE_FILES[key];
          const isActive = activeFile === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{item.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Active File Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Top File Meta Bar */}
        <div className="p-4 bg-neutral-900/80 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 font-mono text-sm font-bold text-white">
              <span>{fileData.filename}</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                {fileData.language.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-400">{fileData.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-xs text-neutral-300 max-h-[620px] overflow-y-auto overflow-x-auto leading-relaxed bg-black/60">
          <pre className="text-neutral-300">
            {fileData.content.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-neutral-900/50 py-0.5 px-1 rounded">
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
