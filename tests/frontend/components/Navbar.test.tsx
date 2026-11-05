import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../../../src/components/Navbar';
import { UserProfile } from '../../../src/types';

describe('Navbar Component', () => {
  const dummyUser: UserProfile = {
    name: 'Aman Maurya',
    email: 'mauryaaman2000@gmail.com',
    picture: 'https://unavatar.io/mauryaaman2000@gmail.com',
    authenticated: true,
  };

  it('renders the brand wordmark ChopChop.ai and engine ready indicator', () => {
    render(
      <Navbar
        user={dummyUser}
        onSignOut={vi.fn()}
        geminiKey="test-key"
        onOpenKeyModal={vi.fn()}
      />
    );

    expect(screen.getByText(/ChopChop/i)).toBeInTheDocument();
    expect(screen.getByText(/Engine: Ready/i)).toBeInTheDocument();
  });

  it('renders circular avatar and hides the user email in the navbar', () => {
    render(
      <Navbar
        user={dummyUser}
        onSignOut={vi.fn()}
        geminiKey="test-key"
        onOpenKeyModal={vi.fn()}
      />
    );

    // Profile picture should be in DOM
    const avatar = screen.getByAltText(/Gmail Profile/i);
    expect(avatar).toBeInTheDocument();
    expect(avatar.className).toContain('rounded-full');

    // Email address must NOT be visible in navbar
    expect(screen.queryByText('mauryaaman2000@gmail.com')).not.toBeInTheDocument();
  });

  it('opens dropdown menu on avatar click and triggers sign out', () => {
    const handleSignOut = vi.fn();
    render(
      <Navbar
        user={dummyUser}
        onSignOut={handleSignOut}
        geminiKey="test-key"
        onOpenKeyModal={vi.fn()}
      />
    );

    const button = screen.getByLabelText(/User profile menu/i);
    fireEvent.click(button);

    // Menu should now be open
    expect(screen.getByText(/Google Sign-In Active/i)).toBeInTheDocument();
    const signOutBtn = screen.getByText(/Sign Out/i);
    expect(signOutBtn).toBeInTheDocument();

    fireEvent.click(signOutBtn);
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });
});
