import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChopStudio } from '../../../src/components/ChopStudio';

describe('ChopStudio Main Workspace Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        title: 'Mock Video Title',
        author_name: 'Mock Channel',
        thumbnail_url: 'https://img.youtube.com/vi/zjkBMFhNj_g/hqdefault.jpg',
      }),
    }));
  });

  it('renders brand headline and tagline', () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    expect(
      screen.getByText(/Turn fat videos into viral Shorts in 1 chop/i)
    ).toBeInTheDocument();
  });

  it('renders YouTube URL input field with initial preset', () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Paste any YouTube link/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('https://www.youtube.com/watch?v=zjkBMFhNj_g');
  });

  it('renders aspect ratio options including 9:16 Vertical Short by default', () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    expect(screen.getByText(/Vertical Short/i)).toBeInTheDocument();
    expect(screen.getByText(/Square Feed/i)).toBeInTheDocument();
    expect(screen.getByText(/Original/i)).toBeInTheDocument();
  });

  it('renders maximum viral hooks and allows clicking a hook card to update review range', async () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    // Wait for initial hooks to load
    await waitFor(
      () => {
        expect(screen.getByText(/The Contrarian Truth Nobody Admits/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    const secondHookTitle = screen.getByText(/The 3-Second Rule That Changes Everything/i);
    expect(secondHookTitle).toBeInTheDocument();

    // Click on the second hook card
    fireEvent.click(secondHookTitle.closest('div[class*="rounded-xl"]')!);

    // Check that active review banner displays updated hook range
    await waitFor(
      () => {
        expect(screen.getByText(/01:15 - 01:48/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('allows switching between AI detection and manual timestamp controls', () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    const manualTabBtn = screen.getByText(/Custom Timestamp Range/i);
    fireEvent.click(manualTabBtn);

    expect(screen.getByText(/Dual Range Manual Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/\+15s Hook/i)).toBeInTheDocument();
    expect(screen.getByText(/\+30s Short/i)).toBeInTheDocument();
  });

  it('toggles playback with pause and play buttons in Live Viewport', () => {
    render(<ChopStudio geminiKey="test-key" onOpenKeyModal={vi.fn()} />);

    const pauseBtn = screen.getByRole('button', { name: 'Pause Clip' });
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);

    const playBtn = screen.getByRole('button', { name: 'Play Clip' });
    expect(playBtn).toBeInTheDocument();
  });
});
