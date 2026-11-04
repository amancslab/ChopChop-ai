export type AspectRatioType = '9:16' | '1:1' | '16:9';
export type FontSizeChoice = 'Small' | 'Medium' | 'Large';
export type HighlightColorChoice = 'Yellow' | 'Green' | 'Cyan' | 'Red';

export interface SubtitleWord {
  word: string;
  start: number; // in seconds relative to clip start
  end: number;
}

export interface ViralSegment {
  id?: string;
  title: string;
  hook: string;
  start_time: string;
  end_time: string;
  virality_score: number;
  reason: string;
  category?: string;
  words?: SubtitleWord[];
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
  authenticated: boolean;
}

export interface VideoPreset {
  id: string;
  title: string;
  creator: string;
  category: string;
  youtubeUrl: string;
  startTime: string;
  endTime: string;
  videoSrc: string;
  thumbnail: string;
  totalDurationFormatted: string;
  totalDurationSeconds: number;
  views: string;
  transcriptWords: SubtitleWord[];
  suggestedViralSegments?: ViralSegment[];
}

export interface CaptionConfig {
  burnCaptions: boolean;
  fontSize: FontSizeChoice;
  highlightColor: HighlightColorChoice;
  wordsPerScreen: number;
  fontFamily?: string;
  showBorder?: boolean;
}

export type PipelineStage = 
  | 'idle' 
  | 'downloading' 
  | 'cropping' 
  | 'transcribing' 
  | 'generating_ass' 
  | 'burning' 
  | 'completed' 
  | 'error';

export interface DesignToken {
  name: string;
  value: string;
  variable: string;
  role: string;
  description: string;
}
