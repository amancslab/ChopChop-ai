import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractYouTubeId,
  formatSecondsToTime,
  parseTimeToSeconds,
  generateSubtitleWordsForHook,
  fetchYouTubeMetadata,
} from '../../../src/utils/youtube';

describe('YouTube Utility Functions', () => {
  describe('extractYouTubeId', () => {
    it('extracts ID from standard watch URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=zjkBMFhNj_g')).toBe('zjkBMFhNj_g');
    });

    it('extracts ID from shortened youtu.be URL', () => {
      expect(extractYouTubeId('https://youtu.be/zjkBMFhNj_g')).toBe('zjkBMFhNj_g');
    });

    it('extracts ID from YouTube Shorts URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/shorts/MVYrJJNdrEg')).toBe('MVYrJJNdrEg');
    });

    it('extracts ID from embed URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID when URL has additional query parameters like timestamps', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=zjkBMFhNj_g&t=45s&feature=shared')).toBe('zjkBMFhNj_g');
    });

    it('accepts raw 11-character video ID', () => {
      expect(extractYouTubeId('zjkBMFhNj_g')).toBe('zjkBMFhNj_g');
    });

    it('returns null for invalid or empty inputs', () => {
      expect(extractYouTubeId('')).toBeNull();
      expect(extractYouTubeId('https://google.com')).toBeNull();
      expect(extractYouTubeId('not-a-valid-youtube-url')).toBeNull();
    });
  });

  describe('formatSecondsToTime', () => {
    it('formats seconds below 1 minute as MM:SS', () => {
      expect(formatSecondsToTime(15)).toBe('00:15');
      expect(formatSecondsToTime(0)).toBe('00:00');
    });

    it('formats minutes and seconds as MM:SS', () => {
      expect(formatSecondsToTime(85)).toBe('01:25');
      expect(formatSecondsToTime(599)).toBe('09:59');
    });

    it('formats hours correctly as HH:MM:SS', () => {
      expect(formatSecondsToTime(3600)).toBe('01:00:00');
      expect(formatSecondsToTime(3665)).toBe('01:01:05');
    });

    it('handles negative or invalid seconds gracefully by clamping to 0', () => {
      expect(formatSecondsToTime(-10)).toBe('00:00');
    });
  });

  describe('parseTimeToSeconds', () => {
    it('parses MM:SS format accurately', () => {
      expect(parseTimeToSeconds('00:15')).toBe(15);
      expect(parseTimeToSeconds('01:30')).toBe(90);
      expect(parseTimeToSeconds('12:45')).toBe(765);
    });

    it('parses HH:MM:SS format accurately', () => {
      expect(parseTimeToSeconds('01:00:00')).toBe(3600);
      expect(parseTimeToSeconds('00:02:15')).toBe(135);
    });

    it('parses raw seconds strings', () => {
      expect(parseTimeToSeconds('45')).toBe(45);
      expect(parseTimeToSeconds('120')).toBe(120);
    });

    it('returns null for invalid time strings', () => {
      expect(parseTimeToSeconds('')).toBeNull();
      expect(parseTimeToSeconds('invalid')).toBeNull();
      expect(parseTimeToSeconds('12:xx')).toBeNull();
      expect(parseTimeToSeconds('-50')).toBeNull();
    });
  });

  describe('generateSubtitleWordsForHook', () => {
    it('breaks phrase into uppercase words with sequential timestamps', () => {
      const words = generateSubtitleWordsForHook('This is a viral hook', 30);
      expect(words.length).toBe(5);
      expect(words[0].word).toBe('THIS');
      expect(words[1].word).toBe('IS');
      expect(words[0].start).toBe(0);
      expect(words[0].end).toBeGreaterThan(0);
      expect(words[1].start).toBe(words[0].end);
    });

    it('handles empty or punctuation-only strings safely', () => {
      expect(generateSubtitleWordsForHook('')).toEqual([]);
      expect(generateSubtitleWordsForHook('!@#$%')).toEqual([]);
    });

    it('preserves apostrophes in words like "can\'t" or "it\'s"', () => {
      const words = generateSubtitleWordsForHook("It's what you can't ignore", 20);
      expect(words[0].word).toBe("IT'S");
      expect(words[3].word).toBe("CAN'T");
    });
  });

  describe('fetchYouTubeMetadata', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns parsed metadata when oEmbed succeeds', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Intro to Large Language Models',
          author_name: 'Andrej Karpathy',
          thumbnail_url: 'https://i.ytimg.com/vi/zjkBMFhNj_g/hqdefault.jpg',
        }),
      });

      const meta = await fetchYouTubeMetadata('https://www.youtube.com/watch?v=zjkBMFhNj_g');
      expect(meta).not.toBeNull();
      expect(meta?.videoId).toBe('zjkBMFhNj_g');
      expect(meta?.title).toBe('Intro to Large Language Models');
      expect(meta?.author).toBe('Andrej Karpathy');
      expect(meta?.thumbnail).toBe('https://i.ytimg.com/vi/zjkBMFhNj_g/hqdefault.jpg');
    });

    it('falls back to default CDN image when oEmbed fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const meta = await fetchYouTubeMetadata('zjkBMFhNj_g');
      expect(meta).not.toBeNull();
      expect(meta?.videoId).toBe('zjkBMFhNj_g');
      expect(meta?.thumbnail).toBe('https://img.youtube.com/vi/zjkBMFhNj_g/hqdefault.jpg');
    });
  });
});
