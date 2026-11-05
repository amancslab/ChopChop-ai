import { describe, it, expect } from 'vitest';
import {
  formatAssTime,
  generateAssContent,
  ASS_COLOR_MAP,
  ASS_FONT_SIZES,
} from '../../../src/utils/assGenerator';
import { SubtitleWord } from '../../../src/types';

describe('ASS Subtitle Generator Utility', () => {
  describe('formatAssTime', () => {
    it('formats 0 seconds properly into H:MM:SS.cs', () => {
      expect(formatAssTime(0)).toBe('0:00:00.00');
    });

    it('formats fractional seconds into centiseconds', () => {
      expect(formatAssTime(1.25)).toBe('0:00:01.25');
      expect(formatAssTime(12.5)).toBe('0:00:12.50');
    });

    it('formats minutes and hours properly', () => {
      expect(formatAssTime(65.4)).toBe('0:01:05.40');
      expect(formatAssTime(3661.05)).toBe('1:01:01.05');
    });

    it('caps centiseconds below 100', () => {
      const res = formatAssTime(0.999);
      expect(res).toBe('0:00:01.00');
    });
  });

  describe('generateAssContent', () => {
    it('generates standard ASS headers even when word list is empty', () => {
      const ass = generateAssContent([]);
      expect(ass).toContain('[Script Info]');
      expect(ass).toContain('PlayResX: 1080');
      expect(ass).toContain('PlayResY: 1920');
      expect(ass).toContain('[V4+ Styles]');
      expect(ass).toContain('[Events]');
    });

    it('generates dialogue events with color highlights for word-level karaoke', () => {
      const words: SubtitleWord[] = [
        { word: 'large', start: 0.1, end: 0.4 },
        { word: 'language', start: 0.4, end: 0.8 },
        { word: 'models', start: 0.8, end: 1.2 },
      ];

      const ass = generateAssContent(words, 'Medium', 'Yellow', 3);
      expect(ass).toContain('Dialogue: 0,0:00:00.10,0:00:00.40,Default,,0,0,0,,{\\c&H0015CCFA&}LARGE{\\c&H00FFFFFF&} LANGUAGE MODELS');
      expect(ass).toContain('Dialogue: 0,0:00:00.40,0:00:00.80,Default,,0,0,0,,LARGE {\\c&H0015CCFA&}LANGUAGE{\\c&H00FFFFFF&} MODELS');
    });

    it('respects chosen font size and vertical margin', () => {
      const words: SubtitleWord[] = [{ word: 'test', start: 0, end: 1 }];
      const assLarge = generateAssContent(words, 'Large', 'Yellow', 3);
      expect(assLarge).toContain(String(ASS_FONT_SIZES.Large.size));
      expect(assLarge).toContain(String(ASS_FONT_SIZES.Large.marginV));
    });

    it('supports all specified color palettes', () => {
      const words: SubtitleWord[] = [{ word: 'color', start: 0, end: 1 }];
      const assGreen = generateAssContent(words, 'Medium', 'Green', 3);
      expect(assGreen).toContain(ASS_COLOR_MAP.Green.ass);

      const assCyan = generateAssContent(words, 'Medium', 'Cyan', 3);
      expect(assCyan).toContain(ASS_COLOR_MAP.Cyan.ass);

      const assRed = generateAssContent(words, 'Medium', 'Red', 3);
      expect(assRed).toContain(ASS_COLOR_MAP.Red.ass);
    });
  });
});
