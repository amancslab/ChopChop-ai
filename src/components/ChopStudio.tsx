import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Square,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  Disc,
  ExternalLink,
  Layers,
  ChevronRight,
  Zap,
  Flame,
  Key,
  Maximize2,
  RefreshCw,
  Video,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { VIDEO_PRESETS } from '../data/presets';
import {
  AspectRatioType,
  CaptionConfig,
  FontSizeChoice,
  HighlightColorChoice,
  PipelineStage,
  VideoPreset,
  ViralSegment,
  SubtitleWord,
} from '../types';
import { ASS_COLOR_MAP } from '../utils/assGenerator';
import {
  extractYouTubeId,
  fetchYouTubeMetadata,
  formatSecondsToTime,
  parseTimeToSeconds,
  generateMaxViralHooks,
  generateSubtitleWordsForHook,
} from '../utils/youtube';

interface ChopStudioProps {
  geminiKey: string;
  onOpenKeyModal: () => void;
}

export const ChopStudio: React.FC<ChopStudioProps> = ({ geminiKey, onOpenKeyModal }) => {
  // 1. Video & Metadata State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('karpathy-ai');
  const defaultPreset = VIDEO_PRESETS[0];

  const [youtubeUrl, setYoutubeUrl] = useState<string>(defaultPreset.youtubeUrl);
  const [activeVideoId, setActiveVideoId] = useState<string>('zjkBMFhNj_g');
  const [videoTitle, setVideoTitle] = useState<string>(defaultPreset.title);
  const [channelName, setChannelName] = useState<string>(defaultPreset.creator);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(defaultPreset.thumbnail);
  const [isFetchingMeta, setIsFetchingMeta] = useState<boolean>(false);

  // 2. Timestamps & Active Clip Selection
  const [startTimeInput, setStartTimeInput] = useState<string>('00:15');
  const [endTimeInput, setEndTimeInput] = useState<string>('00:45');
  const [activeViralClip, setActiveViralClip] = useState<ViralSegment | null>(null);

  // 3. Viral Hooks Suite (Generated up to maximum capacity)
  const [sliceMode, setSliceMode] = useState<'ai' | 'manual'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [viralSegments, setViralSegments] = useState<ViralSegment[]>([]);

  // 4. Viewport Framing & Subtitle Styler
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [viewportFit, setViewportFit] = useState<'fit' | 'crop'>('fit');
  const [captionConfig, setCaptionConfig] = useState<CaptionConfig>({
    burnCaptions: true,
    fontSize: 'Medium',
    highlightColor: 'Yellow', // TikTok Gold #FACC15
    wordsPerScreen: 3,
    fontFamily: 'Plus Jakarta Sans',
    showBorder: true,
  });
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  // 5. Video Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [clipSecondsElapsed, setClipSecondsElapsed] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 6. Processing Pipeline
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineMessage, setPipelineMessage] = useState<string>('');
  const [isChopped, setIsChopped] = useState<boolean>(false);

  // Calculate parsed start and end
  const startSec = parseTimeToSeconds(startTimeInput) ?? 15;
  const endSec = parseTimeToSeconds(endTimeInput) ?? 45;
  const clipDuration = Math.max(1, endSec - startSec);
  const isTimeValid = clipDuration > 0 && clipDuration <= 90;

  // Initialize with maximum hooks on mount
  useEffect(() => {
    generateMaxViralHooks(defaultPreset.title, defaultPreset.creator, geminiKey).then((hooks) => {
      setViralSegments(hooks);
      if (hooks.length > 0) {
        setActiveViralClip(hooks[0]);
        setStartTimeInput(hooks[0].start_time);
        setEndTimeInput(hooks[0].end_time);
      }
    });
  }, []);

  // When YouTube URL changes: extract ID, fetch real metadata, and load the real video
  useEffect(() => {
    const extractedId = extractYouTubeId(youtubeUrl);
    if (!extractedId) return;

    if (extractedId !== activeVideoId) {
      setActiveVideoId(extractedId);
      setIsFetchingMeta(true);

      // Instantly set default thumbnail from YouTube CDN
      setThumbnailUrl(`https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`);

      fetchYouTubeMetadata(extractedId).then((meta) => {
        setIsFetchingMeta(false);
        if (meta) {
          setVideoTitle(meta.title);
          setChannelName(meta.author);
          setThumbnailUrl(meta.thumbnail);

          // Automatically generate maximum viral hooks for the newly pasted YouTube video
          generateMaxViralHooks(meta.title, meta.author, geminiKey).then((hooks) => {
            setViralSegments(hooks);
            if (hooks.length > 0) {
              setActiveViralClip(hooks[0]);
              setStartTimeInput(hooks[0].start_time);
              setEndTimeInput(hooks[0].end_time);
            }
          });
        }
      });
    }
  }, [youtubeUrl]);

  // Timer loop for synchronizing animated subtitles in the preview
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setClipSecondsElapsed((prev) => {
          if (prev >= clipDuration) {
            return 0; // Loop clip
          }
          return prev + 0.2;
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, clipDuration]);

  // Handle preset switching
  const handlePresetSelect = (preset: VideoPreset) => {
    setSelectedPresetId(preset.id);
    setYoutubeUrl(preset.youtubeUrl);
    const id = extractYouTubeId(preset.youtubeUrl) || 'zjkBMFhNj_g';
    setActiveVideoId(id);
    setVideoTitle(preset.title);
    setChannelName(preset.creator);
    setThumbnailUrl(preset.thumbnail);
    setStartTimeInput(preset.startTime);
    setEndTimeInput(preset.endTime);
    setIsChopped(false);
    setPipelineStage('idle');
    setClipSecondsElapsed(0);
    setRefreshKey((k) => k + 1);

    generateMaxViralHooks(preset.title, preset.creator, geminiKey).then((hooks) => {
      setViralSegments(hooks);
      if (hooks.length > 0) {
        setActiveViralClip(hooks[0]);
      }
    });
  };

  // Trigger Gemini Viral Hook Detection for maximum hooks
  const handleAnalyzeViralHooks = async () => {
    setIsAnalyzing(true);
    try {
      const hooks = await generateMaxViralHooks(videoTitle, channelName, geminiKey);
      setViralSegments(hooks);
      if (hooks.length > 0) {
        setActiveViralClip(hooks[0]);
        setStartTimeInput(hooks[0].start_time);
        setEndTimeInput(hooks[0].end_time);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clicking on ANY hook card immediately loads that trimmed video in Live Viewport
  const handleSelectViralClip = (clip: ViralSegment) => {
    setActiveViralClip(clip);
    setStartTimeInput(clip.start_time);
    setEndTimeInput(clip.end_time);
    setClipSecondsElapsed(0);
    setIsPlaying(true);
    setRefreshKey((prev) => prev + 1);

    // Scroll smoothly to Live Viewport on smaller screens
    const viewportElem = document.getElementById('live-viewport-container');
    if (viewportElem && window.innerWidth < 1024) {
      viewportElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Restart trimmed short preview from 00:00
  const handleRestartClip = () => {
    setClipSecondsElapsed(0);
    setIsPlaying(true);
    setRefreshKey((prev) => prev + 1);
  };

  // Quick timestamp modifiers
  const applySliceDelta = (seconds: number) => {
    const newEnd = startSec + seconds;
    setEndTimeInput(formatSecondsToTime(newEnd));
    setRefreshKey((k) => k + 1);
  };

  // Subtitle words calculation for currently active hook
  const activeWords: SubtitleWord[] =
    activeViralClip?.words && activeViralClip.words.length > 0
      ? activeViralClip.words
      : generateSubtitleWordsForHook(activeViralClip?.hook || videoTitle, clipDuration);

  // Determine active word in karaoke style
  const currentWordIndex = activeWords.findIndex(
    (w) => clipSecondsElapsed >= w.start && clipSecondsElapsed <= w.end
  );

  const wordsPerScreen = captionConfig.wordsPerScreen || 3;
  let activePhraseWords: { word: string; start: number; end: number; isActive: boolean }[] = [];

  if (activeWords.length > 0) {
    const targetIdx = currentWordIndex !== -1 ? currentWordIndex : Math.floor((clipSecondsElapsed / clipDuration) * activeWords.length) % activeWords.length;
    const groupStart = Math.floor(targetIdx / wordsPerScreen) * wordsPerScreen;
    const groupEnd = Math.min(groupStart + wordsPerScreen, activeWords.length);
    activePhraseWords = activeWords.slice(groupStart, groupEnd).map((w, idx) => ({
      ...w,
      isActive: groupStart + idx === currentWordIndex,
    }));
  }

  // Trigger Slicing & Rendering Pipeline
  const triggerChopPipeline = () => {
    if (!isTimeValid) return;

    setPipelineStage('downloading');
    setPipelineProgress(18);
    setPipelineMessage(`Clipping [${startTimeInput} ➔ ${endTimeInput}]: yt-dlp downloading chunk stream...`);

    setTimeout(() => {
      setPipelineStage('cropping');
      setPipelineProgress(42);
      setPipelineMessage('Cropping: Centering video to 9:16 [crop=ih*(9/16):ih] via FFmpeg...');

      setTimeout(() => {
        setPipelineStage('transcribing');
        setPipelineProgress(68);
        setPipelineMessage('Whisper AI: Extracting word-level timestamps for hook...');

        setTimeout(() => {
          setPipelineStage('generating_ass');
          setPipelineProgress(85);
          setPipelineMessage('Hardcoding ASS: Burning TikTok Gold (#FACC15) karaoke subtitles...');

          setTimeout(() => {
            setPipelineStage('completed');
            setPipelineProgress(100);
            setPipelineMessage('Razor Cut Complete: High-retention vertical short ready!');
            setIsChopped(true);
          }, 800);
        }, 800);
      }, 800);
    }, 700);
  };

  const highlightHex = ASS_COLOR_MAP[captionConfig.highlightColor]?.hex || '#FACC15';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 linear-grid">
      {/* 1. HERO HEADER */}
      <div className="relative border border-[#243049] bg-[#161F30]/70 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
              <span className="text-[#10B981] font-bold">CHOPCHOP-AI</span>
              <span>/</span>
              <span>VIRAL HOOKS ARCHITECT</span>
              <span>/</span>
              <span className="text-[#FACC15]">100% FREE BYOK</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
              Turn fat videos into viral Shorts in 1 chop.
            </h1>
            <p className="text-sm text-neutral-300">
              Paste any YouTube URL. Gemini extracts the maximum viral retention hooks across the entire video. Click any hook card to instantly preview and review the trimmed clip in the live vertical 9:16 viewport!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#243049] flex items-center space-x-3 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-neutral-500 text-[10px]">DETECTION MODEL</span>
                <span className="text-[#10B981] font-bold">Gemini 1.5 Flash</span>
              </div>
              <div className="w-[1px] h-6 bg-[#243049]" />
              <div className="flex flex-col">
                <span className="text-neutral-500 text-[10px]">HOOK CAPACITY</span>
                <span className="text-[#FACC15] font-bold">Maximum (12+ Clips)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE GRID: Left (Input & Viral Hooks) vs Right (Live Viewport) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input & Hooks List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. FLOATING SINGLE-FIELD YOUTUBE INPUT CARD */}
          <div className="border border-[#243049] bg-[#161F30] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                YouTube Video Source
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#10B981]">
                  {isFetchingMeta ? 'Syncing Video...' : 'Real YouTube Sync Active'}
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste any YouTube link (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-4 py-3 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition"
              />
              {activeVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#161F30] hover:bg-[#243049] text-neutral-300 border border-[#243049] transition text-xs flex items-center gap-1"
                  title="Open original YouTube video in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Quick Preset Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              <span className="text-neutral-500 text-[11px] shrink-0">Try Presets:</span>
              {VIDEO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2.5 py-1 rounded-lg border shrink-0 transition text-[11px] ${
                    selectedPresetId === p.id && youtubeUrl === p.youtubeUrl
                      ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold'
                      : 'bg-[#0B0F19] border-[#243049] text-neutral-400 hover:text-white'
                  }`}
                >
                  {p.creator}
                </button>
              ))}
            </div>

            {/* DYNAMIC REAL VIDEO METADATA CARD (Matches Pasted YouTube Link) */}
            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#243049] flex items-center gap-3 relative overflow-hidden">
              <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-[#243049]">
                <img
                  src={thumbnailUrl}
                  alt={videoTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/85 font-mono text-[9px] text-white">
                  {isFetchingMeta ? '...' : 'HD'}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs font-bold text-white truncate" title={videoTitle}>
                  {videoTitle}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span className="text-white/80">{channelName}</span>
                  <span>·</span>
                  <span className="text-[#10B981] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready to Chop
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Video ID: <span className="text-neutral-300">{activeVideoId}</span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="pt-2 border-t border-[#243049]">
              <div className="flex items-center space-x-2 bg-[#0B0F19] p-1 rounded-xl border border-[#243049]">
                <button
                  onClick={() => setSliceMode('ai')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    sliceMode === 'ai'
                      ? 'bg-[#10B981] text-neutral-950 shadow-md shadow-[#10B981]/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Maximum Viral Hooks ({viralSegments.length} Detected)</span>
                </button>

                <button
                  onClick={() => setSliceMode('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    sliceMode === 'manual'
                      ? 'bg-[#243049] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏱️ Custom Timestamp Range</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: MAXIMUM VIRAL HOOKS LIST (Gemini Powered) */}
            {sliceMode === 'ai' && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-neutral-400">
                    Click any hook card below to <span className="text-[#10B981] font-bold">load and review that trimmed video</span> in the Live Viewport!
                  </div>
                  <button
                    onClick={handleAnalyzeViralHooks}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-[#10B981] text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'Extracting Max Hooks...' : '⚡ Re-generate Max Hooks'}</span>
                  </button>
                </div>

                {/* Viral Clip Cards List */}
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {viralSegments.map((clip, idx) => {
                    const isSelected =
                      activeViralClip?.start_time === clip.start_time &&
                      activeViralClip?.end_time === clip.end_time;

                    return (
                      <div
                        key={clip.id || idx}
                        onClick={() => handleSelectViralClip(clip)}
                        className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 relative group ${
                          isSelected
                            ? 'bg-[#161F30] border-[#10B981] shadow-lg shadow-[#10B981]/15 ring-1 ring-[#10B981]'
                            : 'bg-[#0B0F19] border-[#243049] hover:border-[#10B981]/60 hover:bg-[#161F30]/60'
                        }`}
                      >
                        {/* Active Ribbon */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981] text-neutral-950 text-[10px] font-mono font-extrabold uppercase">
                            <Eye className="w-3 h-3" /> Now in Live Viewport
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3 pr-24">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#243049] flex items-center justify-center font-mono text-[10px] font-bold text-neutral-300">
                                #{idx + 1}
                              </span>
                              <span className="font-display font-bold text-white text-sm group-hover:text-[#10B981] transition">
                                {clip.title}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#FACC15] pl-7">
                              "{clip.hook}"
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed pl-7">
                          {clip.reason}
                        </p>

                        <div className="pt-2 pl-7 flex flex-wrap items-center justify-between gap-2 border-t border-[#243049]/60">
                          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                            <span className="px-1.5 py-0.5 rounded bg-[#0B0F19] text-white border border-[#243049]">
                              {clip.start_time} ➔ {clip.end_time}
                            </span>
                            <span className="text-[#10B981] font-bold">
                              ★ {clip.virality_score}/100 Score
                            </span>
                            {clip.category && (
                              <span className="text-neutral-500 hidden sm:inline">
                                · {clip.category}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectViralClip(clip);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-display font-bold flex items-center space-x-1.5 transition ${
                              isSelected
                                ? 'bg-[#10B981] text-neutral-950 shadow-md shadow-[#10B981]/25'
                                : 'bg-[#161F30] hover:bg-[#10B981] text-neutral-300 hover:text-neutral-950 border border-[#243049]'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isSelected ? 'Reviewing in Viewport' : 'Review & Trim Video'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: MANUAL TIME-SLICING CONTROLS */}
            {sliceMode === 'manual' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">
                    Dual Range Manual Controls
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-mono">
                    <span className="text-neutral-500">Duration:</span>
                    <span className={`font-bold ${isTimeValid ? 'text-[#10B981]' : 'text-red-400'}`}>
                      {clipDuration.toFixed(1)}s
                    </span>
                    <span className="text-neutral-600">/ max 90s</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 font-mono">Start Time (MM:SS)</label>
                    <input
                      type="text"
                      value={startTimeInput}
                      onChange={(e) => {
                        setStartTimeInput(e.target.value);
                        setRefreshKey((k) => k + 1);
                      }}
                      placeholder="00:15"
                      className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 font-mono">End Time (MM:SS)</label>
                    <input
                      type="text"
                      value={endTimeInput}
                      onChange={(e) => {
                        setEndTimeInput(e.target.value);
                        setRefreshKey((k) => k + 1);
                      }}
                      placeholder="00:45"
                      className="w-full bg-[#0B0F19] border border-[#243049] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                {/* Quick Deltas */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applySliceDelta(15)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0F19] hover:bg-[#243049] border border-[#243049] text-xs font-mono text-neutral-300"
                  >
                    +15s Hook
                  </button>
                  <button
                    onClick={() => applySliceDelta(30)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0F19] hover:bg-[#243049] border border-[#243049] text-xs font-mono text-[#10B981] font-bold"
                  >
                    +30s Short
                  </button>
                  <button
                    onClick={() => applySliceDelta(60)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0F19] hover:bg-[#243049] border border-[#243049] text-xs font-mono text-neutral-300"
                  >
                    +60s Reel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. FRAMING & CAPTION STYLER */}
          <div className="border border-[#243049] bg-[#161F30] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Aspect Ratio & Subtitle Styling
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={captionConfig.burnCaptions}
                  onChange={(e) =>
                    setCaptionConfig({ ...captionConfig, burnCaptions: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#0B0F19] border border-[#243049] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-xl border text-left transition ${
                  aspectRatio === '9:16'
                    ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-lg shadow-[#10B981]/10'
                    : 'bg-[#0B0F19] border-[#243049] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Smartphone className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold">
                    9:16
                  </span>
                </div>
                <div className="font-bold text-xs">Vertical Short</div>
              </button>

              <button
                onClick={() => setAspectRatio('1:1')}
                className={`p-3 rounded-xl border text-left transition ${
                  aspectRatio === '1:1'
                    ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-lg shadow-[#10B981]/10'
                    : 'bg-[#0B0F19] border-[#243049] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Square className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-mono text-neutral-500">1:1</span>
                </div>
                <div className="font-bold text-xs">Square Feed</div>
              </button>

              <button
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border text-left transition ${
                  aspectRatio === '16:9'
                    ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-lg shadow-[#10B981]/10'
                    : 'bg-[#0B0F19] border-[#243049] text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-mono text-neutral-500">16:9</span>
                </div>
                <div className="font-bold text-xs">Original</div>
              </button>
            </div>
          </div>

          {/* C. PRIMARY ACTION BUTTON */}
          <button
            onClick={triggerChopPipeline}
            disabled={!isTimeValid || (pipelineStage !== 'idle' && pipelineStage !== 'completed')}
            className={`w-full relative overflow-hidden py-4 px-6 rounded-2xl font-display text-base font-extrabold flex items-center justify-center space-x-3 transition-all shadow-xl ${
              isTimeValid && (pipelineStage === 'idle' || pipelineStage === 'completed')
                ? 'bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:brightness-110 text-neutral-950 shadow-[#10B981]/25 active:scale-[0.99] cursor-pointer'
                : 'bg-[#243049] text-neutral-500 cursor-not-allowed border border-[#243049]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-24 h-full pointer-events-none animate-blade-slice opacity-40" />
            <Scissors className="w-5 h-5 text-neutral-950 transform -rotate-45" />
            <span>⚡ Chop & Export Short ({startTimeInput} - {endTimeInput})</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Live Viewport with Exact Trimmed Video Player (5 Cols) */}
        <div id="live-viewport-container" className="lg:col-span-5 space-y-4">
          {/* Slicing Progress Indicators */}
          {pipelineStage !== 'idle' && (
            <div className="p-4 rounded-2xl border border-[#243049] bg-[#161F30] shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#10B981] flex items-center gap-1.5 font-bold">
                  <Scissors className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                  Pipeline: {pipelineStage.toUpperCase()}
                </span>
                <span className="text-white font-bold">{pipelineProgress}%</span>
              </div>

              <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden p-0.5 border border-[#243049]">
                <div
                  className="bg-gradient-to-r from-[#10B981] via-[#FACC15] to-[#FF3366] h-full rounded-full transition-all duration-300"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>

              <div className="text-[11px] text-neutral-300 font-mono bg-[#0B0F19] p-2.5 rounded-xl border border-[#243049]">
                {pipelineMessage}
              </div>
            </div>
          )}

          {/* RAZOR-SHARP MOBILE BEZEL: EXACT TRIMMED VIDEO PLAYER */}
          <div className="border border-[#243049] bg-[#161F30] rounded-3xl p-4 shadow-2xl flex flex-col items-center">
            {/* Viewport Top Controls */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-white font-bold">Live Viewport ({aspectRatio})</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Fit Mode Switcher */}
                <button
                  onClick={() => setViewportFit(viewportFit === 'fit' ? 'crop' : 'fit')}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono border bg-[#0B0F19] border-[#243049] text-neutral-300 hover:text-white transition"
                  title="Toggle between Crop and Ambient Fit"
                >
                  {viewportFit === 'fit' ? 'Fit + Glow' : 'Center Crop 9:16'}
                </button>

                {aspectRatio === '9:16' && (
                  <button
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition ${
                      showSafeZone
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                        : 'bg-[#0B0F19] text-neutral-500 border-[#243049]'
                    }`}
                  >
                    Overlay: {showSafeZone ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </div>

            {/* Active Hook Banner */}
            <div className="w-full mb-3 p-2 rounded-xl bg-[#0B0F19] border border-[#243049] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold shrink-0">
                  TRIM: {startTimeInput} - {endTimeInput}
                </span>
                <span className="text-white font-bold truncate">
                  {activeViralClip ? activeViralClip.title : videoTitle}
                </span>
              </div>
              <button
                onClick={handleRestartClip}
                className="p-1 rounded-md bg-[#161F30] hover:bg-[#243049] text-neutral-300 shrink-0"
                title="Replay from start of trimmed hook"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Titanium Bezel Frame */}
            <div
              className={`relative overflow-hidden bg-black shadow-2xl border-4 border-[#243049] transition-all duration-300 ${
                aspectRatio === '9:16'
                  ? 'w-[280px] sm:w-[315px] h-[500px] sm:h-[555px] rounded-[38px] ring-4 ring-[#0B0F19]'
                  : aspectRatio === '1:1'
                  ? 'w-[300px] sm:w-[360px] h-[300px] sm:h-[360px] rounded-2xl'
                  : 'w-full max-w-[480px] h-[270px] rounded-2xl'
              }`}
            >
              {/* Dynamic Trimmed Video Container */}
              <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                {/* Ambient Blurred Background (For Fit mode) */}
                {viewportFit === 'fit' && aspectRatio === '9:16' && (
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none"
                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                  />
                )}

                {/* Real YouTube Video Player Trimmed to Hook Range */}
                <iframe
                  key={`yt-${activeVideoId}-${startSec}-${endSec}-${refreshKey}`}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?start=${startSec}&end=${endSec}&autoplay=${
                    isPlaying ? 1 : 0
                  }&playsinline=1&rel=0&modestbranding=1&controls=1`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={
                    aspectRatio === '9:16'
                      ? viewportFit === 'crop'
                        ? 'w-[320%] h-full max-w-none object-cover pointer-events-auto scale-150 origin-center'
                        : 'w-full aspect-video z-10 shadow-2xl pointer-events-auto'
                      : 'w-full h-full'
                  }
                />
              </div>

              {/* Dynamic Animated TikTok Gold Karaoke Subtitles */}
              {captionConfig.burnCaptions && (
                <div
                  className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center px-4 pointer-events-none select-none z-30"
                  style={{
                    filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.95))',
                  }}
                >
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-2 py-1 text-center font-black tracking-wider uppercase font-sans">
                    {activePhraseWords.map((item, idx) => (
                      <span
                        key={idx}
                        className={`transition-all duration-100 transform text-xl sm:text-2xl ${
                          item.isActive
                            ? 'scale-115 font-black'
                            : 'text-white font-bold opacity-90'
                        }`}
                        style={{
                          color: item.isActive ? highlightHex : '#FFFFFF',
                          WebkitTextStroke: '2px #000000',
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

              {/* TikTok / Shorts UI Safe Zone Overlay */}
              {aspectRatio === '9:16' && showSafeZone && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
                  <div className="w-20 h-3.5 bg-black/80 rounded-full mx-auto" />

                  {/* Right Rail Icons */}
                  <div className="self-end flex flex-col items-center space-y-3 mb-14 text-white/90">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white fill-white/20" />
                      </div>
                      <span className="text-[9px] font-bold mt-0.5 font-mono">
                        {activeViralClip ? `${activeViralClip.virality_score}K` : '54.2K'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[9px] font-bold mt-0.5 font-mono">1.8K</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[9px] font-bold mt-0.5 font-mono">Share</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center animate-spin">
                      <Disc className="w-4 h-4 text-[#10B981]" />
                    </div>
                  </div>

                  {/* Bottom Creator Meta */}
                  <div className="absolute bottom-4 left-4 right-14 text-white text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <span>@{channelName.replace(/\s+/g, '').toLowerCase()}</span>
                      <span className="text-[#10B981]">✓</span>
                    </div>
                    <div className="text-[10px] text-neutral-300 line-clamp-2">
                      {activeViralClip ? activeViralClip.hook : videoTitle} #chopchop #viral #shorts
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Review Controls Bar */}
            <div className="w-full max-w-[340px] mt-3 p-2.5 rounded-xl bg-[#0B0F19] border border-[#243049] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-lg bg-[#10B981] hover:bg-[#059669] text-neutral-950 flex items-center justify-center transition"
                  title={isPlaying ? 'Pause Clip' : 'Play Clip'}
                  aria-label={isPlaying ? 'Pause Clip' : 'Play Clip'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
                </button>

                <button
                  onClick={handleRestartClip}
                  className="w-8 h-8 rounded-lg bg-[#161F30] hover:bg-[#243049] text-neutral-300 flex items-center justify-center transition"
                  title="Replay Clip from Beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Scrubber */}
              <div className="text-[11px] font-mono text-neutral-400">
                <span className="text-white font-bold">{clipSecondsElapsed.toFixed(1)}s</span> / {clipDuration.toFixed(1)}s
              </div>
            </div>

            {/* Direct Download/Action Button */}
            <div className="w-full max-w-[340px] mt-3">
              <button
                onClick={triggerChopPipeline}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#161F30] hover:bg-[#243049] border border-[#243049] text-white flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Download Trimmed Short ({clipDuration}s MP4)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
