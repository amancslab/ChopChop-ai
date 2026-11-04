import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Smartphone,
  Square,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  Disc,
  Clock,
  Terminal,
} from 'lucide-react';
import { VIDEO_PRESETS } from '../data/presets';
import {
  AspectRatioType,
  CaptionConfig,
  FontSizeChoice,
  HighlightColorChoice,
  PipelineStage,
  VideoPreset,
} from '../types';
import { ASS_COLOR_MAP } from '../utils/assGenerator';

export const ShortsStudio: React.FC = () => {
  // Preset & Video State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('karpathy-ai');
  const currentPreset: VideoPreset =
    VIDEO_PRESETS.find((p) => p.id === selectedPresetId) || VIDEO_PRESETS[0];

  const [youtubeUrl, setYoutubeUrl] = useState<string>(currentPreset.youtubeUrl);
  const [startTimeInput, setStartTimeInput] = useState<string>(currentPreset.startTime);
  const [endTimeInput, setEndTimeInput] = useState<string>(currentPreset.endTime);

  // Framing & Caption Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [captionConfig, setCaptionConfig] = useState<CaptionConfig>({
    burnCaptions: true,
    fontSize: 'Medium',
    highlightColor: 'Yellow',
    wordsPerScreen: 3,
  });

  // UI Helper Toggles
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showCliCommand, setShowCliCommand] = useState<boolean>(false);

  // Player State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Pipeline Execution State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineMessage, setPipelineMessage] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Time parsing helper
  const parseSeconds = (val: string): number | null => {
    if (!val || !val.trim()) return null;
    const clean = val.trim();
    if (!isNaN(Number(clean))) {
      const num = Number(clean);
      return num >= 0 ? num : null;
    }
    const parts = clean.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts.map(Number);
      if (!isNaN(h) && !isNaN(m) && !isNaN(s)) return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const [m, s] = parts.map(Number);
      if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
    }
    return null;
  };

  const startSec = parseSeconds(startTimeInput);
  const endSec = parseSeconds(endTimeInput);
  const clipDuration = startSec !== null && endSec !== null ? endSec - startSec : null;
  const isTimeValid =
    startSec !== null &&
    endSec !== null &&
    clipDuration !== null &&
    clipDuration > 0 &&
    clipDuration <= 90;

  // Handle Preset Switching
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = VIDEO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setYoutubeUrl(found.youtubeUrl);
      setStartTimeInput(found.startTime);
      setEndTimeInput(found.endTime);
      setIsGenerated(false);
      setPipelineStage('idle');
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Synchronize video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Find active spoken word based on current playback time
  const currentSpokenWordIndex = currentPreset.transcriptWords.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Group transcript words for subtitle display
  const wordsPerScreen = captionConfig.wordsPerScreen || 3;
  let activePhraseWords: { word: string; start: number; end: number; isActive: boolean }[] = [];

  if (currentSpokenWordIndex !== -1) {
    const groupStart =
      Math.floor(currentSpokenWordIndex / wordsPerScreen) * wordsPerScreen;
    const groupEnd = Math.min(
      groupStart + wordsPerScreen,
      currentPreset.transcriptWords.length
    );
    activePhraseWords = currentPreset.transcriptWords
      .slice(groupStart, groupEnd)
      .map((w, idx) => ({
        ...w,
        isActive: groupStart + idx === currentSpokenWordIndex,
      }));
  } else {
    // If between words or before first word, show closest phrase
    const nearestIndex = currentPreset.transcriptWords.findIndex(
      (w) => w.start >= currentTime
    );
    const targetIdx = nearestIndex === -1 ? 0 : Math.max(0, nearestIndex - 1);
    const groupStart = Math.floor(targetIdx / wordsPerScreen) * wordsPerScreen;
    const groupEnd = Math.min(
      groupStart + wordsPerScreen,
      currentPreset.transcriptWords.length
    );
    activePhraseWords = currentPreset.transcriptWords
      .slice(groupStart, groupEnd)
      .map((w) => ({
        ...w,
        isActive: false,
      }));
  }

  // Pipeline Execution Simulator
  const startPipelineExecution = () => {
    if (!isTimeValid) return;
    setPipelineStage('downloading');
    setPipelineProgress(15);
    setPipelineMessage('Step 1/5: Extracting video stream with yt-dlp download_ranges hook...');

    setTimeout(() => {
      setPipelineStage('cropping');
      setPipelineProgress(38);
      setPipelineMessage(
        `Step 2/5: Applying FFmpeg center crop filter 'crop=ih*(9/16):ih' & scaling to 1080x1920...`
      );

      setTimeout(() => {
        setPipelineStage('transcribing');
        setPipelineProgress(62);
        setPipelineMessage(
          'Step 3/5: Loading faster-whisper base model & extracting word-level timestamps...'
        );

        setTimeout(() => {
          setPipelineStage('generating_ass');
          setPipelineProgress(80);
          setPipelineMessage(
            `Step 4/5: Generating Advanced SubStation Alpha (.ass) with ${captionConfig.highlightColor} highlight...`
          );

          setTimeout(() => {
            setPipelineStage('burning');
            setPipelineProgress(94);
            setPipelineMessage(
              "Step 5/5: Hardcoding ASS subtitles via FFmpeg 'ass=captions.ass' filter (H.264 / AAC)..."
            );

            setTimeout(() => {
              setPipelineStage('completed');
              setPipelineProgress(100);
              setPipelineMessage('Done! YouTube Short is compiled with zero audio drift.');
              setIsGenerated(true);
            }, 900);
          }, 800);
        }, 900);
      }, 900);
    }, 800);
  };

  // Font size styling
  const getFontSizeClass = () => {
    switch (captionConfig.fontSize) {
      case 'Small':
        return 'text-lg sm:text-xl';
      case 'Large':
        return 'text-2xl sm:text-3xl';
      case 'Medium':
      default:
        return 'text-xl sm:text-2xl';
    }
  };

  // Highlight color Hex
  const highlightHex = ASS_COLOR_MAP[captionConfig.highlightColor]?.hex || '#FFFF00';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-red-950/30 p-6 shadow-2xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                No-Cost AI Multimedia Pipeline
              </span>
              <span className="text-xs text-neutral-400">Streamlit • yt-dlp • FFmpeg • Whisper</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              YouTube to Vertical Shorts Repurposer
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Extract exact timestamp ranges from long-form YouTube videos, crop into vertical 9:16 framing, and burn dynamic word-by-word karaoke subtitles.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowCliCommand(!showCliCommand)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-neutral-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              <span>{showCliCommand ? 'Hide CLI Commands' : 'View Raw FFmpeg / CLI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw CLI Helper Drawer */}
      {showCliCommand && (
        <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2">
          <div className="text-red-400 font-bold flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            Underlying CLI Pipeline (yt-dlp + FFmpeg):
          </div>
          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-900 overflow-x-auto space-y-1">
            <div className="text-neutral-500"># 1. Download only the specific chunk:</div>
            <div className="text-emerald-400">
              yt-dlp --download-sections "*{startTimeInput}-{endTimeInput}" "{youtubeUrl}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" -o "segment.mp4"
            </div>
            <div className="text-neutral-500 mt-2"># 2. Crop 9:16 & burn ASS subtitles:</div>
            <div className="text-sky-400">
              ffmpeg -i segment.mp4 -vf "crop=ih*(9/16):ih,scale=1080:1920,ass='captions.ass'" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k final_short.mp4
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Controls (Left) vs Player & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset Selector */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-400" />
                Featured Test Clips
              </label>
              <span className="text-[11px] text-neutral-500">Quick-load demos</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {VIDEO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-red-500/10 border-red-500/40 text-white font-medium'
                      : 'bg-neutral-800/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-200">{preset.title}</div>
                    <div className="text-[10px] text-neutral-500">
                      {preset.creator} • {preset.category}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-red-400/90 bg-red-950/50 px-2 py-0.5 rounded-md border border-red-900/50">
                    {preset.startTime} - {preset.endTime}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Source & Range */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-xs">
                1
              </span>
              Source Video & Smart Range
            </h3>

            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium">YouTube Video URL</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Start and End Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-400" />
                  Start Time
                </label>
                <input
                  type="text"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  placeholder="00:15 or 15"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-400" />
                  End Time
                </label>
                <input
                  type="text"
                  value={endTimeInput}
                  onChange={(e) => setEndTimeInput(e.target.value)}
                  placeholder="00:45 or 45"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* Range Validation Display */}
            <div className="pt-1">
              {startSec === null || endSec === null ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Enter valid time strings like '00:15', '01:20:00', or raw seconds.</span>
                </div>
              ) : clipDuration !== null && clipDuration <= 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>End Time must be strictly greater than Start Time.</span>
                </div>
              ) : clipDuration !== null && clipDuration > 90 ? (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Duration ({clipDuration.toFixed(1)}s) exceeds max 90s for Shorts.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Duration: <strong>{clipDuration?.toFixed(1)}s</strong> (Valid Range)</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-300">
                    yt-dlp range stream active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Aspect Ratio & Framing */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-xs">
                2
              </span>
              Aspect Ratio & Framing
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  aspectRatio === '9:16'
                    ? 'bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold">9:16 Vertical</span>
                <span className="text-[10px] text-neutral-500">1080x1920 (Default)</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:1')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  aspectRatio === '1:1'
                    ? 'bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Square className="w-5 h-5" />
                <span className="text-xs font-bold">1:1 Square</span>
                <span className="text-[10px] text-neutral-500">1080x1080 Feed</span>
              </button>

              <button
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  aspectRatio === '16:9'
                    ? 'bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-bold">16:9 Landscape</span>
                <span className="text-[10px] text-neutral-500">Original Frame</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              *9:16 uses FFmpeg <code className="text-neutral-300 font-mono">crop=ih*(9/16):ih</code> to maintain focal speaker prominence.
            </p>
          </div>

          {/* Section 3: Subtitle Styling */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-xs">
                  3
                </span>
                Caption Styler Controls
              </h3>

              {/* Subtitle Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={captionConfig.burnCaptions}
                  onChange={(e) =>
                    setCaptionConfig({ ...captionConfig, burnCaptions: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {captionConfig.burnCaptions ? (
              <div className="space-y-3.5 pt-1">
                {/* Font Size & Words per line */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 font-medium">Font Size</label>
                    <select
                      value={captionConfig.fontSize}
                      onChange={(e) =>
                        setCaptionConfig({
                          ...captionConfig,
                          fontSize: e.target.value as FontSizeChoice,
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="Small">Small (48pt)</option>
                      <option value="Medium">Medium (60pt)</option>
                      <option value="Large">Large (74pt)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 font-medium">Highlight Color</label>
                    <select
                      value={captionConfig.highlightColor}
                      onChange={(e) =>
                        setCaptionConfig({
                          ...captionConfig,
                          highlightColor: e.target.value as HighlightColorChoice,
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="Yellow">Electric Yellow (#FFFF00)</option>
                      <option value="Green">Neon Green (#00FF66)</option>
                      <option value="Cyan">Cyber Cyan (#00FFFF)</option>
                      <option value="Pink">Hot Pink (#FF007F)</option>
                    </select>
                  </div>
                </div>

                {/* Color Swatches & Preview Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-400">Selected Color:</span>
                    <span
                      className="w-4 h-4 rounded-full ring-2 ring-white/20 shadow-sm"
                      style={{ backgroundColor: highlightHex }}
                    />
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {captionConfig.highlightColor}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    Word Karaoke On
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">
                Captions disabled. Clean video stream will be rendered without subtitles.
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={startPipelineExecution}
            disabled={!isTimeValid || pipelineStage !== 'idle' && pipelineStage !== 'completed'}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isTimeValid && (pipelineStage === 'idle' || pipelineStage === 'completed')
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30 active:scale-[0.99]'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>
              {pipelineStage === 'idle' || pipelineStage === 'completed'
                ? '🚀 Repurpose into Short'
                : 'Processing Pipeline...'}
            </span>
          </button>
        </div>

        {/* RIGHT COLUMN: Mobile Viewport & Output Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Progress Indicator Card */}
          {pipelineStage !== 'idle' && (
            <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-red-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-red-500" />
                  Processing Pipeline Status
                </span>
                <span className="font-mono text-white">{pipelineProgress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-neutral-700">
                <div
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>

              <div className="text-xs text-neutral-300 font-mono bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                {pipelineMessage}
              </div>
            </div>
          )}

          {/* Interactive Player Frame */}
          <div className="relative rounded-3xl border border-neutral-800 bg-neutral-950/80 p-4 shadow-2xl flex flex-col items-center">
            {/* Header controls inside player card */}
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-neutral-300">
                  Live Viewport Preview ({aspectRatio})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {aspectRatio === '9:16' && (
                  <button
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                      showSafeZone
                        ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                    }`}
                  >
                    TikTok/Shorts Overlay: {showSafeZone ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </div>

            {/* Video Container with Dynamic Aspect Framing */}
            <div
              className={`relative overflow-hidden bg-black shadow-2xl border border-neutral-800 transition-all duration-300 ${
                aspectRatio === '9:16'
                  ? 'w-[290px] sm:w-[320px] h-[515px] sm:h-[570px] rounded-[36px] ring-8 ring-neutral-900'
                  : aspectRatio === '1:1'
                  ? 'w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-2xl'
                  : 'w-full max-w-[560px] h-[315px] rounded-2xl'
              }`}
            >
              {/* Underlying Video */}
              <video
                ref={videoRef}
                src={currentPreset.videoSrc}
                loop
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover select-none"
              />

              {/* Dynamic Subtitle Overlay with Word-Level Karaoke Highlight */}
              {captionConfig.burnCaptions && (
                <div
                  className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center px-4 pointer-events-none select-none z-30"
                  style={{
                    filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.95))',
                  }}
                >
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 text-center font-black tracking-wider uppercase font-sans">
                    {activePhraseWords.map((item, idx) => (
                      <span
                        key={idx}
                        className={`transition-all duration-150 transform ${getFontSizeClass()} ${
                          item.isActive
                            ? 'scale-110 font-black'
                            : 'text-white font-bold opacity-90'
                        }`}
                        style={{
                          color: item.isActive ? highlightHex : '#FFFFFF',
                          WebkitTextStroke: '1.8px #000000',
                          textShadow:
                            '0 0 10px rgba(0,0,0,0.8), 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                        }}
                      >
                        {item.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Zone / UI Mockup for 9:16 */}
              {aspectRatio === '9:16' && showSafeZone && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
                  {/* Top bar mockup */}
                  <div className="flex justify-between items-center text-[10px] text-white/70 font-semibold pt-2 px-1">
                    <span>Subscriptions</span>
                    <span className="text-white font-bold border-b-2 border-white pb-0.5">
                      Shorts
                    </span>
                    <span>Search</span>
                  </div>

                  {/* Right Action Icons (Like, Comment, Share) */}
                  <div className="self-end flex flex-col items-center space-y-4 mb-16 text-white/90">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white fill-white/20" />
                      </div>
                      <span className="text-[10px] font-bold mt-1">24.5K</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold mt-1">842</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold mt-1">Share</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center animate-spin">
                      <Disc className="w-5 h-5 text-red-400" />
                    </div>
                  </div>

                  {/* Bottom Creator Title */}
                  <div className="absolute bottom-4 left-4 right-16 text-white text-xs space-y-1">
                    <div className="font-bold">@{currentPreset.creator.replace(/\s+/g, '').toLowerCase()}</div>
                    <div className="text-[11px] text-white/80 line-clamp-2">
                      {currentPreset.title} #viral #shorts #ai
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Playback Controls Bar */}
            <div className="w-full max-w-[500px] mt-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-md shadow-red-600/30"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs font-mono text-neutral-400">
                  <span className="text-white font-bold">{currentTime.toFixed(1)}s</span> / {duration.toFixed(1)}s
                </div>
              </div>

              {/* Scrubber */}
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  const targetTime = Number(e.target.value);
                  setCurrentTime(targetTime);
                  if (videoRef.current) videoRef.current.currentTime = targetTime;
                }}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Download Button (Active after generation or preview) */}
            <div className="w-full max-w-[500px] mt-3">
              <a
                href={currentPreset.videoSrc}
                download="repurposed_short_916.mp4"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white flex items-center justify-center space-x-2 transition shadow-md"
              >
                <Download className="w-4 h-4 text-red-400" />
                <span>Download Generated Short (1080x1920 MP4)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
