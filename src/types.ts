export type AspectRatioType = '9:16' | '1:1' | '16:9';
export type FontSizeChoice = 'Small' | 'Medium' | 'Large';
export type HighlightColorChoice = 'Yellow' | 'Green' | 'Cyan' | 'Pink';

export interface SubtitleWord {
  word: string;
  start: number; // in seconds relative to clip start
  end: number;
}

export interface VideoPreset {
  id: string;
  title: string;
  creator: string;
  category: string;
  youtubeUrl: string;
  startTime: string;
  endTime: string;
  videoSrc: string; // Reliable HTML5 video clip for in-browser playback
  transcriptWords: SubtitleWord[];
}

export interface CaptionConfig {
  burnCaptions: boolean;
  fontSize: FontSizeChoice;
  highlightColor: HighlightColorChoice;
  wordsPerScreen: number;
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
