import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyModal } from '../../../src/components/KeyModal';

describe('KeyModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <KeyModal
        isOpen={false}
        onClose={vi.fn()}
        geminiKey="test-key"
        onSaveKey={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders input with current key and saves on submit', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <KeyModal
        isOpen={true}
        onClose={handleClose}
        geminiKey="AIzaSyOriginal"
        onSaveKey={handleSave}
      />
    );

    const input = screen.getByPlaceholderText(/AIzaSy.../i);
    expect(input).toHaveValue('AIzaSyOriginal');

    fireEvent.change(input, { target: { value: 'AIzaSyUpdatedKey' } });
    const saveBtn = screen.getByRole('button', { name: /Save Key for Session/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith('AIzaSyUpdatedKey');
  });
});
