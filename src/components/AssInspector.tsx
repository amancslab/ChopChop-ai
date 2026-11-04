import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Sliders, Play, Info } from 'lucide-react';
import { VIDEO_PRESETS } from '../data/presets';
import { FontSizeChoice, HighlightColorChoice } from '../types';
import { generateAssContent, ASS_COLOR_MAP, ASS_FONT_SIZES } from '../utils/assGenerator';

export const AssInspector: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('karpathy-ai');
  const [fontSize, setFontSize] = useState<FontSizeChoice>('Medium');
  const [highlightColor, setHighlightColor] = useState<HighlightColorChoice>('Yellow');
  const [wordsPerLine, setWordsPerLine] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  const preset = VIDEO_PRESETS.find((p) => p.id === selectedPresetId) || VIDEO_PRESETS[0];
  const assText = generateAssContent(preset.transcriptWords, fontSize, highlightColor, wordsPerLine);

  const handleCopy = () => {
    navigator.clipboard.writeText(assText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([assText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subtitles_${selectedPresetId}.ass`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#243049] bg-[#161F30] backdrop-blur-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">
          <FileCode className="w-4 h-4" />
          <span>ADVANCED SUBSTATION ALPHA (.ASS) RAZOR ENGINE</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Word-Level Subtitle Script Inspector & Exporter
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          FFmpeg reads this exact <code className="text-[#FACC15] font-mono">.ass</code> script via the <code className="text-sky-400 font-mono">ass=captions.ass</code> filter to hardcode the high-retention subtitles. Formatted with Bottom-Center alignment (Alignment 2), black border outline (Outline 5.0), and word-by-word karaoke highlight overrides.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="p-5 rounded-2xl border border-[#243049] bg-[#161F30] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sample selection */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-mono">Transcript Preset</label>
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#10B981]"
          >
            {VIDEO_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-mono">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as FontSizeChoice)}
            className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#10B981]"
          >
            <option value="Small">Small (48pt, MarginV: 220)</option>
            <option value="Medium">Medium (60pt, MarginV: 240)</option>
            <option value="Large">Large (74pt, MarginV: 260)</option>
          </select>
        </div>

        {/* Highlight Color */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-mono">Highlight Color</label>
          <select
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value as HighlightColorChoice)}
            className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#10B981]"
          >
            <option value="Yellow">TikTok Gold (#FACC15)</option>
            <option value="Green">Electric Emerald (#10B981)</option>
            <option value="Red">Cyber Neon Red (#FF3366)</option>
            <option value="Cyan">Cyber Cyan (#00FFFF)</option>
          </select>
        </div>

        {/* Words per Screen */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-mono flex items-center justify-between">
            <span>Words Per Line</span>
            <span className="text-[#10B981] font-bold">{wordsPerLine} words</span>
          </label>
          <input
            type="range"
            min="2"
            max="5"
            value={wordsPerLine}
            onChange={(e) => setWordsPerLine(Number(e.target.value))}
            className="w-full h-2 bg-[#0B0F19] rounded-lg appearance-none cursor-pointer accent-[#10B981] mt-2"
          />
        </div>
      </div>

      {/* Code Viewer & Word Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ASS Raw Content (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Generated .ASS Script
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#161F30] hover:bg-[#243049] text-neutral-200 border border-[#243049] transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Script'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#10B981] hover:bg-[#059669] text-neutral-950 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ASS</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-[#243049] bg-[#0B0F19] p-4 font-mono text-xs text-neutral-300 max-h-[520px] overflow-y-auto overflow-x-auto shadow-inner leading-relaxed">
            <pre className="text-neutral-300">
              {assText.split('\n').map((line, idx) => {
                const isHeader = line.startsWith('[');
                const isStyle = line.startsWith('Style:');
                const isDialogue = line.startsWith('Dialogue:');
                return (
                  <div
                    key={idx}
                    className={`py-0.5 ${
                      isHeader
                        ? 'text-[#FACC15] font-bold'
                        : isStyle
                        ? 'text-[#10B981]'
                        : isDialogue
                        ? 'text-neutral-200 hover:bg-[#161F30]/60 rounded px-1'
                        : 'text-neutral-500'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* Word Timestamps Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Whisper Word Timestamps ({preset.transcriptWords.length} words)
            </span>
          </div>

          <div className="rounded-2xl border border-[#243049] bg-[#161F30] p-3 max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-neutral-500 border-b border-[#243049] pb-2">
                <tr>
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Word</th>
                  <th className="py-1.5 px-2">Start</th>
                  <th className="py-1.5 px-2">End</th>
                  <th className="py-1.5 px-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243049]/60">
                {preset.transcriptWords.map((item, idx) => {
                  const duration = item.end - item.start;
                  return (
                    <tr key={idx} className="hover:bg-[#0B0F19]/60 transition">
                      <td className="py-1 px-2 text-neutral-500">{idx + 1}</td>
                      <td className="py-1 px-2 font-bold text-white uppercase">{item.word}</td>
                      <td className="py-1 px-2 text-[#10B981]">{item.start.toFixed(2)}s</td>
                      <td className="py-1 px-2 text-sky-400">{item.end.toFixed(2)}s</td>
                      <td className="py-1 px-2 text-neutral-400">{duration.toFixed(2)}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
