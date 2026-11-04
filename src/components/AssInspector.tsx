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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <FileCode className="w-4 h-4" />
          <span>Advanced SubStation Alpha (ASS) Engine</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Word-Level Subtitle Script Inspector & Exporter
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          FFmpeg reads this exact <code className="text-amber-400 font-mono">.ass</code> file to hardcode the high-retention subtitles. The format controls pixel-accurate font sizing, center-bottom alignment (Alignment 2), black outline borders, and word-by-word color highlight tags (<code className="text-emerald-400 font-mono">{`{\\c&H00...&}`}</code>).
        </p>
      </div>

      {/* Controls Bar */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sample selection */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-semibold">Transcript Preset</label>
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
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
          <label className="text-xs text-neutral-400 font-semibold">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as FontSizeChoice)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="Small">Small (48pt, MarginV: 220)</option>
            <option value="Medium">Medium (60pt, MarginV: 240)</option>
            <option value="Large">Large (74pt, MarginV: 260)</option>
          </select>
        </div>

        {/* Highlight Color */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-semibold">Highlight Color</label>
          <select
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value as HighlightColorChoice)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="Yellow">Yellow (BGR: &H0000FFFF&)</option>
            <option value="Green">Neon Green (BGR: &H0000FF00&)</option>
            <option value="Cyan">Cyber Cyan (BGR: &H00FFFF00&)</option>
            <option value="Pink">Hot Pink (BGR: &H00FF00FF&)</option>
          </select>
        </div>

        {/* Words per Screen */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-semibold">
            Words Per Screen: <span className="text-red-400">{wordsPerLine} words</span>
          </label>
          <input
            type="range"
            min="2"
            max="5"
            value={wordsPerLine}
            onChange={(e) => setWordsPerLine(Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500 mt-2"
          />
        </div>
      </div>

      {/* Code Viewer & Word Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ASS Raw Content (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Generated .ASS Script
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Script'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ASS</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 max-h-[520px] overflow-y-auto overflow-x-auto shadow-inner leading-relaxed">
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
                        ? 'text-amber-400 font-bold'
                        : isStyle
                        ? 'text-purple-400'
                        : isDialogue
                        ? 'text-neutral-200 hover:bg-neutral-900/60 rounded px-1'
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
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Whisper Word Timestamps ({preset.transcriptWords.length} words)
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-neutral-500 border-b border-neutral-800 pb-2">
                <tr>
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Word</th>
                  <th className="py-1.5 px-2">Start</th>
                  <th className="py-1.5 px-2">End</th>
                  <th className="py-1.5 px-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {preset.transcriptWords.map((item, idx) => {
                  const duration = item.end - item.start;
                  return (
                    <tr key={idx} className="hover:bg-neutral-800/40 transition">
                      <td className="py-1 px-2 text-neutral-500">{idx + 1}</td>
                      <td className="py-1 px-2 font-bold text-white uppercase">{item.word}</td>
                      <td className="py-1 px-2 text-emerald-400">{item.start.toFixed(2)}s</td>
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
