import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthGate } from '../../../src/components/AuthGate';

describe('AuthGate Component', () => {
  it('renders Google sign in button and value propositions', () => {
    render(<AuthGate onSignIn={vi.fn()} />);

    expect(screen.getByText(/Turn fat videos into viral Shorts in 1 chop/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini 1.5 Flash/i)).toBeInTheDocument();
  });

  it('invokes onSignIn callback when clicking Sign in with Google', () => {
    const handleSignIn = vi.fn();
    render(<AuthGate onSignIn={handleSignIn} />);

    const signInBtn = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    expect(handleSignIn).toHaveBeenCalledTimes(1);
    expect(handleSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticated: true,
        email: expect.stringContaining('@gmail.com'),
      })
    );
  });
});
